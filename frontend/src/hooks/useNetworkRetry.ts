import { useCallback } from 'react';

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

export const useNetworkRetry = (config: Partial<RetryConfig> = {}) => {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = config;

  const retry = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as Error;

          if (attempt < maxRetries) {
            const waitTime = delayMs * Math.pow(backoffMultiplier, attempt);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      throw lastError;
    },
    [maxRetries, delayMs, backoffMultiplier]
  );

  return { retry };
};

/**
 * Hook for handling offline/online status
 */
export const useOnline = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

import React from 'react';
