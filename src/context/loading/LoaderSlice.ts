import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
};

export const loaderSlice = createSlice({
  initialState,
  name: 'loading',
  reducers: {
    updateLoadingState(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export default loaderSlice.reducer;

export const { updateLoadingState } = loaderSlice.actions;
