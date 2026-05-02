import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setCategory: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;