import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UgixLayer } from '../../types/UgixLayers';
import { FeatureStyle } from '../../types/FeatureStyle';

type UgixLayerState = {
  layers: UgixLayer[];
};

const initialState: UgixLayerState = {
  layers: [],
};

export const ugixLayerSlice = createSlice({
  name: 'ugixLayers',
  initialState,
  reducers: {
    addUgixLayer(state, action) {
      state.layers.push(action.payload);
    },
    updateUgixLayer(state, action) {
      state.layers[action.payload.index] = action.payload.modifiedLayer;
    },
    deleteUgixLayer(state, { payload }) {
      state.layers = state.layers.filter((layer) => {
        return layer.layerId !== payload;
      });
    },
    updateUgixLayerColor(
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
  addUgixLayer,
  deleteUgixLayer,
  updateUgixLayer,
  updateUgixLayerColor,
} = ugixLayerSlice.actions;

export default ugixLayerSlice.reducer;
