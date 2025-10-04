import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function ExpenseChart({ receipts, type = "pie" }) {
  const categoryData = calculateCategoryData(receipts);
  const monthlyData = calculateMonthlyData(receipts);

  if (receipts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending by Category</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No receipt data available</Text>
          <Text style={styles.emptySubtext}>
            Scan some receipts to see charts
          </Text>
        </View>
      </View>
    );
  }

  if (type === "pie") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending by Category</Text>
        <ScrollView style={styles.categoryList}>
          {categoryData.map((item, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryColor,
                    { backgroundColor: getCategoryColor(item.x) },
                  ]}
                />
                <Text style={styles.categoryName}>{item.x}</Text>
                <Text style={styles.categoryAmount}>${item.y.toFixed(2)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (item.y /
                          categoryData.reduce((sum, cat) => sum + cat.y, 0)) *
                        100
                      }%`,
                      backgroundColor: getCategoryColor(item.x),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Spending</Text>
      <ScrollView style={styles.monthlyList}>
        {monthlyData.map((item, index) => (
          <View key={index} style={styles.monthlyItem}>
            <Text style={styles.monthName}>{item.month}</Text>
            <View style={styles.amountBar}>
              <View
                style={[
                  styles.amountFill,
                  {
                    width: `${
                      (item.amount /
                        Math.max(...monthlyData.map((m) => m.amount))) *
                      80
                    }%`,
                  },
                ]}
              />
              <Text style={styles.monthAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const calculateCategoryData = (receipts) => {
  const categoryTotals = {};

  receipts.forEach((receipt) => {
    const category = receipt.category || "Other";
    const amount = parseFloat(receipt.total_amount) || 0;

    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += amount;
  });

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({ x: category, y: amount }))
    .sort((a, b) => b.y - a.y);
};

const calculateMonthlyData = (receipts) => {
  const monthlyTotals = {};

  receipts.forEach((receipt) => {
    const date = new Date(receipt.date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const amount = parseFloat(receipt.total_amount) || 0;

    if (!monthlyTotals[monthYear]) {
      monthlyTotals[monthYear] = 0;
    }
    monthlyTotals[monthYear] += amount;
  });

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({
      month: month.slice(5),
      amount,
    }));
};

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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
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
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  monthlyList: {
    maxHeight: 300,
  },
  monthlyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  monthName: {
    width: 40,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  amountBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  amountFill: {
    height: 20,
    backgroundColor: "#007AFF",
    borderRadius: 4,
    marginRight: 8,
  },
  monthAmount: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    minWidth: 60,
  },
});
