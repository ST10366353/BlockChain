/**
 * Safe timer utilities to prevent memory leaks
 */

export interface TimerRef {
  current: NodeJS.Timeout | null;
}

// Safe setTimeout that can be cancelled
export function safeSetTimeout(
  callback: () => void,
  delay: number,
  timerRef?: TimerRef
): NodeJS.Timeout {
  // Clear any existing timer
  if (timerRef && timerRef.current) {
    clearTimeout(timerRef.current);
  }

  const timeout = setTimeout(() => {
    if (timerRef) {
      timerRef.current = null;
    }
    callback();
  }, delay);

  if (timerRef) {
    timerRef.current = timeout;
  }

  return timeout;
}

// Safe setInterval that can be cancelled
export function safeSetInterval(
  callback: () => void,
  delay: number,
  timerRef?: TimerRef
): NodeJS.Timeout {
  // Clear any existing timer
  if (timerRef && timerRef.current) {
    clearInterval(timerRef.current);
  }

  const interval = setInterval(callback, delay);

  if (timerRef) {
    timerRef.current = interval;
  }

  return interval;
}

// Safe clearTimeout
export function safeClearTimeout(timerRef?: TimerRef): void {
  if (timerRef && timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

// Safe clearInterval
export function safeClearInterval(timerRef?: TimerRef): void {
  if (timerRef && timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
}

// Clear all timers in a ref array
export function clearAllTimers(timerRefs: TimerRef[]): void {
  timerRefs.forEach(ref => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  });
}

// React hook for managing timers with cleanup
export function useTimeout(callback: () => void, delay: number): () => void {
  const timeoutRef = { current: null as NodeJS.Timeout | null };

  const cancel = () => safeClearTimeout(timeoutRef);

  safeSetTimeout(callback, delay, timeoutRef);

  return cancel;
}

// React hook for managing intervals with cleanup
export function useInterval(callback: () => void, delay: number): () => void {
  const intervalRef = { current: null as NodeJS.Timeout | null };

  const cancel = () => safeClearInterval(intervalRef);

  safeSetInterval(callback, delay, intervalRef);

  return cancel;
}
