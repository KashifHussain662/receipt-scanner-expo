import { createSlice } from "@reduxjs/toolkit";

const vendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: [],
  },
  reducers: {
    setVendors: (state, action) => {
      state.vendors = action.payload;
    },
    addVendor: (state, action) => {
      state.vendors.push(action.payload);
    },
    deleteVendor: (state, action) => {
      state.vendors = state.vendors.filter((v) => v.id !== action.payload);
    },
    updateVendor: (state, action) => {
      const { id, fields } = action.payload;
      const vendor = state.vendors.find((v) => v.id === id);
      if (vendor) {
        vendor.fields = fields;
      }
    },
  },
});

export const { setVendors, addVendor, deleteVendor, updateVendor } =
  vendorsSlice.actions;
export default vendorsSlice.reducer;
