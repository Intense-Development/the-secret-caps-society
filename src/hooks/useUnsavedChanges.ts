import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to detect unsaved changes in forms
 * Warns before page unload and can be used to show confirmation dialogs
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Keep ref in sync
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Warn before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but we can still set returnValue
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  /**
   * Check if there are unsaved changes
   */
  const checkUnsavedChanges = useCallback((): boolean => {
    return hasUnsavedChangesRef.current;
  }, []);

  return {
    hasUnsavedChanges,
    checkUnsavedChanges,
  };
}

