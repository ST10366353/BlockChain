import { useState, useEffect, useRef } from 'react';
import { handleAsyncError, withRetry } from './errorHandler';

export interface DataLoaderOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
}

export interface DataLoaderResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export class DataLoader<T> {
  private data: T | null = null;
  private error: string | null = null;
  private isLoading = false;
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private listeners: Set<(result: DataLoaderResult<T>) => void> = new Set();

  constructor(
    private loadFn: () => Promise<T>,
    private options: DataLoaderOptions = {}
  ) {
    this.options = {
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableCache: false,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...options
    };
  }

  async load(cacheKey?: string): Promise<void> {
    // Check cache first
    if (cacheKey && this.options.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.options.cacheTimeout!) {
        this.data = cached.data;
        this.error = null;
        this.notifyListeners();
        return;
      }
    }

    this.isLoading = true;
    this.error = null;
    this.notifyListeners();

    try {
      const result = this.options.enableRetry
        ? await withRetry(
            this.loadFn,
            this.options.maxRetries,
            this.options.retryDelay,
            'Data loading'
          )
        : await this.loadFn();

      this.data = result;
      this.error = null;

      // Cache the result
      if (cacheKey && this.options.enableCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      this.data = null;
      this.error = error instanceof Error ? error.message : 'Failed to load data';
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  subscribe(listener: (result: DataLoaderResult<T>) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getResult());

    return () => {
      this.listeners.delete(listener);
    };
  }

  getResult(): DataLoaderResult<T> {
    return {
      data: this.data,
      error: this.error,
      isLoading: this.isLoading,
      refetch: () => this.load()
    };
  }

  private notifyListeners(): void {
    const result = this.getResult();
    this.listeners.forEach(listener => listener(result));
  }

  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Hook for using data loader in React components
export const useDataLoader = <T>(
  loadFn: () => Promise<T>,
  options?: DataLoaderOptions,
  deps: any[] = []
) => {
  const [result, setResult] = useState<DataLoaderResult<T>>({
    data: null,
    error: null,
    isLoading: true,
    refetch: () => Promise.resolve()
  });

  const dataLoaderRef = useRef<DataLoader<T>>();
  const optionsRef = useRef(options);

  // Create or update data loader when options change
  // Use JSON.stringify to properly compare objects
  const optionsChanged = !optionsRef.current ||
    JSON.stringify(optionsRef.current) !== JSON.stringify(options);

  if (!dataLoaderRef.current || optionsChanged) {
    dataLoaderRef.current = new DataLoader(loadFn, options);
    optionsRef.current = options;
  }

  useEffect(() => {
    const dataLoader = dataLoaderRef.current!;
    const unsubscribe = dataLoader.subscribe(setResult);

    // Initial load
    dataLoader.load();

    return unsubscribe;
  }, deps);

  // Update refetch function to use current data loader
  useEffect(() => {
    setResult(prev => ({
      ...prev,
      refetch: () => dataLoaderRef.current?.load() || Promise.resolve()
    }));
  }, []);

  return result;
};

// Utility for loading multiple data sources in parallel
export const loadMultipleData = async <T>(
  loaders: Array<{
    key: string;
    loader: () => Promise<T>;
    fallback?: T;
  }>
): Promise<Record<string, T>> => {
  const results = await Promise.allSettled(
    loaders.map(({ loader }) => loader())
  );

  const data: Record<string, T> = {};

  results.forEach((result, index) => {
    const { key, fallback } = loaders[index];
    if (result.status === 'fulfilled') {
      data[key] = result.value;
    } else if (fallback !== undefined) {
      data[key] = fallback;
    }
  });

  return data;
};

// Utility for debounced data loading
export const createDebouncedLoader = <T>(
  loadFn: () => Promise<T>,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  let currentPromise: Promise<T> | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<T>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        if (currentPromise) {
          // Wait for current request to complete
          try {
            const result = await currentPromise;
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          // Start new request
          currentPromise = loadFn();
          try {
            const result = await currentPromise;
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            currentPromise = null;
          }
        }
      }, delay);
    });
  };
};
