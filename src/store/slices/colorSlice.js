import { createSlice } from "@reduxjs/toolkit";

const colorSlice = createSlice({
  name: "colors",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setColors: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setColors } = colorSlice.actions;
export default colorSlice.reducer;