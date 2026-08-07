'use client';

import { useEffect, useRef } from 'react';

/**
 * Attaches a keyboard shortcut listener to the window.
 * Respects meta (macOS) and ctrl (Windows/Linux).
 *
 * @example
 * useKeyboardShortcut({ key: 'k', meta: true }, () => openPalette())
 */
interface ShortcutOptions {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  callback: (event: KeyboardEvent) => void,
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const metaMatch = options.meta ? event.metaKey || event.ctrlKey : true;
      const ctrlMatch = options.ctrl ? event.ctrlKey : true;
      const shiftMatch = options.shift ? event.shiftKey : true;
      const altMatch = options.alt ? event.altKey : true;
      const keyMatch = event.key.toLowerCase() === options.key.toLowerCase();

      if (metaMatch && ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        callbackRef.current(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options.key, options.meta, options.ctrl, options.shift, options.alt]);
}
