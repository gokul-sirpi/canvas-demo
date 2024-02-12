import { configureStore } from '@reduxjs/toolkit';
import userLayerSlice from './userLayers/userLayerSlice';
import gsixLayerSlice from './gsixLayers/gsixLayerSlice';
import LoaderSlice from './loading/LoaderSlice';

export const store = configureStore({
  reducer: {
    userLayer: userLayerSlice,
    gsixLayer: gsixLayerSlice,
    loading: LoaderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
