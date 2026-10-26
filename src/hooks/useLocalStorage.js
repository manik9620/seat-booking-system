import { useState, useEffect } from 'react';

// same as useState but the value is saved in localStorage
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore, app still works without saving
    }
  }, [key, value]);

  return [value, setValue];
}
