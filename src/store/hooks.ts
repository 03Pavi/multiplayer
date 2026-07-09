import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Loading indicator for a single async action, keyed by a thunk's typePrefix.
 * Usage: `const creating = useActionPending(createRoom.typePrefix);`
 */
export const useActionPending = (key: string): boolean =>
  useAppSelector((state) => !!state.status.pending[key]);

/** True if ANY of the given action keys are currently pending. */
export const useAnyActionPending = (...keys: string[]): boolean =>
  useAppSelector((state) => keys.some((k) => !!state.status.pending[k]));

/** Last error message for a given action key (null if none). */
export const useActionError = (key: string): string | null =>
  useAppSelector((state) => state.status.errors[key] ?? null);
