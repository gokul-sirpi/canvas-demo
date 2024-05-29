import { configureStore } from '@reduxjs/toolkit';
import ugixLayerSlice from './ugixLayers/ugixLayerSlice';
import LoaderSlice from './loading/LoaderSlice';
import swiperSlice from './SwipeShowing/SwipeSlice';
import canvasLayerSlice from './canvasLayers/canvasLayerSlice';

export const store = configureStore({
  reducer: {
    canvasLayer: canvasLayerSlice,
    ugixLayer: ugixLayerSlice,
    loading: LoaderSlice,
    swipeShown: swiperSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
