import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserLayer } from '../../types/UserLayer';
import { FeatureStyle } from '../../types/FeatureStyle';
import { UgixLayer } from '../../types/UgixLayers';
type CanvasLayerState = {
  layers: (UserLayer | UgixLayer)[];
};

const initialState: CanvasLayerState = {
  layers: [],
};

export const canvasLayerSlice = createSlice({
  name: 'canvasLayer',
  initialState,
  reducers: {
    addCanvasLayer(state, action) {
      state.layers.push(action.payload);
    },
    updateCanvasLayer(state, action) {
      state.layers[action.payload.index] = action.payload.modifiedLayer;
    },
    updateLayerMarkerIcon(
      state,
      action: PayloadAction<{ index: number; id: number }>
    ) {
      const { index, id } = action.payload;
      if (state.layers[index] && state.layers[index].style) {
        state.layers[index].style['marker-id'] = id;
      }
    },
    deleteCanvasLayer(state, { payload }) {
      state.layers = state.layers.filter((layer) => {
        return layer.layerId !== payload;
      });
    },
    updateCanvasLayerColor(
      state,
      action: PayloadAction<{
        layerId: string;
        newColor: string;
        style: FeatureStyle;
      }>
    ) {
      const updatedLayers = state.layers.map((layer) => {
        if (layer.layerId === action.payload.layerId) {
          layer.layerColor = action.payload.newColor;
          layer.style = action.payload.style;
        }
        return layer;
      });
      state.layers = updatedLayers;
    },
    updateLayerFetchingStatus(state, action) {
      for (const layer of state.layers) {
        if (layer.layerId === action.payload) {
          if (layer.layerType === 'UgixLayer') {
            layer.fetching = false;
          }
        }
      }
    },
    changeCanvasLayer(state, action: PayloadAction<(UserLayer | UgixLayer)[]>) {
      state.layers = action.payload;
    },

    updateLayerSides(
      state,
      action: PayloadAction<{
        rightIds: string[];
        leftIds: string[];
        middleIds: string[];
      }>
    ) {
      const { rightIds, leftIds, middleIds } = action.payload;
      state.layers.forEach((layer) => {
        if (rightIds.includes(layer.layerId)) {
          layer.side = 'right';
        }
        if (leftIds.includes(layer.layerId)) {
          layer.side = 'left';
        }
        if (middleIds.includes(layer.layerId)) {
          layer.side = 'middle';
        }
      });
    },
  },
});

export const {
  addCanvasLayer,
  updateCanvasLayer,
  deleteCanvasLayer,
  updateCanvasLayerColor,
  changeCanvasLayer,
  updateLayerFetchingStatus,
  updateLayerSides,
  updateLayerMarkerIcon,
} = canvasLayerSlice.actions;
export default canvasLayerSlice.reducer;
