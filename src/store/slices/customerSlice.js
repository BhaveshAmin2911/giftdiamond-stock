import { createSlice } from "@reduxjs/toolkit";

const customerSlice = createSlice({
  name: "customers",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setCustomers: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setCustomers } = customerSlice.actions;
export default customerSlice.reducer;