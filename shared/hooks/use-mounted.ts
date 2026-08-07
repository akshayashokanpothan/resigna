'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to check if the component is mounted.
 * Useful for resolving hydration mismatches when rendering client-side only UI.
 */
export function useMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}
