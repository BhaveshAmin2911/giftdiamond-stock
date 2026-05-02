import { createSlice } from "@reduxjs/toolkit";

const boxesSlice = createSlice({
  name: "boxes",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setBoxes: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setBoxes } = boxesSlice.actions;
export default boxesSlice.reducer;