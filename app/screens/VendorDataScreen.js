import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { firebaseService } from "../../services/firebaseService";

const VendorDataScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const { vendors } = useSelector((state) => state.vendors);

  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentVendor = vendors.find((v) => v.id === vendor.id);
  const vendorFields = currentVendor?.fields || [];

  useEffect(() => {
    loadVendorData();
  }, [vendor.id]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getVendorData(vendor.id);
      setVendorData(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load vendor data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const success = await firebaseService.deleteVendorData(
              vendor.id,
              recordId
            );
            if (success) {
              setVendorData((prev) =>
                prev.filter((record) => record.id !== recordId)
              );
              Alert.alert("Success", "Record deleted!");
            } else {
              Alert.alert("Error", "Failed to delete record");
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.vendorName}>{vendor.name}</Text>
      <Text style={styles.recordCount}>
        {vendorData.length} records in database
      </Text>
    </View>
  );

  const renderRecord = ({ item, index }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordNumber}>Record #{index + 1}</Text>
        <TouchableOpacity
          onPress={() => deleteRecord(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={18} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldsContainer}>
        {vendorFields.map(
          (field) =>
            field.enabled && (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}:</Text>
                <Text style={styles.fieldValue}>
                  {item[field.key] || "N/A"}
                </Text>
              </View>
            )
        )}
      </View>

      <Text style={styles.timestamp}>
        Added: {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading vendor data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vendorData}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  vendorName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  recordCount: {
    fontSize: 16,
    color: "#666",
  },
  recordCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recordNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#fff0f0",
  },
  fieldsContainer: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    maxWidth: "50%",
    textAlign: "right",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 12,
    fontStyle: "italic",
  },
});

export default VendorDataScreen;
