import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  loadingArr: [] as boolean[],
};

export const loaderSlice = createSlice({
  initialState,
  name: 'loading',
  reducers: {
    updateLoadingState(state, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.loadingArr.push(true);
        state.loading = true;
      } else {
        state.loadingArr.pop();
      }
      console.log(state.loading);
      if (state.loadingArr.length === 0) {
        state.loading = false;
      }
    },
  },
});

export default loaderSlice.reducer;

export const { updateLoadingState } = loaderSlice.actions;
