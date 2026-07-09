import { createSlice, isPending, isFulfilled, isRejected, Action } from "@reduxjs/toolkit";

/**
 * Centralized async status tracking.
 *
 * Every createAsyncThunk dispatches `<typePrefix>/pending|fulfilled|rejected`.
 * These matchers record a per-action loading flag and last error keyed by the
 * thunk's typePrefix (e.g. "rooms/create"), so any component can drive a
 * loading indicator with `useActionPending(createRoom.typePrefix)` without each
 * slice having to hand-roll loading booleans.
 */

export interface StatusState {
  pending: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const initialState: StatusState = {
  pending: {},
  errors: {},
};

const prefixOf = (type: string) => type.replace(/\/(pending|fulfilled|rejected)$/, "");

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    clearError: (state, action: { payload: string }) => {
      state.errors[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state, action: Action) => {
        const key = prefixOf(action.type);
        state.pending[key] = true;
        state.errors[key] = null;
      })
      .addMatcher(isFulfilled, (state, action: Action) => {
        state.pending[prefixOf(action.type)] = false;
      })
      .addMatcher(isRejected, (state, action: any) => {
        const key = prefixOf(action.type);
        state.pending[key] = false;
        state.errors[key] = action.error?.message || "Something went wrong";
      });
  },
});

export const { clearError } = statusSlice.actions;
export default statusSlice.reducer;
