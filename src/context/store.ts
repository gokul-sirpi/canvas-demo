import { configureStore } from '@reduxjs/toolkit';
import userLayerSlice from './userLayers/userLayerSlice';
import gsixLayerSlice from './gsixLayers/gsixLayerSlice';

export const store = configureStore({
  reducer: {
    userLayer: userLayerSlice,
    gsixLayer: gsixLayerSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
