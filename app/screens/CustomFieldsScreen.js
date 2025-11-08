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
import { addVendor, deleteVendor } from "../../store/vendorsSlice";
import VendorCard from "../components/VendorCard";

const CustomFieldsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { vendors } = useSelector((state) => state.vendors);
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");

  const addNewVendor = () => {
    if (!newVendorName.trim()) {
      Alert.alert("Error", "Please enter vendor name");
      return;
    }

    const vendorExists = vendors.find(
      (v) => v.name.toLowerCase() === newVendorName.trim().toLowerCase()
    );
    if (vendorExists) {
      Alert.alert("Error", "Vendor with this name already exists");
      return;
    }

    const newVendor = {
      id: Date.now().toString(),
      name: newVendorName.trim(),
      fields: [
        {
          key: "vendor_name",
          label: "Vendor Name",
          type: "text",
          enabled: true,
          common: true,
        },
        {
          key: "total_amount",
          label: "Total Amount",
          type: "amount",
          enabled: true,
          common: true,
        },
        {
          key: "tax",
          label: "Tax Amount",
          type: "amount",
          enabled: true,
          common: true,
        },
        {
          key: "date",
          label: "Purchase Date",
          type: "date",
          enabled: true,
          common: true,
        },
        {
          key: "category",
          label: "Category",
          type: "category",
          enabled: true,
          common: true,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    dispatch(addVendor(newVendor));
    setNewVendorName("");
    setVendorModalVisible(false);
  };

  const handleDeleteVendor = (vendorId) => {
    if (vendors.length <= 1) {
      Alert.alert("Error", "You must have at least one vendor");
      return;
    }

    Alert.alert(
      "Delete Vendor",
      "Are you sure you want to delete this vendor? All its custom fields will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(deleteVendor(vendorId));
          },
        },
      ]
    );
  };

  const navigateToFields = (vendor) => {
    navigation.navigate("FieldsScreen", { vendor });
  };

  const renderVendorItem = ({ item, index }) => (
    <VendorCard
      vendor={item}
      index={index}
      onPress={() => navigateToFields(item)}
      onLongPress={() => handleDeleteVendor(item.id)}
    />
  );

  const stats = {
    totalVendors: vendors.length,
    activeFields: vendors.reduce(
      (acc, vendor) => acc + vendor.fields.filter((f) => f.enabled).length,
      0
    ),
    customFields: vendors.reduce(
      (acc, vendor) => acc + vendor.fields.filter((f) => f.custom).length,
      0
    ),
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Vendor Management</Text>
            <Text style={styles.subtitle}>
              Organize and customize vendor fields
            </Text>
          </View>
        </View>
      </View> */}

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statCard}>
          <Ionicons name="business" size={24} color="#6366F1" />
          <Text style={styles.statNumber}>{stats.totalVendors}</Text>
          <Text style={styles.statLabel}>Total Vendors</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="list" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.activeFields}</Text>
          <Text style={styles.statLabel}>Active Fields</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="add-circle" size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>{stats.customFields}</Text>
          <Text style={styles.statLabel}>Custom Fields</Text>
        </View>
      </View>

      {/* Vendors List */}
      <View style={styles.vendorsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Vendors</Text>
          <Text style={styles.sectionSubtitle}>
            Tap to manage fields, long press to delete
          </Text>
        </View>

        {vendors.length > 0 ? (
          <FlatList
            data={vendors}
            renderItem={renderVendorItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.vendorsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="business-outline" size={80} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>No vendors yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first vendor to start managing custom fields and
              streamline your workflow
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Create Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.bottomCreateButton}
          onPress={() => setVendorModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.bottomCreateButtonText}>Create New Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Add Vendor Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={vendorModalVisible}
        onRequestClose={() => setVendorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="business" size={24} color="#6366F1" />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Create New Vendor</Text>
                <Text style={styles.modalSubtitle}>
                  Add a new vendor to customize fields
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setVendorModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Vendor Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Amazon, Starbucks, Walmart"
                placeholderTextColor="#9CA3AF"
                value={newVendorName}
                onChangeText={setNewVendorName}
                autoFocus
              />
              <View style={styles.helperContainer}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <Text style={styles.helperText}>
                  This vendor will start with common fields. You can add custom
                  fields later.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setVendorModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNewVendor}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="red" />
                <Text style={styles.saveButtonText}>Create Vendor</Text>
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
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "#6366F1",
    opacity: 0.02,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  bottomCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomCreateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  statsOverview: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
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
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },
  vendorsContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
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
  vendorsList: {
    gap: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
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
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
    lineHeight: 16,
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

export default CustomFieldsScreen;
