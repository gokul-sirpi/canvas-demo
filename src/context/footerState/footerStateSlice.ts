import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';

type FooterStateType = {
  footerShown: boolean;
  canvasLayer: UserLayer | UgixLayer | null;
};
const initialState: FooterStateType = {
  footerShown: false,
  canvasLayer: null,
};

export const footerStateSlice = createSlice({
  initialState,
  name: 'footerState',
  reducers: {
    updateFooterShownState(state, action: PayloadAction<boolean>) {
      state.footerShown = action.payload;
    },
    updateFooterLayerState(
      state,
      action: PayloadAction<UserLayer | UgixLayer>
    ) {
      state.canvasLayer = action.payload;
    },
  },
});

export default footerStateSlice.reducer;

export const { updateFooterShownState, updateFooterLayerState } =
  footerStateSlice.actions;
