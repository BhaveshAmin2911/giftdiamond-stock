import { createSlice } from "@reduxjs/toolkit";

const polishSlice = createSlice({
  name: "polish",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setPolish: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setPolish } = polishSlice.actions;
export default polishSlice.reducer;