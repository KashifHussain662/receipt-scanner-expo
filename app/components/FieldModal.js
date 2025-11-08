import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { resetNewField, setNewField } from "../../store/fieldsSlice";

const FieldModal = ({ visible, onSave, editingField }) => {
  const dispatch = useDispatch();
  const { newField, fieldTypes } = useSelector((state) => state.fields);

  const getTypeColor = (type) => {
    const typeConfig = fieldTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.color : "#6B7280";
  };

  const renderFieldTypeOption = (type) => (
    <TouchableOpacity
      key={type.value}
      style={[
        styles.typeOption,
        newField.type === type.value && styles.typeOptionSelected,
      ]}
      onPress={() => dispatch(setNewField({ type: type.value }))}
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

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => dispatch(resetNewField())}
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
              onPress={() => dispatch(resetNewField())}
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
                onChangeText={(text) => dispatch(setNewField({ name: text }))}
              />
              <View style={styles.helperContainer}>
                <Ionicons name="information-circle" size={14} color="#6B7280" />
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
                onChangeText={(text) => dispatch(setNewField({ label: text }))}
              />
              <View style={styles.helperContainer}>
                <Ionicons name="information-circle" size={14} color="#6B7280" />
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
              onPress={() => dispatch(resetNewField())}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}
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

export default FieldModal;
