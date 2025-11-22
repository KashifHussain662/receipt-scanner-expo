import { createSlice } from "@reduxjs/toolkit";
import { firebaseService } from "../services/firebaseService";

const vendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: [],
    loading: false,
    error: null,
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
  setVendors,
  addVendor,
  deleteVendor,
  updateVendor,
  setLoading,
  setError,
  clearError,
} = vendorsSlice.actions;

// Thunk action to load vendors from Firebase
export const loadVendors = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const vendors = await firebaseService.getVendors();
    dispatch(setVendors(vendors));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export default vendorsSlice.reducer;
