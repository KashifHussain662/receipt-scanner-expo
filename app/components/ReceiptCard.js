import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReceiptCard({ receipt, onDelete, onEdit }) {
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

  const formatAmount = (amount) => {
    try {
      if (!amount && amount !== 0) return "₹0.00";
      return `₹${parseFloat(amount).toFixed(2)}`;
    } catch (error) {
      return "₹0.00";
    }
  };

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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(receipt);
    }
  };

  return (
    <View style={styles.card}>
      {/* Vendor Header - Highlighted */}
      <View style={styles.vendorHeader}>
        <Ionicons name="business" size={20} color="#007AFF" />
        <Text style={styles.vendorName} numberOfLines={2}>
          {receipt.vendor_name || "Unknown Vendor"}
        </Text>
      </View>

      {/* Receipt Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.amount}>
            {formatAmount(receipt.total_amount)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Tax:</Text>
          <Text style={styles.value}>{formatAmount(receipt.tax)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(receipt.date)}</Text>
        </View>

        {receipt.category && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Category:</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(receipt.category) },
              ]}
            >
              <Text style={styles.categoryText}>{receipt.category}</Text>
            </View>
          </View>
        )}

        {receipt.payment_method && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment:</Text>
            <Text style={styles.value}>{receipt.payment_method}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getCategoryColor = (category) => {
  const colors = {
    "Food & Drinks": "#FF6B6B",
    Food: "#FF6B6B",
    Shopping: "#4ECDC4",
    Transportation: "#45B7D1",
    Entertainment: "#96CEB4",
    Healthcare: "#FFEAA7",
    Utilities: "#DDA0DD",
    Other: "#B2B2B2",
  };
  return colors[category] || "#B2B2B2";
};

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
  vendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  vendorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E3F2FD",
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFE5E5",
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
  },
});
