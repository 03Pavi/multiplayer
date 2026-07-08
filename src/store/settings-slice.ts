import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: string;
  notificationsEnabled: boolean;
  accessibilityMode: boolean;
}

const initialState: SettingsState = {
  soundEnabled: true,
  musicEnabled: false,
  language: "en-us",
  notificationsEnabled: true,
  accessibilityMode: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleMusic: (state) => {
      state.musicEnabled = !state.musicEnabled;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleAccessibility: (state) => {
      state.accessibilityMode = !state.accessibilityMode;
    },
  },
});

export const {
  toggleSound,
  toggleMusic,
  setLanguage,
  toggleNotifications,
  toggleAccessibility,
} = settingsSlice.actions;

export default settingsSlice.reducer;
