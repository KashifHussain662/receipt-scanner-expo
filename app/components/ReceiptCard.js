import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { updateReceipt } from "../../utils/storage";

export default function ReceiptCard({ receipt, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState({ ...receipt });

  // Format amount - WITHOUT CURRENCY SYMBOL
  const formatAmount = (amount) => {
    try {
      if (!amount && amount !== 0) return "0.00";
      return parseFloat(amount).toFixed(2);
    } catch (error) {
      return "0.00";
    }
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
    setEditedReceipt({ ...receipt });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedReceipt({ ...receipt });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      await updateReceipt(receipt.id, editedReceipt);
      setIsEditing(false);

      Alert.alert("✅ Updated!", "Receipt data successfully updated!", [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update receipt");
      console.error("Update error:", error);
    }
  };

  // Field value update karo
  const handleFieldChange = (fieldKey, value) => {
    setEditedReceipt((prev) => ({
      ...prev,
      [fieldKey]: value,
      custom_fields: {
        ...prev.custom_fields,
        [fieldKey]: value,
      },
    }));
  };

  // Format field value based on type
  const formatFieldValue = (field, value) => {
    if (!value && value !== 0) return "-";

    switch (field.type) {
      case "amount":
        return formatAmount(value);
      case "number":
        return String(value);
      case "date":
        return new Date(value).toLocaleDateString("en-IN");
      default:
        return String(value);
    }
  };

  // Delete handler
  const handleDelete = () => {
    Alert.alert(
      "Delete Receipt",
      `Delete receipt from ${receipt.vendor_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(receipt.id),
        },
      ]
    );
  };

  // Custom fields display karo - EDITABLE
  const renderCustomFields = () => {
    if (!receipt.matched_vendor || !receipt.matched_vendor.fields) {
      return (
        <View style={styles.noFieldsContainer}>
          <Text style={styles.noFieldsText}>No custom fields found</Text>
        </View>
      );
    }

    const customFields = receipt.matched_vendor.fields.filter(
      (field) => field.enabled
    );

    if (customFields.length === 0) {
      return (
        <View style={styles.noFieldsContainer}>
          <Text style={styles.noFieldsText}>No custom fields enabled</Text>
        </View>
      );
    }

    return (
      <View style={styles.customFieldsSection}>
        <Text style={styles.customFieldsTitle}>📊 Extracted Data</Text>
        {customFields.map((field) => {
          const fieldValue = isEditing
            ? editedReceipt[field.key]
            : receipt[field.key] || receipt.custom_fields?.[field.key];

          return (
            <View key={field.key} style={styles.customFieldRow}>
              <Text style={styles.customFieldLabel}>{field.label}</Text>

              {isEditing ? (
                <TextInput
                  style={[
                    styles.editInput,
                    (field.type === "amount" || field.type === "number") &&
                      styles.amountInput,
                  ]}
                  value={String(fieldValue || "")}
                  onChangeText={(text) => handleFieldChange(field.key, text)}
                  keyboardType={
                    field.type === "amount" || field.type === "number"
                      ? "numeric"
                      : "default"
                  }
                  placeholder={`Enter ${field.label}`}
                />
              ) : (
                <Text
                  style={[
                    styles.customFieldValue,
                    (field.type === "amount" || field.type === "number") &&
                      styles.amountValue,
                  ]}
                >
                  {formatFieldValue(field, fieldValue)}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Vendor match status display karo
  const renderVendorMatchStatus = () => {
    if (!receipt.matched_vendor) {
      return (
        <View style={[styles.matchStatus, styles.matchNotFound]}>
          <Text style={styles.matchStatusText}>ℹ️ New Vendor</Text>
          <Text style={styles.vendorName}>{receipt.vendor_name}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.matchStatus, styles.matchSuccess]}>
        <Text style={styles.matchStatusText}>✅ Vendor Matched</Text>
        <Text style={styles.vendorName}>{receipt.vendor_name}</Text>
      </View>
    );
  };

  // Actions
  const renderActions = () => {
    if (isEditing) {
      return (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelEdit}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveEditButton]}
            onPress={handleSaveEdit}
          >
            <Text style={styles.saveEditButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={16} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Vendor Match Status */}
      {renderVendorMatchStatus()}

      {/* 🔥 SIRF EXTRACTED DATA - BAAKI SAB HATA DIYA */}
      {renderCustomFields()}

      {/* 🔥 ACTIONS */}
      {renderActions()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  matchSuccess: {
    backgroundColor: "#E8F5E8",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  matchNotFound: {
    backgroundColor: "#FFF3E0",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  matchStatusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Custom Fields Styles
  customFieldsSection: {
    marginBottom: 16,
  },
  customFieldsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  customFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  customFieldLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  customFieldValue: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  amountValue: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  // No Fields Style
  noFieldsContainer: {
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  noFieldsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  // Edit Input Styles
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    minWidth: 100,
    textAlign: "right",
    backgroundColor: "white",
  },
  amountInput: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  // Actions Styles
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    minHeight: 40,
  },
  saveEditButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    justifyContent: "center",
  },
  saveEditButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#E3F2FD",
  },
  editButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "500",
  },
});
