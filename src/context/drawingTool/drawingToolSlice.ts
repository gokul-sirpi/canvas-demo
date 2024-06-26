import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DrawType } from '../../types/UserLayer';

const initialState = {
  drawing: false,
  currDrawingTool: 'None' as DrawType | 'None',
};

export const drawingToolSlice = createSlice({
  initialState,
  name: 'drawingTool',
  reducers: {
    updateDrawingTool(state, action: PayloadAction<DrawType | 'None'>) {
      state.currDrawingTool = action.payload;
    },
  },
});

export default drawingToolSlice.reducer;

export const { updateDrawingTool } = drawingToolSlice.actions;
