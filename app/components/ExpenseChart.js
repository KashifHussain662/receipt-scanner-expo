import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function ExpenseChart({
  receipts,
  type = "pie",
  selectedMonth,
}) {
  const categoryData = calculateCategoryData(receipts, selectedMonth);
  const monthlyData = calculateMonthlyData(receipts);

  if (receipts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {type === "pie" ? "Spending by Category" : "Monthly Spending Trend"}
        </Text>
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
    const filteredData = categoryData.filter((item) => item.y > 0);

    if (filteredData.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Spending by Category</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No expenses for selected period
            </Text>
            <Text style={styles.emptySubtext}>
              Try selecting a different month
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending by Category</Text>
        <ScrollView style={styles.categoryList}>
          {filteredData.map((item, index) => (
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
                          filteredData.reduce((sum, cat) => sum + cat.y, 0)) *
                        100
                      }%`,
                      backgroundColor: getCategoryColor(item.x),
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentage}>
                {(
                  (item.y / filteredData.reduce((sum, cat) => sum + cat.y, 0)) *
                  100
                ).toFixed(1)}
                %
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Bar chart view - Monthly trends
  return (
    <View style={styles.container}>
      <Text style={styles.title}>6-Month Spending Trend</Text>
      <View style={styles.trendsList}>
        {monthlyData.map((item, index) => (
          <View key={index} style={styles.trendItem}>
            <Text style={styles.trendMonth}>{item.month}</Text>
            <View style={styles.trendBarContainer}>
              <View
                style={[
                  styles.trendBar,
                  {
                    width: `${
                      (item.amount /
                        Math.max(...monthlyData.map((t) => t.amount)) || 1) * 80
                    }%`,
                    opacity: item.amount > 0 ? 1 : 0.3,
                  },
                ]}
              />
            </View>
            <Text style={styles.trendAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const calculateCategoryData = (receipts, selectedMonth) => {
  const categoryTotals = {};

  const filteredReceipts = selectedMonth
    ? receipts.filter((receipt) => receipt.date.startsWith(selectedMonth))
    : receipts;

  filteredReceipts.forEach((receipt) => {
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

  // Get last 6 months
  const months = [];
  const currentDate = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const monthString = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    months.push({
      value: monthString,
      label: monthName,
      amount: monthlyTotals[monthString] || 0,
    });
  }

  return months;
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
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
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
    color: "#333",
  },
  emptyContainer: {
    height: 120,
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
  percentage: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  trendsList: {
    gap: 12,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trendMonth: {
    width: 40,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  trendBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  trendBar: {
    height: "100%",
    backgroundColor: "#997bff",
    borderRadius: 4,
  },
  trendAmount: {
    width: 60,
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
  },
});
