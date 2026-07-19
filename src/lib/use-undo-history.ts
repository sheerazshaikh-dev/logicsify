import { useCallback, useRef, useState } from "react";

/**
 * Lightweight editor history. CMS form updates are immutable, so snapshots can
 * safely reuse their object references without cloning multi-megabyte page data
 * on every keystroke.
 */
export function useUndoHistory<T>(limit = 20) {
  const [value, setValueState] = useState<T | null>(null);
  const entriesRef = useRef<T[]>([]);
  const indexRef = useRef(-1);
  const lastChangeRef = useRef(0);
  const [, setVersion] = useState(0);

  const reset = useCallback((next: T | null) => {
    if (next === null) {
      entriesRef.current = [];
      indexRef.current = -1;
      setValueState(null);
    } else {
      entriesRef.current = [next];
      indexRef.current = 0;
      setValueState(next);
    }
    lastChangeRef.current = 0;
    setVersion((current) => current + 1);
  }, []);

  const change = useCallback(
    (next: T) => {
      const current = entriesRef.current[indexRef.current];
      if (current === next) return;

      const now = Date.now();
      const shouldGroup =
        indexRef.current === entriesRef.current.length - 1 &&
        indexRef.current > 0 &&
        now - lastChangeRef.current < 700;

      if (shouldGroup) {
        entriesRef.current[indexRef.current] = next;
      } else {
        entriesRef.current = entriesRef.current.slice(0, indexRef.current + 1);
        entriesRef.current.push(next);
        if (entriesRef.current.length > limit) entriesRef.current.shift();
        indexRef.current = entriesRef.current.length - 1;
      }

      lastChangeRef.current = now;
      setValueState(next);
      setVersion((currentVersion) => currentVersion + 1);
    },
    [limit],
  );

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    setValueState(entriesRef.current[indexRef.current]);
    lastChangeRef.current = 0;
    setVersion((current) => current + 1);
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < 0 || indexRef.current >= entriesRef.current.length - 1) return;
    indexRef.current += 1;
    setValueState(entriesRef.current[indexRef.current]);
    lastChangeRef.current = 0;
    setVersion((current) => current + 1);
  }, []);

  return {
    value,
    change,
    reset,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current >= 0 && indexRef.current < entriesRef.current.length - 1,
    historySize: entriesRef.current.length,
  };
}
