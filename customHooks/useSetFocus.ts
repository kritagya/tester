// Custom hook to set focus on elements based on selector and optional index
import { useEffect, useRef } from 'react';

interface UseSetFocusProps {
  selector: string;
  index?: number;
  delay?: number;
}

const useSetFocus = ({ selector, index, delay = 0 }: UseSetFocusProps) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const focusElement = (): boolean => {
      const elements = document.querySelectorAll<HTMLElement>(selector);

      if (elements.length === 0) {
        return false;
      }

      let targetElement: HTMLElement | null = null;

      if (typeof index === 'number') {
        if (index >= 0 && index < elements.length) {
          targetElement = elements[index];
        }
      } else {
        return false;
      }

      if (targetElement) {
        targetElement.focus();
        elementRef.current = targetElement;
        return true;
      }

      return false;
    };

    // Clear any existing interval from previous runs
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initial delay before starting to look for the element
    const timeoutId = window.setTimeout(() => {
      if (focusElement()) {
        return;
      }

      let attempts = 1;
      const maxAttempts = 50;

      intervalRef.current = window.setInterval(() => {
        if (focusElement()) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 100);
    }, delay);

    // Cleanup function
    return () => {
      window.clearTimeout(timeoutId);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selector, index, delay]);
  return { elementRef };
};

export default useSetFocus;
