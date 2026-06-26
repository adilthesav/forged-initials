import { useCallback, useMemo, useRef } from 'react';

/**
 * Optimized state management hooks to prevent unnecessary re-renders
 */

/**
 * Debounced callback hook - prevents excessive function calls
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Throttled callback hook - limits function call frequency
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Memoized calculation hook - caches expensive computations
 */
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: any[]
): T {
  return useMemo(() => calculation(), dependencies);
}

/**
 * Stable callback hook - prevents callback identity changes
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  callbackRef.current = callback;

  // Return stable callback that calls the latest version
  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Local storage hook with memoization
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage
  const storedValue = useMemo(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // Return a memoized setter
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch custom event to sync across tabs
        window.dispatchEvent(new CustomEvent('localStorage-change', {
          detail: { key, value: valueToStore }
        }));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Previous value hook - tracks previous state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  const previous = ref.current;
  ref.current = value;
  
  return previous;
}

/**
 * Compare memo hook - only re-renders if comparison returns true
 */
export function useCompareMemo<T>(
  value: T,
  compareFn: (prev: T | undefined, next: T) => boolean
): T {
  const ref = useRef<T>(value);
  
  if (compareFn(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Array memoization - prevents array recreation if contents haven't changed
 */
export function useMemoizedArray<T>(array: T[], compareFn?: (a: T, b: T) => boolean): T[] {
  const prevArray = useRef<T[]>(array);
  
  return useMemo(() => {
    // If lengths are different, arrays are different
    if (prevArray.current.length !== array.length) {
      prevArray.current = array;
      return array;
    }
    
    // Check if items are different
    const isDifferent = array.some((item, index) => {
      if (compareFn) {
        return !compareFn(prevArray.current[index], item);
      }
      return prevArray.current[index] !== item;
    });
    
    if (isDifferent) {
      prevArray.current = array;
      return array;
    }
    
    return prevArray.current;
  }, [array, compareFn]);
}

/**
 * Object memoization - prevents object recreation if properties haven't changed
 */
export function useMemoizedObject<T extends object>(obj: T): T {
  const prevObj = useRef<T>(obj);
  
  return useMemo(() => {
    const keys = Object.keys(obj) as (keyof T)[];
    const prevKeys = Object.keys(prevObj.current) as (keyof T)[];
    
    // If number of keys is different, objects are different
    if (keys.length !== prevKeys.length) {
      prevObj.current = obj;
      return obj;
    }
    
    // Check if any values are different
    const isDifferent = keys.some(key => prevObj.current[key] !== obj[key]);
    
    if (isDifferent) {
      prevObj.current = obj;
      return obj;
    }
    
    return prevObj.current;
  }, [obj]);
}
