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
  name: 'userLayer',
  initialState,
  reducers: {
    addCanvasLayer(state, action) {
      state.layers.push(action.payload);
    },
    updateCanvasLayer(state, action) {
      state.layers[action.payload.index] = action.payload.modifiedLayer;
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
  },
});

export const {
  addCanvasLayer,
  updateCanvasLayer,
  deleteCanvasLayer,
  updateCanvasLayerColor,
  changeCanvasLayer,
  updateLayerFetchingStatus,
} = canvasLayerSlice.actions;
export default canvasLayerSlice.reducer;
