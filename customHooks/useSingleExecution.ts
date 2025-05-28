import { useCallback, useRef } from 'react';

export function useSingleExecution(method: () => void) {
  const isExecutedRef = useRef(false);
  return useCallback(() => {
    if (!isExecutedRef.current) {
      method();
      isExecutedRef.current = true;
    }
  }, [method]);
}
