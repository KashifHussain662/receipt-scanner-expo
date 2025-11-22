import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveReceiptToFirebase, updateReceipt } from "../../utils/storage";

export default function ReceiptCard({ receipt, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState(receipt);
  const [isSaved, setIsSaved] = useState(receipt.status === "saved");

  // Format date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "No date";
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    try {
      if (!amount && amount !== 0) return "₹0.00";
      return `₹${parseFloat(amount).toFixed(2)}`;
    } catch (error) {
      return "₹0.00";
    }
  };

  // Handle save to Firebase
  const handleSaveToFirebase = async () => {
    try {
      setIsSaving(true);
      console.log("Firebase mein save kar raha hoon...");

      await saveReceiptToFirebase(editedReceipt);
      setIsSaved(true);

      Alert.alert(
        "✅ Success!",
        "Receipt data successfully saved to database!",
        [{ text: "OK" }]
      );

      if (onSave) {
        onSave(editedReceipt);
      }
    } catch (error) {
      Alert.alert(
        "❌ Error",
        "Failed to save receipt to database. Please try again.",
        [{ text: "OK" }]
      );
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
    setEditedReceipt(receipt);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedReceipt(receipt);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      await updateReceipt(receipt.id, editedReceipt);
      setIsEditing(false);

      Alert.alert("✅ Updated!", "Receipt data successfully updated!", [
        { text: "OK" },
      ]);

      if (onSave) {
        onSave(editedReceipt);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update receipt");
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Field value update karo
  const handleFieldChange = (fieldKey, value) => {
    setEditedReceipt((prev) => ({
      ...prev,
      [fieldKey]: value,
      // Custom fields mein bhi update karo
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
        return formatDate(value);
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
      return null;
    }

    const customFields = receipt.matched_vendor.fields.filter(
      (field) => field.enabled
    );

    if (customFields.length === 0) {
      return null;
    }

    return (
      <View style={styles.customFieldsSection}>
        <Text style={styles.customFieldsTitle}>📊 Extracted Data:</Text>
        {customFields.map((field) => {
          const fieldValue = isEditing
            ? editedReceipt[field.key]
            : receipt[field.key] || receipt.custom_fields?.[field.key];

          return (
            <View key={field.key} style={styles.customFieldRow}>
              <Text style={styles.customFieldLabel}>{field.label}:</Text>

              {isEditing ? (
                <TextInput
                  style={[
                    styles.editInput,
                    field.type === "amount" && styles.amountInput,
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
                    field.type === "amount" && styles.amountValue,
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
        <Text style={styles.matchStatusText}>✅ Database Match Found</Text>
        <Text style={styles.vendorName}>{receipt.vendor_name}</Text>
        <Text style={styles.matchDetails}>
          Category: {receipt.category} | Fields:{" "}
          {receipt.matched_vendor.fields?.length || 0}
        </Text>
      </View>
    );
  };

  // Save button aur actions
  const renderActions = () => {
    if (isEditing) {
      return (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelEdit}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveEditButton]}
            onPress={handleSaveEdit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveEditButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actions}>
        {!isSaved && (
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveToFirebase}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save to Database</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isSaved && (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.savedText}>Saved to Database</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          disabled={isSaving}
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

      {/* Basic Receipt Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Amount:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.editInput, styles.amountInput]}
              value={String(editedReceipt.total_amount || "")}
              onChangeText={(text) => handleFieldChange("total_amount", text)}
              keyboardType="numeric"
              placeholder="Enter total amount"
            />
          ) : (
            <Text style={styles.amount}>
              {formatAmount(receipt.total_amount)}
            </Text>
          )}
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Tax:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.editInput, styles.amountInput]}
              value={String(editedReceipt.tax || "")}
              onChangeText={(text) => handleFieldChange("tax", text)}
              keyboardType="numeric"
              placeholder="Enter tax amount"
            />
          ) : (
            <Text style={styles.value}>{formatAmount(receipt.tax)}</Text>
          )}
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(receipt.date)}</Text>
        </View>

        {/* 🔥 DYNAMIC CUSTOM FIELDS - EDITABLE */}
        {renderCustomFields()}
      </View>

      {/* 🔥 SAVE BUTTON & ACTIONS */}
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
  // Match Status Styles
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
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 12,
    color: "#666",
  },
  // Details Styles
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 40,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
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
    backgroundColor: "#f9f9f9",
  },
  amountInput: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  // Custom Fields Styles
  customFieldsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  customFieldsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  customFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    minHeight: 35,
  },
  customFieldLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  customFieldValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  amountValue: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  // Actions Styles
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 8,
    flexWrap: "wrap",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
    minHeight: 36,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  saveEditButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    justifyContent: "center",
  },
  saveEditButtonText: {
    fontSize: 12,
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
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#E3F2FD",
  },
  editButtonText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
  },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
    flex: 1,
  },
  savedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
