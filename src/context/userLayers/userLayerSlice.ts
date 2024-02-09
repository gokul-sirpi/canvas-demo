import { createSlice } from '@reduxjs/toolkit';
import { UserLayer } from '../../types/UserLayer';
type UserLayerState = {
  layers: UserLayer[];
};

const initialState: UserLayerState = {
  layers: [],
};

export const userLayerSlice = createSlice({
  name: 'userLayer',
  initialState,
  reducers: {
    addUserLayer(state, action) {
      state.layers.push(action.payload);
    },
    updateUserLayer(state, action) {
      state.layers[action.payload.index] = action.payload.modifiedLayer;
    },
    deleteUserLayer(state, { payload }) {
      state.layers = state.layers.filter((layer) => {
        return layer.layerId !== payload;
      });
    },
    updateLayerColor(state, action) {
      const updatedLayers = state.layers.map((layer) => {
        if (layer.layerId === action.payload.layerId) {
          layer.layerColor = action.payload.newColor;
        }
        return layer;
      });
      state.layers = updatedLayers;
    },
  },
});

export const {
  addUserLayer,
  updateUserLayer,
  deleteUserLayer,
  updateLayerColor,
} = userLayerSlice.actions;
export default userLayerSlice.reducer;
