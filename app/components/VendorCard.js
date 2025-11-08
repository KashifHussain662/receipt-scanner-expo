import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const VendorCard = ({ vendor, index, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      style={[styles.vendorCard, index === 0 && styles.firstVendorCard]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.vendorCardContent}>
        <View style={styles.vendorIconContainer}>
          <Ionicons
            name="business"
            size={24}
            color={index === 0 ? "#6366F1" : "#8B5CF6"}
          />
        </View>

        <View style={styles.vendorInfo}>
          <View style={styles.vendorHeader}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            {index === 0 && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.statText}>
                {vendor.fields.filter((f) => f.enabled).length} active
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="add-circle" size={14} color="#8B5CF6" />
              <Text style={styles.statText}>
                {vendor.fields.filter((f) => f.custom).length} custom
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.vendorActions}>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>
      </View>

      <View style={styles.vendorFooter}>
        <View style={styles.footerInfo}>
          <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
          <Text style={styles.vendorDate}>
            Created{" "}
            {new Date(vendor.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
        <Text style={styles.totalFields}>
          {vendor.fields.length} total fields
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  vendorCard: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
  },
  firstVendorCard: {
    borderColor: "#E0E7FF",
    backgroundColor: "#FAFBFF",
  },
  vendorCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  vendorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  defaultBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: "#6366F1",
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  vendorActions: {
    padding: 4,
  },
  vendorFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FAFBFF",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vendorDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  totalFields: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
});

export default VendorCard;
