import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const VendorCard = ({ vendor, onPress, onLongPress, onViewData }) => {
  const fieldsCount = vendor.fields ? vendor.fields.length : 0;
  const activeFieldsCount = vendor.fields
    ? vendor.fields.filter((f) => f.enabled).length
    : 0;
  const customFieldsCount = vendor.fields
    ? vendor.fields.filter((f) => f.custom).length
    : 0;

  const handleLongPress = () => {
    Alert.alert(
      "Delete Vendor",
      `Are you sure you want to delete ${vendor.name}? All vendor data will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onLongPress },
      ]
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {/* Main Card Content */}
      <View style={styles.cardContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.vendorIcon}>
            <Ionicons name="business" size={24} color="#6366F1" />
          </View>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName} numberOfLines={1}>
              {vendor.name}
            </Text>
            <Text style={styles.vendorDate}>
              Created {formatDate(vendor.createdAt)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        {/* Fields Summary */}
        <View style={styles.fieldsSummary}>
          <View style={styles.fieldStat}>
            <Ionicons name="list" size={16} color="#6B7280" />
            <Text style={styles.fieldStatText}>{fieldsCount} total fields</Text>
          </View>

          <View style={styles.fieldStat}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.fieldStatText}>{activeFieldsCount} active</Text>
          </View>

          {customFieldsCount > 0 && (
            <View style={styles.fieldStat}>
              <Ionicons name="star" size={16} color="#8B5CF6" />
              <Text style={styles.fieldStatText}>
                {customFieldsCount} custom
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onViewData}>
            <Ionicons name="eye" size={16} color="#6366F1" />
            <Text style={styles.actionButtonText}>View Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Ionicons name="settings" size={16} color="#6B7280" />
            <Text style={styles.actionButtonText}>Manage Fields</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{fieldsCount}</Text>
            <Text style={styles.quickStatLabel}>Fields</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{activeFieldsCount}</Text>
            <Text style={styles.quickStatLabel}>Active</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{customFieldsCount}</Text>
            <Text style={styles.quickStatLabel}>Custom</Text>
          </View>
        </View>
      </View>

      {/* Status Indicator */}
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: activeFieldsCount > 0 ? "#10B981" : "#6B7280" },
        ]}
      >
        <Text style={styles.statusText}>
          {activeFieldsCount > 0 ? "Active" : "No Fields"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  vendorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  vendorIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  vendorDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  fieldsSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  fieldStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fieldStatText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default VendorCard;
