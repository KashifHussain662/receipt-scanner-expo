import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ExpenseChart from "../components/ExpenseChart";
import { getReceipts } from "../utils/storage";

const { width } = Dimensions.get("window");

export default function SummaryScreen() {
  const [receipts, setReceipts] = useState([]);
  const [chartType, setChartType] = useState("pie");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useFocusEffect(
    React.useCallback(() => {
      loadReceipts();
    }, [])
  );

  const loadReceipts = async () => {
    try {
      const savedReceipts = await getReceipts();
      setReceipts(savedReceipts);
    } catch (error) {
      console.error("Error loading receipts:", error);
    }
  };

  const calculateMonthlyTotal = () => {
    const monthlyReceipts = receipts.filter((receipt) =>
      receipt.date.startsWith(selectedMonth)
    );
    return monthlyReceipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.total_amount || 0),
      0
    );
  };

  const calculateCategoryBreakdown = () => {
    const monthlyReceipts = receipts.filter((receipt) =>
      receipt.date.startsWith(selectedMonth)
    );

    const breakdown = {};
    monthlyReceipts.forEach((receipt) => {
      const category = receipt.category || "Other";
      const amount = parseFloat(receipt.total_amount) || 0;

      if (!breakdown[category]) {
        breakdown[category] = 0;
      }
      breakdown[category] += amount;
    });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getMonths = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthString = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      months.push({ value: monthString, label: monthName });
    }

    return months.reverse();
  };

  const monthlyTotal = calculateMonthlyTotal();
  const categoryBreakdown = calculateCategoryBreakdown();
  const months = getMonths();

  if (receipts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pie-chart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Data Yet</Text>
        <Text style={styles.emptyText}>
          Scan some receipts to see your expense summary
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.monthSelector}>
        <Text style={styles.sectionTitle}>Select Month</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.monthsContainer}>
            {months.map((month) => (
              <TouchableOpacity
                key={month.value}
                style={[
                  styles.monthButton,
                  selectedMonth === month.value && styles.monthButtonActive,
                ]}
                onPress={() => setSelectedMonth(month.value)}
              >
                <Text
                  style={[
                    styles.monthButtonText,
                    selectedMonth === month.value &&
                      styles.monthButtonTextActive,
                  ]}
                >
                  {month.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <Text style={styles.totalAmount}>${monthlyTotal.toFixed(2)}</Text>
        <Text style={styles.receiptCount}>
          {receipts.filter((r) => r.date.startsWith(selectedMonth)).length}{" "}
          receipts
        </Text>
      </View>

      <View style={styles.chartTypeSelector}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === "pie" && styles.chartTypeButtonActive,
          ]}
          onPress={() => setChartType("pie")}
        >
          <Text
            style={[
              styles.chartTypeText,
              chartType === "pie" && styles.chartTypeTextActive,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === "bar" && styles.chartTypeButtonActive,
          ]}
          onPress={() => setChartType("bar")}
        >
          <Text
            style={[
              styles.chartTypeText,
              chartType === "bar" && styles.chartTypeTextActive,
            ]}
          >
            Trends
          </Text>
        </TouchableOpacity>
      </View>

      <ExpenseChart receipts={receipts} type={chartType} />

      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Category Breakdown</Text>
        {categoryBreakdown.map((item, index) => (
          <View key={item.category} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <View
                style={[
                  styles.categoryColor,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              />
              <Text style={styles.categoryName}>{item.category}</Text>
              <Text style={styles.categoryAmount}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(item.amount / monthlyTotal) * 100}%`,
                    backgroundColor: getCategoryColor(item.category),
                  },
                ]}
              />
            </View>
            <Text style={styles.percentage}>
              {((item.amount / monthlyTotal) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  monthSelector: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  monthsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  monthButtonActive: {
    backgroundColor: "#007AFF",
  },
  monthButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  monthButtonTextActive: {
    color: "white",
  },
  summaryCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  receiptCount: {
    fontSize: 14,
    color: "#999",
  },
  chartTypeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    gap: 16,
  },
  chartTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  chartTypeButtonActive: {
    backgroundColor: "#007AFF",
  },
  chartTypeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  chartTypeTextActive: {
    color: "white",
  },
  breakdownCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  percentage: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
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
