import { createSlice } from '@reduxjs/toolkit';
import { GsixLayer } from '../../types/gsixLayers';

type GsixLayerState = {
  layers: GsixLayer[];
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
    updateGsixLayerColor(state, action) {
      const updatedLayers = state.layers.map((layer) => {
        if (layer.layerId === action.payload.layerId) {
          layer.layerColor = action.payload.newColor;
        }
        return layer;
      });
      console.log(updatedLayers)
      state.layers = updatedLayers;
    },
  },
});

export const { addGsixLayer, deleteGsixLayer, updateGsixLayer, updateGsixLayerColor } =
  gsixLayerSlice.actions;
export default gsixLayerSlice.reducer;
