import { createSlice } from "@reduxjs/toolkit";

const vendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: [
      {
        id: "1",
        name: "General",
        fields: [
          {
            key: "vendor_name",
            label: "Vendor Name",
            type: "text",
            enabled: true,
            common: true,
          },
          {
            key: "total_amount",
            label: "Total Amount",
            type: "amount",
            enabled: true,
            common: true,
          },
          {
            key: "tax",
            label: "Tax Amount",
            type: "amount",
            enabled: true,
            common: true,
          },
          {
            key: "date",
            label: "Purchase Date",
            type: "date",
            enabled: true,
            common: true,
          },
          {
            key: "category",
            label: "Category",
            type: "category",
            enabled: true,
            common: true,
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
    loading: false,
    error: null,
  },
  reducers: {
    addVendor: (state, action) => {
      state.vendors.push(action.payload);
    },
    updateVendor: (state, action) => {
      const { id, updates } = action.payload;
      const vendorIndex = state.vendors.findIndex((vendor) => vendor.id === id);
      if (vendorIndex !== -1) {
        state.vendors[vendorIndex] = {
          ...state.vendors[vendorIndex],
          ...updates,
        };
      }
    },
    deleteVendor: (state, action) => {
      const vendorId = action.payload;
      state.vendors = state.vendors.filter((vendor) => vendor.id !== vendorId);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addVendor,
  updateVendor,
  deleteVendor,
  setLoading,
  setError,
  clearError,
} = vendorsSlice.actions;

export default vendorsSlice.reducer;
