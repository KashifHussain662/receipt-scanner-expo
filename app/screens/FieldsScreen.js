// FieldsScreen.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FieldsScreen({ route, navigation }) {
  const { vendor } = route.params;
  const [vendorFields, setVendorFields] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
  });

  // Available field types
  const fieldTypes = [
    { value: "text", label: "Text", icon: "text", color: "#10B981" },
    { value: "number", label: "Number", icon: "calculator", color: "#3B82F6" },
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
  ];

  useEffect(() => {
    loadVendorFields();
  }, [vendor]);

  const loadVendorFields = async () => {
    try {
      const savedVendors = await AsyncStorage.getItem("vendorFields");
      if (savedVendors) {
        const vendorsData = JSON.parse(savedVendors);
        const currentVendor = vendorsData.find((v) => v.id === vendor.id);
        if (currentVendor) {
          setVendorFields(currentVendor.fields);
        }
      }
    } catch (error) {
      console.log("Error loading vendor fields:", error);
    }
  };

  const saveVendorFields = async (updatedFields) => {
    try {
      const savedVendors = await AsyncStorage.getItem("vendorFields");
      if (savedVendors) {
        const vendorsData = JSON.parse(savedVendors);
        const updatedVendors = vendorsData.map((v) =>
          v.id === vendor.id ? { ...v, fields: updatedFields } : v
        );
        await AsyncStorage.setItem(
          "vendorFields",
          JSON.stringify(updatedVendors)
        );
        setVendorFields(updatedFields);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save fields");
    }
  };

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

    const existingField = vendorFields.find(
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

    let updatedFields;
    if (editingField) {
      updatedFields = vendorFields.map((field) =>
        field.key === editingField.key ? fieldData : field
      );
    } else {
      updatedFields = [...vendorFields, fieldData];
    }

    saveVendorFields(updatedFields);
    resetForm();
    Alert.alert(
      "Success",
      `Field ${editingField ? "updated" : "added"} successfully!`
    );
  };

  const handleEditField = (field) => {
    if (field.common) {
      Alert.alert("Info", "Common fields cannot be edited.");
      return;
    }
    setEditingField(field);
    setNewField({
      name: field.label,
      label: field.label,
      type: field.type,
    });
    setModalVisible(true);
  };

  const handleDeleteField = (fieldKey) => {
    const field = vendorFields.find((f) => f.key === fieldKey);
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
          const updatedFields = vendorFields.filter(
            (field) => field.key !== fieldKey
          );
          saveVendorFields(updatedFields);
        },
      },
    ]);
  };

  const toggleFieldEnabled = (fieldKey) => {
    const field = vendorFields.find((f) => f.key === fieldKey);
    if (field?.common) {
      Alert.alert("Info", "Common fields cannot be disabled.");
      return;
    }

    const updatedFields = vendorFields.map((field) =>
      field.key === fieldKey ? { ...field, enabled: !field.enabled } : field
    );
    saveVendorFields(updatedFields);
  };

  const resetForm = () => {
    setNewField({
      name: "",
      label: "",
      type: "text",
    });
    setEditingField(null);
    setModalVisible(false);
  };

  const getTypeColor = (type) => {
    const typeConfig = fieldTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.color : "#6B7280";
  };

  const getStats = () => {
    const totalFields = vendorFields.length;
    const activeFields = vendorFields.filter((f) => f.enabled).length;
    const customFields = vendorFields.filter((f) => f.custom).length;
    return { totalFields, activeFields, customFields };
  };

  const renderFieldItem = ({ item, index }) => (
    <View
      style={[
        styles.fieldCard,
        item.common && styles.commonFieldCard,
        !item.enabled && styles.disabledFieldCard,
      ]}
    >
      <View style={styles.fieldCardContent}>
        <View style={styles.fieldIconContainer}>
          <Ionicons
            name={fieldTypes.find((t) => t.value === item.type)?.icon || "help"}
            size={20}
            color={getTypeColor(item.type)}
          />
        </View>

        <View style={styles.fieldInfo}>
          <View style={styles.fieldHeader}>
            <Text
              style={[styles.fieldLabel, !item.enabled && styles.disabledText]}
            >
              {item.label}
            </Text>
            <View style={styles.fieldBadges}>
              {item.custom && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>Custom</Text>
                </View>
              )}
              {item.common && (
                <View style={styles.commonBadge}>
                  <Text style={styles.commonBadgeText}>System</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldDetails}>
            <Text style={styles.fieldKey}>@{item.key}</Text>
            <View style={styles.statsContainer}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTypeColor(item.type) + "15" },
                ]}
              >
                <Text
                  style={[styles.typeText, { color: getTypeColor(item.type) }]}
                >
                  {item.type}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusToggle,
                  item.enabled ? styles.statusEnabled : styles.statusDisabled,
                ]}
                onPress={() => toggleFieldEnabled(item.key)}
                disabled={item.common}
              >
                <View
                  style={[
                    styles.statusDot,
                    item.enabled
                      ? styles.statusDotEnabled
                      : styles.statusDotDisabled,
                  ]}
                />
                <Text style={styles.statusText}>
                  {item.enabled ? "Active" : "Inactive"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {item.custom && (
        <View style={styles.fieldActions}>
          <TouchableOpacity
            onPress={() => handleEditField(item)}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteField(item.key)}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFieldTypeOption = (type) => (
    <TouchableOpacity
      key={type.value}
      style={[
        styles.typeOption,
        newField.type === type.value && styles.typeOptionSelected,
      ]}
      onPress={() => setNewField({ ...newField, type: type.value })}
      activeOpacity={0.7}
    >
      <View
        style={[styles.typeOptionIcon, { backgroundColor: type.color + "20" }]}
      >
        <Ionicons
          name={type.icon}
          size={20}
          color={newField.type === type.value ? "white" : type.color}
        />
      </View>
      <Text
        style={[
          styles.typeOptionText,
          newField.type === type.value && styles.typeOptionTextSelected,
        ]}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  const stats = getStats();

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
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
          {/* Small Add Button in Right Corner */}
          <TouchableOpacity
            style={styles.smallAddButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Stats Cards */}
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

        {vendorFields.length > 0 ? (
          <FlatList
            data={vendorFields}
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
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.emptyStateButtonText}>
                Create First Field
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Enhanced Create/Edit Field Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name={editingField ? "create" : "add"}
                  size={24}
                  color="#4F46E5"
                />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  {editingField ? "Edit Field" : "Add New Field"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editingField
                    ? "Update field configuration"
                    : "Create a new custom field"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={resetForm}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Field Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Discount Percentage"
                  placeholderTextColor="#9CA3AF"
                  value={newField.name}
                  onChangeText={(text) =>
                    setNewField({ ...newField, name: text })
                  }
                />
                <View style={styles.helperContainer}>
                  <Ionicons
                    name="information-circle"
                    size={14}
                    color="#6B7280"
                  />
                  <Text style={styles.helperText}>
                    Internal name used for data storage
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Label</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Discount %"
                  placeholderTextColor="#9CA3AF"
                  value={newField.label}
                  onChangeText={(text) =>
                    setNewField({ ...newField, label: text })
                  }
                />
                <View style={styles.helperContainer}>
                  <Ionicons
                    name="information-circle"
                    size={14}
                    color="#6B7280"
                  />
                  <Text style={styles.helperText}>
                    Label shown to users in the app
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Field Type</Text>
                <View style={styles.typeGrid}>
                  {fieldTypes.map(renderFieldTypeOption)}
                </View>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Field Preview</Text>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <Text style={styles.previewLabelText}>
                      {newField.label || "Field Label"}
                    </Text>
                    <View
                      style={[
                        styles.previewTypeBadge,
                        { backgroundColor: getTypeColor(newField.type) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.previewTypeText,
                          { color: getTypeColor(newField.type) },
                        ]}
                      >
                        {newField.type}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.previewValueContainer}>
                    <Text style={styles.previewValue}>
                      {newField.type === "text" && "Sample text input"}
                      {newField.type === "number" && "123.45"}
                      {newField.type === "amount" && "$1,000.00"}
                      {newField.type === "date" && "Dec 15, 2023"}
                      {newField.type === "category" && "Office Supplies"}
                      {newField.type === "boolean" && "Yes"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetForm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveField}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {editingField ? "Update Field" : "Create Field"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  // Small Add Button in Right Corner
  smallAddButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    marginTop: 8,
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
  // Compact Field Cards (similar to vendor cards)
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
    minHeight: 80, // Similar to vendor card height
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
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
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
