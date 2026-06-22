import { createSlice } from "@reduxjs/toolkit";

const sizeSlice = createSlice({
  name: "size",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setSize: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setSize } = sizeSlice.actions;
export default sizeSlice.reducer;