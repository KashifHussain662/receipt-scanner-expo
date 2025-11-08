import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  addField,
  deleteField,
  setCurrentVendorFields,
  setModalVisible,
  updateField,
} from "../../store/fieldsSlice";
import FieldCard from "../components/FieldCard";
import FieldModal from "../components/FieldModal";

const FieldsScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const dispatch = useDispatch();
  const { currentVendorFields, modalVisible, editingField, newField } =
    useSelector((state) => state.fields);
  const { vendors } = useSelector((state) => state.vendors);

  useEffect(() => {
    // Load vendor fields from Redux store
    const currentVendor = vendors.find((v) => v.id === vendor.id);
    if (currentVendor) {
      dispatch(setCurrentVendorFields(currentVendor.fields));
    }
  }, [vendor, vendors]);

  const generateFieldKey = (fieldName) => {
    return fieldName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const validateField = () => {
    if (!newField.name.trim()) {
      Alert.alert("Error", "Please enter field name");
      return false;
    }
    if (!newField.label.trim()) {
      Alert.alert("Error", "Please enter display label");
      return false;
    }

    const fieldKey = generateFieldKey(newField.name);

    const existingField = currentVendorFields.find(
      (field) => field.key === fieldKey && field.key !== editingField?.key
    );
    if (existingField) {
      Alert.alert("Error", "Field with this name already exists");
      return false;
    }

    return true;
  };

  const handleSaveField = () => {
    if (!validateField()) return;

    const fieldKey = generateFieldKey(newField.name);
    const fieldData = {
      key: fieldKey,
      label: newField.label.trim(),
      type: newField.type,
      enabled: true,
      custom: true,
      common: false,
    };

    if (editingField) {
      dispatch(updateField({ fieldKey: editingField.key, updates: fieldData }));
    } else {
      dispatch(addField(fieldData));
    }

    dispatch(setModalVisible(false));
    Alert.alert(
      "Success",
      `Field ${editingField ? "updated" : "added"} successfully!`
    );
  };

  const handleDeleteField = (fieldKey) => {
    const field = currentVendorFields.find((f) => f.key === fieldKey);
    if (field?.common) {
      Alert.alert("Info", "Common fields cannot be deleted.");
      return;
    }

    Alert.alert("Delete Field", "Are you sure you want to delete this field?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch(deleteField(fieldKey));
        },
      },
    ]);
  };

  const stats = {
    totalFields: currentVendorFields.length,
    activeFields: currentVendorFields.filter((f) => f.enabled).length,
    customFields: currentVendorFields.filter((f) => f.custom).length,
  };

  const renderFieldItem = ({ item, index }) => (
    <FieldCard item={item} index={index} onDelete={handleDeleteField} />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{vendor.name}</Text>
            <Text style={styles.subtitle}>Field configuration</Text>
          </View>
        </View>
      </View> */}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
            <Ionicons name="list" size={20} color="#4F46E5" />
          </View>
          <Text style={styles.statNumber}>{stats.totalFields}</Text>
          <Text style={styles.statLabel}>Total Fields</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
          </View>
          <Text style={styles.statNumber}>{stats.activeFields}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#FAF5FF" }]}>
            <Ionicons name="add-circle" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statNumber}>{stats.customFields}</Text>
          <Text style={styles.statLabel}>Custom</Text>
        </View>
      </View>

      {/* Fields List */}
      <View style={styles.fieldsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Field Configuration</Text>
          <Text style={styles.sectionSubtitle}>
            Manage field types, visibility, and settings
          </Text>
        </View>

        {currentVendorFields.length > 0 ? (
          <FlatList
            data={currentVendorFields}
            renderItem={renderFieldItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fieldsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="grid-outline" size={80} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>No fields configured</Text>
            <Text style={styles.emptyDescription}>
              Add custom fields to enhance your vendor data collection
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Create Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.bottomCreateButton}
          onPress={() => dispatch(setModalVisible(true))}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.bottomCreateButtonText}>Create New Field</Text>
        </TouchableOpacity>
      </View>

      {/* Field Modal */}
      <FieldModal
        visible={modalVisible}
        onSave={handleSaveField}
        editingField={editingField}
      />
    </View>
  );
};

export default FieldsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "#4F46E5",
    opacity: 0.02,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Bottom Create Button
  bottomButtonContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  bottomCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomCreateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  fieldsContainer: {
    flex: 1,
    padding: 20,
    // paddingBottom: 100, // Add padding to accommodate bottom button
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  fieldsList: {
    gap: 12,
    paddingBottom: 20,
  },
  // ... (rest of the styles remain the same)
  fieldCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 80,
  },
  commonFieldCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  disabledFieldCard: {
    opacity: 0.6,
  },
  fieldCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  fieldInfo: {
    flex: 1,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  fieldKey: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "monospace",
    fontWeight: "500",
    marginBottom: 6,
  },
  fieldBadges: {
    flexDirection: "row",
    gap: 4,
  },
  customBadge: {
    backgroundColor: "#FAF5FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 9,
    color: "#8B5CF6",
    fontWeight: "700",
  },
  commonBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commonBadgeText: {
    fontSize: 9,
    color: "#059669",
    fontWeight: "700",
  },
  fieldDetails: {
    // No specific styles needed, using flex
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusEnabled: {
    backgroundColor: "#F0FDF4",
  },
  statusDisabled: {
    backgroundColor: "#FEF2F2",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotEnabled: {
    backgroundColor: "#10B981",
  },
  statusDotDisabled: {
    backgroundColor: "#EF4444",
  },
  statusText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
  },
  fieldActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
  modalBody: {
    maxHeight: 400,
  },
  inputGroup: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
    lineHeight: 16,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  typeOptionSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  typeOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeOptionText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  typeOptionTextSelected: {
    color: "white",
  },
  previewSection: {
    padding: 24,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  previewCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  previewTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewTypeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  previewValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewValue: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
