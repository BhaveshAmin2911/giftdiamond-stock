import { createSlice } from "@reduxjs/toolkit";

const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    data: null,
    loaded: false
  },
  reducers: {
    setuserData: (state, action) => {
      state.data = action.payload;
      state.loaded = true;
    }
  }
});

export const { setuserData } = userDataSlice.actions;
export default userDataSlice.reducer;