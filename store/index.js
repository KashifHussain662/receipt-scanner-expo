import { configureStore } from "@reduxjs/toolkit";
import fieldsReducer from "./fieldsSlice";
import vendorsReducer from "./vendorsSlice";

export const store = configureStore({
  reducer: {
    vendors: vendorsReducer,
    fields: fieldsReducer,
  },
});

export default store;
