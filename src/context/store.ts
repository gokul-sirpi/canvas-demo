import { configureStore } from '@reduxjs/toolkit';
import userLayerSlice from './userLayers/userLayerSlice';
import ugixLayerSlice from './ugixLayers/ugixLayerSlice';
import LoaderSlice from './loading/LoaderSlice';

export const store = configureStore({
  reducer: {
    userLayer: userLayerSlice,
    ugixLayer: ugixLayerSlice,
    loading: LoaderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
