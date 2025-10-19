import { useState, useCallback } from 'react';

interface UseYogaLoaderReturn {
  isLoading: boolean;
  showLoader: (message?: string, duration?: number) => void;
  hideLoader: () => void;
  setLoading: (loading: boolean) => void;
}

export const useYogaLoader = (): UseYogaLoaderReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = useCallback((message?: string, duration?: number) => {
    setIsLoading(true);
    
    if (duration) {
      setTimeout(() => {
        setIsLoading(false);
      }, duration);
    }
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    showLoader,
    hideLoader,
    setLoading
  };
};

export default useYogaLoader;