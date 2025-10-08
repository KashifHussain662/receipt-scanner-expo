import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteReceipt, getReceipts } from "../../utils/storage";
import ReceiptCard from "../components/ReceiptCard";

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [sortBy]) // Added sortBy as dependency
  );

  const loadReceipts = async () => {
    try {
      const savedReceipts = await getReceipts();
      setReceipts(sortedReceipts(savedReceipts));
    } catch (error) {
      console.error("Error loading receipts:", error);
    }
  };

  const sortedReceipts = (receiptsList) => {
    // Create a copy of the array to avoid mutating the original
    return [...receiptsList].sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return (
            parseFloat(b.total_amount || 0) - parseFloat(a.total_amount || 0)
          );
        case "vendor":
          return (a.vendor_name || "").localeCompare(b.vendor_name || "");
        case "date":
        default:
          return new Date(b.date || 0) - new Date(a.date || 0);
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const handleDeleteReceipt = (id) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReceipt(id);
              // Re-sort after deletion
              const updatedReceipts = receipts.filter(
                (receipt) => receipt.id !== id
              );
              setReceipts(sortedReceipts(updatedReceipts));
            } catch (error) {
              Alert.alert("Error", "Failed to delete receipt");
            }
          },
        },
      ]
    );
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // Immediately re-sort the current receipts when sort option changes
    setReceipts(sortedReceipts(receipts));
  };

  const totalExpenses = receipts.reduce(
    (sum, receipt) => sum + parseFloat(receipt.total_amount || 0),
    0
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{receipts.length}</Text>
          <Text style={styles.statLabel}>Receipts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalExpenses.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "date" && styles.sortButtonActive,
          ]}
          onPress={() => handleSortChange("date")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "date" && styles.sortButtonTextActive,
            ]}
          >
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "amount" && styles.sortButtonActive,
          ]}
          onPress={() => handleSortChange("amount")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "amount" && styles.sortButtonTextActive,
            ]}
          >
            Amount
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "vendor" && styles.sortButtonActive,
          ]}
          onPress={() => handleSortChange("vendor")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "vendor" && styles.sortButtonTextActive,
            ]}
          >
            Vendor
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (receipts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Receipts Yet</Text>
        <Text style={styles.emptyText}>
          Scan your first receipt to start tracking your expenses
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReceiptCard receipt={item} onDelete={handleDeleteReceipt} />
        )}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  sortButtonActive: {
    backgroundColor: "#007AFF",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
});
