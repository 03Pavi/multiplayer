import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import authReducer from "./auth-slice";
import roomReducer from "./room-slice";
import gameReducer from "./game-slice";
import settingsReducer from "./settings-slice";
import statusReducer from "./status-slice";

const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: string) {
    return Promise.resolve(value);
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "settings"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
  game: gameReducer,
  settings: settingsReducer,
  status: statusReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/PAUSE",
            "persist/FLUSH",
            "persist/PURGE",
            "persist/REGISTER",
          ],
        },
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];


