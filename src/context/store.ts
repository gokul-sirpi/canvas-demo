import { configureStore } from '@reduxjs/toolkit';
import userLayerSlice from './userLayers/userLayerSlice';

export const store = configureStore({
  reducer: {
    userLayer: userLayerSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
