import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { firebaseService } from "../../services/firebaseService";
import { updateVendor } from "../../store/vendorsSlice";

const FieldsScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const dispatch = useDispatch();
  const { vendors } = useSelector((state) => state.vendors);

  const [modalVisible, setModalVisible] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [defaultValue, setDefaultValue] = useState("");

  const currentVendor = vendors.find((v) => v.id === vendor.id);
  const fields = currentVendor?.fields || [];

  const createField = async () => {
    if (!fieldName.trim()) {
      Alert.alert("Error", "Please enter field name");
      return;
    }

    const fieldKey = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Check if field already exists
    if (fields.some((f) => f.key === fieldKey)) {
      Alert.alert("Error", "Field already exists");
      return;
    }

    const newField = {
      key: fieldKey,
      label: fieldName.trim(),
      type: fieldType,
      defaultValue: defaultValue.trim(),
      enabled: true,
    };

    const updatedFields = [...fields, newField];

    // Redux update
    dispatch(
      updateVendor({
        id: vendor.id,
        fields: updatedFields,
      })
    );

    // Firebase update
    const updatedVendor = { ...currentVendor, fields: updatedFields };
    await firebaseService.saveVendor(updatedVendor);

    setFieldName("");
    setDefaultValue("");
    setFieldType("text");
    setModalVisible(false);
    Alert.alert("Success", "Field created!");
  };

  const deleteField = async (fieldKey) => {
    Alert.alert("Delete Field", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const updatedFields = fields.filter((f) => f.key !== fieldKey);

          // Redux update
          dispatch(
            updateVendor({
              id: vendor.id,
              fields: updatedFields,
            })
          );

          // Firebase update
          const updatedVendor = { ...currentVendor, fields: updatedFields };
          await firebaseService.saveVendor(updatedVendor);

          Alert.alert("Success", "Field deleted!");
        },
      },
    ]);
  };

  const toggleField = async (fieldKey) => {
    const updatedFields = fields.map((f) =>
      f.key === fieldKey ? { ...f, enabled: !f.enabled } : f
    );

    // Redux update
    dispatch(
      updateVendor({
        id: vendor.id,
        fields: updatedFields,
      })
    );

    // Firebase update
    const updatedVendor = { ...currentVendor, fields: updatedFields };
    await firebaseService.saveVendor(updatedVendor);
  };

  const renderField = ({ item }) => (
    <View style={styles.fieldCard}>
      <View style={styles.fieldInfo}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldName}>{item.label}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.enabled ? "#10B981" : "#EF4444" },
            ]}
          >
            <Text style={styles.statusText}>
              {item.enabled ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <Text style={styles.fieldKey}>Key: {item.key}</Text>
        <View style={styles.fieldMeta}>
          <View style={styles.typeBadge}>
            <Ionicons
              name={getFieldTypeIcon(item.type)}
              size={12}
              color="#6366F1"
            />
            <Text style={styles.fieldType}>Type: {item.type}</Text>
          </View>
          {item.defaultValue && (
            <View style={styles.defaultBadge}>
              <Ionicons name="document-text" size={12} color="#8B5CF6" />
              <Text style={styles.defaultValue}>
                Default: {item.defaultValue}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.fieldActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleField(item.key)}
        >
          <Ionicons
            name={item.enabled ? "eye" : "eye-off"}
            size={20}
            color={item.enabled ? "#10B981" : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteField(item.key)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getFieldTypeIcon = (type) => {
    const icons = {
      text: "text",
      number: "stats-chart",
      date: "calendar",
      amount: "cash",
    };
    return icons[type] || "text";
  };

  return (
    <View style={styles.container}>
      {/* Vendor Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <Text style={styles.vendorSubtitle}>Custom Fields Management</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
            <Ionicons name="list" size={20} color="#6366F1" />
          </View>
          <Text style={styles.statNumber}>{fields.length}</Text>
          <Text style={styles.statLabel}>Total Fields</Text>
        </View>
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>
            {fields.filter((f) => f.enabled).length}
          </Text>
          <Text style={styles.statLabel}>Active Fields</Text>
        </View>
      </View>

      {/* Fields List */}
      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Fields</Text>
          <Text style={styles.sectionSubtitle}>
            Manage fields for {vendor.name}
          </Text>
        </View>

        {fields.length > 0 ? (
          <FlatList
            data={fields}
            renderItem={renderField}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="list-outline" size={60} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyText}>No fields created yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first custom field to start collecting data
            </Text>
          </View>
        )}
      </View>

      {/* Floating Action Button - WhatsApp style */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="add-circle" size={24} color="#6366F1" />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Create New Field</Text>
                <Text style={styles.modalSubtitle}>
                  Add a custom field to {vendor.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setFieldName("");
                  setDefaultValue("");
                  setFieldType("text");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Field Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Product Category, Invoice Number"
                placeholderTextColor="#9CA3AF"
                value={fieldName}
                onChangeText={setFieldName}
                autoFocus
              />

              <Text style={styles.inputLabel}>Default Value (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter default value"
                placeholderTextColor="#9CA3AF"
                value={defaultValue}
                onChangeText={setDefaultValue}
              />

              <Text style={styles.inputLabel}>Field Type</Text>
              <View style={styles.typeButtons}>
                {[
                  { type: "text", label: "Text", icon: "text" },
                  { type: "number", label: "Number", icon: "stats-chart" },
                  { type: "date", label: "Date", icon: "calendar" },
                  { type: "amount", label: "Amount", icon: "cash" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.typeButton,
                      fieldType === item.type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFieldType(item.type)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={fieldType === item.type ? "white" : "#6366F1"}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        fieldType === item.type && styles.typeTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setFieldName("");
                  setDefaultValue("");
                  setFieldType("text");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={createField}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createModalButtonText}>Create Field</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  vendorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  stat: {
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
  listContainer: {
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
  listContent: {
    gap: 12,
    paddingBottom: 100,
  },
  fieldCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  fieldInfo: {
    flex: 1,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  fieldKey: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  fieldMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  fieldType: {
    fontSize: 11,
    color: "#6366F1",
    fontWeight: "500",
  },
  defaultValue: {
    fontSize: 11,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  fieldActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  // Floating Action Button
  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
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
    padding: 24,
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
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  typeButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  typeTextActive: {
    color: "white",
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
  createModalButton: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
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
  createModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FieldsScreen;
