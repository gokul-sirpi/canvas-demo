import { configureStore } from '@reduxjs/toolkit';
import ugixLayerSlice from './ugixLayers/ugixLayerSlice';
import LoaderSlice from './loading/LoaderSlice';
import swiperSlice from './SwipeShowing/SwipeSlice';
import canvasLayerSlice from './canvasLayers/canvasLayerSlice';
import footerStateSlice from './footerState/footerStateSlice';
import drawingToolSlice from './drawingTool/drawingToolSlice';

export const store = configureStore({
  reducer: {
    canvasLayer: canvasLayerSlice,
    ugixLayer: ugixLayerSlice,
    loading: LoaderSlice,
    swipeShown: swiperSlice,
    footerState: footerStateSlice,
    drawingTool: drawingToolSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
