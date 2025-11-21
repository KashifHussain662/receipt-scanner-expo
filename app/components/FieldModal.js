// components/FieldModal.js
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FieldModal = ({
  visible,
  onSave,
  onClose,
  editingField,
  fieldTypes,
  newField,
  onFieldChange,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <Ionicons name="add-circle" size={24} color="#6366F1" />
            </View>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {editingField ? "Edit Field" : "Create New Field"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {editingField
                  ? "Update field details"
                  : "Add a new custom field"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Field Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Field Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Invoice Number, Project Name"
                placeholderTextColor="#9CA3AF"
                value={newField.name}
                onChangeText={(text) => onFieldChange({ name: text })}
                autoFocus
              />
            </View>

            {/* Display Label Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Label</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Invoice Number, Project Name"
                placeholderTextColor="#9CA3AF"
                value={newField.label}
                onChangeText={(text) => onFieldChange({ label: text })}
              />
            </View>

            {/* Field Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Field Type</Text>
              <View style={styles.typeGrid}>
                {fieldTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      newField.type === type.value && styles.typeOptionSelected,
                    ]}
                    onPress={() => onFieldChange({ type: type.value })}
                  >
                    <View
                      style={[
                        styles.typeOptionIcon,
                        { backgroundColor: type.color + "20" },
                      ]}
                    >
                      <Ionicons name={type.icon} size={20} color={type.color} />
                    </View>
                    <Text
                      style={[
                        styles.typeOptionText,
                        newField.type === type.value &&
                          styles.typeOptionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {editingField ? "Update" : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
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
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FieldModal;
