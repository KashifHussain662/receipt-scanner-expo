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
import { firebaseService } from "../../services/firebaseService";
import { addVendor, deleteVendor } from "../../store/vendorsSlice";
import VendorCard from "../components/VendorCard";

const CustomFieldsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { vendors } = useSelector((state) => state.vendors);
  const [modalVisible, setModalVisible] = useState(false);
  const [vendorName, setVendorName] = useState("");

  const createVendor = async () => {
    if (!vendorName.trim()) {
      Alert.alert("Error", "Please enter vendor name");
      return;
    }

    // Check if vendor already exists
    if (
      vendors.some(
        (v) => v.name.toLowerCase() === vendorName.trim().toLowerCase()
      )
    ) {
      Alert.alert("Error", "Vendor already exists");
      return;
    }

    const newVendor = {
      id: Date.now().toString(),
      name: vendorName.trim(),
      fields: [],
      createdAt: new Date().toISOString(),
    };

    // Redux mein add karein
    dispatch(addVendor(newVendor));

    // Firebase mein save karein
    await firebaseService.saveVendor(newVendor);

    setVendorName("");
    setModalVisible(false);
    Alert.alert("Success", "Vendor created!");
  };

  const removeVendor = async (vendorId) => {
    if (vendors.length <= 1) {
      Alert.alert("Error", "At least one vendor required");
      return;
    }

    Alert.alert(
      "Delete Vendor",
      "Are you sure? All vendor data will be lost.",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            dispatch(deleteVendor(vendorId));
            await firebaseService.deleteVendor(vendorId);
            Alert.alert("Success", "Vendor deleted!");
          },
        },
      ]
    );
  };

  const goToFields = (vendor) => {
    navigation.navigate("FieldsScreen", { vendor });
  };

  const viewVendorData = (vendor) => {
    navigation.navigate("VendorDataScreen", { vendor });
  };

  const renderVendor = ({ item }) => (
    <VendorCard
      vendor={item}
      onPress={() => goToFields(item)}
      onLongPress={() => removeVendor(item.id)}
      onViewData={() => viewVendorData(item)}
    />
  );

  // Statistics calculation
  const stats = {
    totalVendors: vendors.length,
    totalFields: vendors.reduce(
      (total, v) => total + (v.fields?.length || 0),
      0
    ),
    activeFields: vendors.reduce(
      (total, v) => total + (v.fields?.filter((f) => f.enabled)?.length || 0),
      0
    ),
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Management</Text>
        <Text style={styles.subtitle}>
          Manage vendors and their custom fields
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
            <Ionicons name="business" size={20} color="#6366F1" />
          </View>
          <Text style={styles.statNumber}>{stats.totalVendors}</Text>
          <Text style={styles.statLabel}>Vendors</Text>
        </View>

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="list" size={20} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>{stats.totalFields}</Text>
          <Text style={styles.statLabel}>Total Fields</Text>
        </View>

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "#FFFBEB" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statNumber}>{stats.activeFields}</Text>
          <Text style={styles.statLabel}>Active Fields</Text>
        </View>
      </View>

      {/* Vendors List */}
      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Vendors</Text>
          <Text style={styles.sectionSubtitle}>
            Tap to manage fields, long press to delete
          </Text>
        </View>

        {vendors.length > 0 ? (
          <FlatList
            data={vendors}
            renderItem={renderVendor}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="business-outline" size={60} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyText}>No vendors yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first vendor to start managing custom fields
            </Text>
          </View>
        )}
      </View>

      {/* Create Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createButtonText}>Create New Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
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
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
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
                value={vendorName}
                onChangeText={setVendorName}
                autoFocus
              />
              <View style={styles.helperContainer}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <Text style={styles.helperText}>
                  This vendor will start with no fields. You can add custom
                  fields later.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={createVendor}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createModalButtonText}>Create Vendor</Text>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  stats: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    marginTop: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
    padding: 20,
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
  listContent: {
    gap: 16,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: 40,
  },
  createButton: {
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
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
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
  createModalButton: {
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
  createModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomFieldsScreen;
