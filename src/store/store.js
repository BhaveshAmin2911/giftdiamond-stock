import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import karigarReducer from "./slices/karigarSlice";
import customerReducer from "./slices/customerSlice";
import colorReducer from "./slices/colorSlice";
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
    boxes: boxesReducer,
    workTypes: workTypeReducer,
    settingTypes: settingTypeReducer
  }
});