import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserLayer } from '../../types/UserLayer';
import { FeatureStyle } from '../../types/FeatureStyle';
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
    updateUserLayerColor(
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
    changeUserLayer(state, action: PayloadAction<UserLayer[]>) {
      state.layers = action.payload;
    },
  },
});

export const {
  addUserLayer,
  updateUserLayer,
  deleteUserLayer,
  updateUserLayerColor,
  changeUserLayer,
} = userLayerSlice.actions;
export default userLayerSlice.reducer;
