import { createSlice } from "@reduxjs/toolkit";

const fieldsSlice = createSlice({
  name: "fields",
  initialState: {
    fieldTypes: [
      { value: "text", label: "Text", icon: "text", color: "#10B981" },
      {
        value: "number",
        label: "Number",
        icon: "calculator",
        color: "#3B82F6",
      },
      { value: "amount", label: "Amount", icon: "cash", color: "#F59E0B" },
      { value: "date", label: "Date", icon: "calendar", color: "#EF4444" },
      {
        value: "category",
        label: "Category",
        icon: "pricetag",
        color: "#8B5CF6",
      },
      {
        value: "boolean",
        label: "Yes/No",
        icon: "checkmark-circle",
        color: "#EC4899",
      },
    ],
    currentVendorFields: [],
    editingField: null,
    newField: {
      name: "",
      label: "",
      type: "text",
    },
    modalVisible: false,
    currentVendorId: null,
  },
  reducers: {
    setCurrentVendor: (state, action) => {
      state.currentVendorId = action.payload;
    },

    setCurrentVendorFields: (state, action) => {
      state.currentVendorFields = action.payload;
    },

    addField: (state, action) => {
      state.currentVendorFields.push(action.payload);
    },

    updateField: (state, action) => {
      const { fieldKey, updates } = action.payload;
      const fieldIndex = state.currentVendorFields.findIndex(
        (field) => field.key === fieldKey
      );
      if (fieldIndex !== -1) {
        state.currentVendorFields[fieldIndex] = {
          ...state.currentVendorFields[fieldIndex],
          ...updates,
        };
      }
    },

    deleteField: (state, action) => {
      const fieldKey = action.payload;
      state.currentVendorFields = state.currentVendorFields.filter(
        (field) => field.key !== fieldKey
      );
    },

    toggleFieldEnabled: (state, action) => {
      const fieldKey = action.payload;
      const fieldIndex = state.currentVendorFields.findIndex(
        (field) => field.key === fieldKey
      );
      if (fieldIndex !== -1) {
        state.currentVendorFields[fieldIndex].enabled =
          !state.currentVendorFields[fieldIndex].enabled;
      }
    },

    setEditingField: (state, action) => {
      state.editingField = action.payload;
    },

    setNewField: (state, action) => {
      state.newField = { ...state.newField, ...action.payload };
    },

    resetNewField: (state) => {
      state.newField = {
        name: "",
        label: "",
        type: "text",
      };
      state.editingField = null;
    },

    setModalVisible: (state, action) => {
      state.modalVisible = action.payload;
    },
  },
});

export const {
  setCurrentVendor,
  setCurrentVendorFields,
  addField,
  updateField,
  deleteField,
  toggleFieldEnabled,
  setEditingField,
  setNewField,
  resetNewField,
  setModalVisible,
} = fieldsSlice.actions;

export default fieldsSlice.reducer;
