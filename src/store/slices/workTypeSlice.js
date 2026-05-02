import { createSlice } from "@reduxjs/toolkit";

const workTypeSlice = createSlice({
  name: "workTypes",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setWorkTypes: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setWorkTypes } = workTypeSlice.actions;
export default workTypeSlice.reducer;