import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UgixLayer } from '../../types/UgixLayers';
import { FeatureStyle } from '../../types/FeatureStyle';

type GsixLayerState = {
  layers: UgixLayer[];
};

const initialState: GsixLayerState = {
  layers: [],
};

export const gsixLayerSlice = createSlice({
  name: 'gsixLayers',
  initialState,
  reducers: {
    addGsixLayer(state, action) {
      state.layers.push(action.payload);
    },
    updateGsixLayer(state, action) {
      state.layers[action.payload.index] = action.payload.modifiedLayer;
    },
    deleteGsixLayer(state, { payload }) {
      state.layers = state.layers.filter((layer) => {
        return layer.layerId !== payload;
      });
    },
    updateGsixLayerColor(
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
  },
});

export const {
  addGsixLayer,
  deleteGsixLayer,
  updateGsixLayer,
  updateGsixLayerColor,
} = gsixLayerSlice.actions;
export default gsixLayerSlice.reducer;
