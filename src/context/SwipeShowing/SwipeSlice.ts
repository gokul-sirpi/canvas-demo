import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  swipeShown: false,
};

export const swiperSlice = createSlice({
  initialState,
  name: 'swiperShown',
  reducers: {
    updateSwipeState(state, action: PayloadAction<boolean>) {
      state.swipeShown = action.payload;
    },
  },
});

export default swiperSlice.reducer;

export const { updateSwipeState } = swiperSlice.actions;
