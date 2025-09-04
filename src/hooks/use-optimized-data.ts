"use client";

import React from 'react';
interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
}

class DataCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config;
  }

  set(key: string, data: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttl,
    };

    // If cache is full, remove oldest entries
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UseOptimizedDataOptions<T> {
  cacheConfig?: CacheConfig;
  enablePagination?: boolean;
  pageSize?: number;
  enableBackgroundRefetch?: boolean;
  refetchInterval?: number;
}

interface UseOptimizedDataResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  setPage: (page: number) => void;
  clearCache: () => void;
}

export function useOptimizedData<T>(
  fetchFunction: (params?: PaginationParams) => Promise<{ data: T[]; total: number }>,
  dependencies: any[] = [],
  options: UseOptimizedDataOptions<T> = {}
): UseOptimizedDataResult<T> {
  const {
    cacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 },
    enablePagination = true,
    pageSize = 20,
    enableBackgroundRefetch = false,
    refetchInterval = 30000,
  } = options;

  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);

  const cacheRef = React.useRef(new DataCache<T[]>(cacheConfig));
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Generate cache key based on dependencies
  const cacheKey = React.useMemo(() => {
    return JSON.stringify({ deps: dependencies, page, pageSize });
  }, [dependencies, page, pageSize]);

  // Check if data should be loaded from cache
  const shouldLoadFromCache = React.useCallback(() => {
    const cachedData = cacheRef.current.get(cacheKey);
    return cachedData !== null;
  }, [cacheKey]);

  // Load data from cache
  const loadFromCache = React.useCallback(() => {
    const cachedData = cacheRef.current.get(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      return true;
    }
    return false;
  }, [cacheKey]);

  // Fetch data from API
  const fetchData = React.useCallback(async (
    paginationParams?: PaginationParams,
    useCache = true
  ): Promise<void> => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Check cache first
      if (useCache && shouldLoadFromCache()) {
        if (loadFromCache()) {
          return;
        }
      }

      setLoading(true);
      setError(null);

      const params = enablePagination ? {
        page: paginationParams?.page || page,
        limit: paginationParams?.limit || pageSize,
        offset: paginationParams?.offset,
      } : undefined;

      const response = await fetchFunction(params);

      // Cache the response
      if (useCache) {
        cacheRef.current.set(cacheKey, response.data);
      }

      setData(response.data);
      setTotalItems(response.total);
      setHasMore(response.data.length === pageSize);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error('Data fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, pageSize, cacheKey, shouldLoadFromCache, loadFromCache, enablePagination]);

  // Load more data (for infinite scroll)
  const loadMore = React.useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = Math.floor(data.length / pageSize) + 1;

      const params = {
        page: nextPage,
        limit: pageSize,
      };

      const response = await fetchFunction(params);

      if (response.data.length > 0) {
        setData(prev => [...prev, ...response.data]);
        setHasMore(response.data.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, hasMore, loading, data.length, pageSize]);

  // Set page for pagination
  const setPageNumber = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Refetch data
  const refetch = React.useCallback(async () => {
    await fetchData(undefined, false);
  }, [fetchData]);

  // Clear cache
  const clearCache = React.useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Set up background refetching
  React.useEffect(() => {
    if (enableBackgroundRefetch && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(undefined, false);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enableBackgroundRefetch, refetchInterval, fetchData]);

  // Initial data load and dependency changes
  React.useEffect(() => {
    fetchData();
  }, dependencies);

  // Page changes
  React.useEffect(() => {
    if (page > 1) {
      fetchData({ page, limit: pageSize });
    }
  }, [page, fetchData, pageSize]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    loading,
    error,
    pagination: {
      page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    refetch,
    loadMore,
    setPage: setPageNumber,
    clearCache,
  };
}

// Hook for debounced search
export function useDebouncedSearch(
  searchFunction: (query: string) => Promise<any[]>,
  delay: number = 300
) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const search = React.useCallback(async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchFunction(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [searchFunction]);

  const debouncedSearch = React.useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
      } else {
        setResults([]);
      }
    }, delay);
  }, [search, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    error,
    search: debouncedSearch,
    clearResults: () => setResults([]),
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  updateFunction: (data: T) => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
) {
  const [optimisticData, setOptimisticData] = React.useState<T | null>(null);
  const [updating, setUpdating] = React.useState(false);

  const update = React.useCallback(async (data: T) => {
    try {
      setUpdating(true);
      setOptimisticData(data);

      const result = await updateFunction(data);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      setOptimisticData(null);

      if (onError) {
        onError(error as Error);
      }

      throw error;
    } finally {
      setUpdating(false);
      setOptimisticData(null);
    }
  }, [updateFunction, onSuccess, onError]);

  return {
    update,
    updating,
    optimisticData,
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
}

class DataCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config;
  }

  set(key: string, data: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttl,
    };

    // If cache is full, remove oldest entries
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UseOptimizedDataOptions<T> {
  cacheConfig?: CacheConfig;
  enablePagination?: boolean;
  pageSize?: number;
  enableBackgroundRefetch?: boolean;
  refetchInterval?: number;
}

interface UseOptimizedDataResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  setPage: (page: number) => void;
  clearCache: () => void;
}

export function useOptimizedData<T>(
  fetchFunction: (params?: PaginationParams) => Promise<{ data: T[]; total: number }>,
  dependencies: any[] = [],
  options: UseOptimizedDataOptions<T> = {}
): UseOptimizedDataResult<T> {
  const {
    cacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 },
    enablePagination = true,
    pageSize = 20,
    enableBackgroundRefetch = false,
    refetchInterval = 30000,
  } = options;

  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);

  const cacheRef = React.useRef(new DataCache<T[]>(cacheConfig));
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Generate cache key based on dependencies
  const cacheKey = React.useMemo(() => {
    return JSON.stringify({ deps: dependencies, page, pageSize });
  }, [dependencies, page, pageSize]);

  // Check if data should be loaded from cache
  const shouldLoadFromCache = React.useCallback(() => {
    const cachedData = cacheRef.current.get(cacheKey);
    return cachedData !== null;
  }, [cacheKey]);

  // Load data from cache
  const loadFromCache = React.useCallback(() => {
    const cachedData = cacheRef.current.get(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      return true;
    }
    return false;
  }, [cacheKey]);

  // Fetch data from API
  const fetchData = React.useCallback(async (
    paginationParams?: PaginationParams,
    useCache = true
  ): Promise<void> => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Check cache first
      if (useCache && shouldLoadFromCache()) {
        if (loadFromCache()) {
          return;
        }
      }

      setLoading(true);
      setError(null);

      const params = enablePagination ? {
        page: paginationParams?.page || page,
        limit: paginationParams?.limit || pageSize,
        offset: paginationParams?.offset,
      } : undefined;

      const response = await fetchFunction(params);

      // Cache the response
      if (useCache) {
        cacheRef.current.set(cacheKey, response.data);
      }

      setData(response.data);
      setTotalItems(response.total);
      setHasMore(response.data.length === pageSize);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error('Data fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, pageSize, cacheKey, shouldLoadFromCache, loadFromCache, enablePagination]);

  // Load more data (for infinite scroll)
  const loadMore = React.useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = Math.floor(data.length / pageSize) + 1;

      const params = {
        page: nextPage,
        limit: pageSize,
      };

      const response = await fetchFunction(params);

      if (response.data.length > 0) {
        setData(prev => [...prev, ...response.data]);
        setHasMore(response.data.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, hasMore, loading, data.length, pageSize]);

  // Set page for pagination
  const setPageNumber = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Refetch data
  const refetch = React.useCallback(async () => {
    await fetchData(undefined, false);
  }, [fetchData]);

  // Clear cache
  const clearCache = React.useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Set up background refetching
  React.useEffect(() => {
    if (enableBackgroundRefetch && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(undefined, false);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enableBackgroundRefetch, refetchInterval, fetchData]);

  // Initial data load and dependency changes
  React.useEffect(() => {
    fetchData();
  }, dependencies);

  // Page changes
  React.useEffect(() => {
    if (page > 1) {
      fetchData({ page, limit: pageSize });
    }
  }, [page, fetchData, pageSize]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    loading,
    error,
    pagination: {
      page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    refetch,
    loadMore,
    setPage: setPageNumber,
    clearCache,
  };
}

// Hook for debounced search
export function useDebouncedSearch(
  searchFunction: (query: string) => Promise<any[]>,
  delay: number = 300
) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const search = React.useCallback(async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchFunction(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [searchFunction]);

  const debouncedSearch = React.useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
      } else {
        setResults([]);
      }
    }, delay);
  }, [search, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    error,
    search: debouncedSearch,
    clearResults: () => setResults([]),
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  updateFunction: (data: T) => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
) {
  const [optimisticData, setOptimisticData] = React.useState<T | null>(null);
  const [updating, setUpdating] = React.useState(false);

  const update = React.useCallback(async (data: T) => {
    try {
      setUpdating(true);
      setOptimisticData(data);

      const result = await updateFunction(data);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      setOptimisticData(null);

      if (onError) {
        onError(error as Error);
      }

      throw error;
    } finally {
      setUpdating(false);
      setOptimisticData(null);
    }
  }, [updateFunction, onSuccess, onError]);

  return {
    update,
    updating,
    optimisticData,
  };
}
