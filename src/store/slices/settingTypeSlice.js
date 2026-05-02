import { createSlice } from "@reduxjs/toolkit";

const settingTypeSlice = createSlice({
  name: "settingTypes",
  initialState: {
    list: [],
    loaded: false
  },
  reducers: {
    setSettingTypes: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    }
  }
});

export const { setSettingTypes } = settingTypeSlice.actions;
export default settingTypeSlice.reducer;