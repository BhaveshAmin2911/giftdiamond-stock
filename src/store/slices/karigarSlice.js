import { createSlice } from "@reduxjs/toolkit";

const karigarSlice = createSlice({
  name: "karigars",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setKarigars: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setKarigars } = karigarSlice.actions;
export default karigarSlice.reducer;