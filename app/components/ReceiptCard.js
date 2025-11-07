import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReceiptCard({ receipt, onDelete, onEdit }) {
  const [allFields, setAllFields] = useState([]);
  const [showAllFields, setShowAllFields] = useState(false);

  useEffect(() => {
    loadAllFields();
  }, []);

  const loadAllFields = async () => {
    try {
      // Load custom fields from AsyncStorage
      const customFieldsData = await AsyncStorage.getItem("userCustomFields");
      const customFields = customFieldsData ? JSON.parse(customFieldsData) : [];

      // Default fields (you can modify these as needed)
      const defaultFields = [
        {
          key: "vendor_name",
          label: "Vendor",
          type: "text",
          enabled: true,
          required: true,
        },
        {
          key: "total_amount",
          label: "Total Amount",
          type: "amount",
          enabled: true,
          required: true,
        },
        {
          key: "tax",
          label: "Tax",
          type: "amount",
          enabled: true,
          required: false,
        },
        {
          key: "date",
          label: "Date",
          type: "date",
          enabled: true,
          required: true,
        },
        {
          key: "category",
          label: "Category",
          type: "category",
          enabled: true,
          required: false,
        },
        {
          key: "payment_method",
          label: "Payment Method",
          type: "text",
          enabled: false,
          required: false,
        },
        {
          key: "location",
          label: "Location",
          type: "text",
          enabled: false,
          required: false,
        },
      ];

      // Combine default and custom fields, filter enabled ones
      const allEnabledFields = [...defaultFields, ...customFields]
        .filter((field) => field.enabled)
        .sort((a, b) => {
          // Sort: required fields first, then by label
          if (a.required && !b.required) return -1;
          if (!a.required && b.required) return 1;
          return a.label.localeCompare(b.label);
        });

      setAllFields(allEnabledFields);
    } catch (error) {
      console.log("Error loading fields:", error);
      // Fallback to basic fields if there's an error
      setAllFields([
        { key: "vendor_name", label: "Vendor", type: "text", enabled: true },
        {
          key: "total_amount",
          label: "Total Amount",
          type: "amount",
          enabled: true,
        },
        { key: "date", label: "Date", type: "date", enabled: true },
      ]);
    }
  };

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

  const getCategoryColor = (category) => {
    const colors = {
      "Food & Drinks": "#FF6B6B",
      Food: "#FF6B6B",
      Dining: "#FF6B6B",
      Shopping: "#4ECDC4",
      Retail: "#4ECDC4",
      Transportation: "#45B7D1",
      Travel: "#45B7D1",
      Entertainment: "#96CEB4",
      Healthcare: "#FFEAA7",
      Medical: "#FFEAA7",
      Utilities: "#DDA0DD",
      Bills: "#DDA0DD",
      Other: "#B2B2B2",
      Misc: "#B2B2B2",
    };
    return colors[category] || "#B2B2B2";
  };

  const renderFieldValue = (field, value) => {
    // Handle empty values
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null"
    ) {
      return <Text style={styles.emptyValue}>-</Text>;
    }

    try {
      switch (field.type) {
        case "amount":
          return <Text style={styles.amount}>{formatAmount(value)}</Text>;

        case "number":
          return <Text style={styles.value}>{String(value)}</Text>;

        case "date":
          return <Text style={styles.value}>{formatDate(value)}</Text>;

        case "boolean":
          const boolValue =
            String(value).toLowerCase() === "true" || value === true;
          return (
            <View
              style={[
                styles.booleanBadge,
                { backgroundColor: boolValue ? "#4CD964" : "#FF3B30" },
              ]}
            >
              <Text style={styles.booleanText}>{boolValue ? "Yes" : "No"}</Text>
            </View>
          );

        case "category":
          return (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(value) },
              ]}
            >
              <Text style={styles.categoryText}>{value}</Text>
            </View>
          );

        default: // text and other types
          return (
            <Text style={styles.value} numberOfLines={2}>
              {String(value)}
            </Text>
          );
      }
    } catch (error) {
      return <Text style={styles.errorValue}>Error</Text>;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
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

  const hasCustomFields = allFields.some((field) => field.custom);
  const visibleFields = showAllFields ? allFields : allFields.slice(0, 5);
  const hasMoreFields = allFields.length > 5;

  return (
    <View style={styles.card}>
      {/* Header with Vendor and Actions */}
      <View style={styles.header}>
        <Text style={styles.vendor} numberOfLines={1}>
          {receipt.vendor_name || "Unknown Vendor"}
        </Text>
        <View style={styles.headerActions}>
          {onEdit && (
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={18} color="#007AFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Receipt Details */}
      <View style={styles.details}>
        {visibleFields.map((field) => (
          <View key={field.key} style={styles.detailRow}>
            <Text
              style={[
                styles.label,
                field.required && styles.requiredLabel,
                field.custom && styles.customLabel,
              ]}
            >
              {field.label}:
            </Text>
            <View style={styles.valueContainer}>
              {renderFieldValue(field, receipt[field.key])}
              {field.custom && (
                <Ionicons
                  name="star"
                  size={12}
                  color="#007AFF"
                  style={styles.customFieldIcon}
                />
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Footer with Expand/Collapse and Custom Fields Indicator */}
      <View style={styles.footer}>
        {hasMoreFields && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowAllFields(!showAllFields)}
          >
            <Text style={styles.expandButtonText}>
              {showAllFields
                ? "Show Less"
                : `Show ${allFields.length - 5} More`}
            </Text>
            <Ionicons
              name={showAllFields ? "chevron-up" : "chevron-down"}
              size={16}
              color="#007AFF"
            />
          </TouchableOpacity>
        )}

        {hasCustomFields && (
          <View style={styles.customFieldsIndicator}>
            <Ionicons name="star" size={12} color="#007AFF" />
            <Text style={styles.customFieldsText}>Custom fields</Text>
          </View>
        )}
      </View>

      {/* Receipt ID (hidden but useful for debugging) */}
      <Text style={styles.receiptId}>ID: {receipt.id}</Text>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  vendor: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 24,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  requiredLabel: {
    color: "#333",
    fontWeight: "600",
  },
  customLabel: {
    color: "#007AFF",
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "right",
  },
  emptyValue: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "right",
  },
  errorValue: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "right",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  booleanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  booleanText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  customFieldIcon: {
    marginLeft: 4,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  expandButtonText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  customFieldsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  customFieldsText: {
    fontSize: 10,
    color: "#007AFF",
    fontWeight: "500",
  },
  receiptId: {
    display: "none", // Hidden but in DOM for debugging
  },
});
