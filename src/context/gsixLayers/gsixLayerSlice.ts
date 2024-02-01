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
  },
});

export const { addGsixLayer, deleteGsixLayer, updateGsixLayer } =
  gsixLayerSlice.actions;
export default gsixLayerSlice.reducer;
