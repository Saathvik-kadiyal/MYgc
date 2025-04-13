import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import uploadReducer from './slices/uploadSlice';
import searchReducer from './slices/searchSlice';
import jobReducer from './slices/jobSlice';
import messageReducer from './slices/messageSlice';
import notificationReducer from './slices/notificationSlice';
import connectionReducer from './slices/connectionSlice';

// Persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'], // Only persist these fields
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
};

const persistedReducer = persistReducer(persistConfig, authReducer);

// Configure store
export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    user: userReducer,
    post: postReducer,
    upload: uploadReducer,
    search: searchReducer,
    jobs: jobReducer,
    messages: messageReducer,
    notifications: notificationReducer,
    connections: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);