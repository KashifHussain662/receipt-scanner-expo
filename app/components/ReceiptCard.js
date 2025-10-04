import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReceiptCard({ receipt, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.vendor}>{receipt.vendor_name}</Text>
        <TouchableOpacity onPress={() => onDelete(receipt.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Amount:</Text>
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
      </View>
    </View>
  );
}

const getCategoryColor = (category) => {
  const colors = {
    "Food & Drinks": "#FF6B6B",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vendor: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  value: {
    fontSize: 14,
    color: "#333",
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
});
