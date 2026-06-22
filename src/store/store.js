import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import karigarReducer from "./slices/karigarSlice";
import customerReducer from "./slices/customerSlice";
import colorReducer from "./slices/colorSlice";
import sizeReducer from "./slices/sizeSlice";
import polishReducer from "./slices/polishSlice";
import boxesReducer from "./slices/boxesSlice";
import categoryReducer from "./slices/categorySlice";
import workTypeReducer from "./slices/workTypeSlice";
import settingTypeReducer from "./slices/settingTypeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    karigars: karigarReducer,
    customers: customerReducer,
    category: categoryReducer,
    colors: colorReducer,
    size: sizeReducer,
    polish: polishReducer,
    boxes: boxesReducer,
    workTypes: workTypeReducer,
    settingTypes: settingTypeReducer
  }
});