import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getReceipts } from "../../utils/storage";
import ExpenseChart from "../components/ExpenseChart";

const { width } = Dimensions.get("window");

export default function SummaryScreen() {
  const [receipts, setReceipts] = useState([]);
  const [chartType, setChartType] = useState("pie");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadReceipts();
    }, [])
  );

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const savedReceipts = await getReceipts();
      setReceipts(savedReceipts);
    } catch (error) {
      console.error("Error loading receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get current month in YYYY-MM format
  function getCurrentMonth() {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  }

  // Calculate monthly total
  const calculateMonthlyTotal = () => {
    const monthlyReceipts = receipts.filter(
      (receipt) => receipt.date && receipt.date.startsWith(selectedMonth)
    );
    return monthlyReceipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.total_amount || 0),
      0
    );
  };

  // Calculate previous month total for comparison
  const calculatePreviousMonthTotal = () => {
    const prevMonth = getPreviousMonth(selectedMonth);
    const prevMonthReceipts = receipts.filter(
      (receipt) => receipt.date && receipt.date.startsWith(prevMonth)
    );
    return prevMonthReceipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.total_amount || 0),
      0
    );
  };

  // Get previous month
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    let prevYear = year;
    let prevMonth = monthNum - 1;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
  };

  // Calculate category breakdown
  const calculateCategoryBreakdown = () => {
    const monthlyReceipts = receipts.filter(
      (receipt) => receipt.date && receipt.date.startsWith(selectedMonth)
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

  // Calculate monthly trends (last 6 months) - FIXED
  const calculateMonthlyTrends = () => {
    const months = getLastMonths(6);
    const trends = [];

    months.forEach((month) => {
      const monthReceipts = receipts.filter(
        (receipt) => receipt.date && receipt.date.startsWith(month.value)
      );
      const total = monthReceipts.reduce(
        (sum, receipt) => sum + parseFloat(receipt.total_amount || 0),
        0
      );

      trends.push({
        month: month.label,
        value: month.value,
        total: total,
        receiptCount: monthReceipts.length,
      });
    });

    return trends.reverse(); // Show oldest to newest
  };

  // Get last N months - FIXED
  const getLastMonths = (count) => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < count; i++) {
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

    return months;
  };

  // Get available months from receipts
  const getAvailableMonths = () => {
    const monthSet = new Set();
    receipts.forEach((receipt) => {
      if (receipt.date) {
        monthSet.add(receipt.date.slice(0, 7));
      }
    });

    return Array.from(monthSet)
      .sort()
      .reverse()
      .map((month) => {
        const date = new Date(month + "-01");
        return {
          value: month,
          label: date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        };
      });
  };

  const monthlyTotal = calculateMonthlyTotal();
  const previousMonthTotal = calculatePreviousMonthTotal();
  const categoryBreakdown = calculateCategoryBreakdown();
  const monthlyTrends = calculateMonthlyTrends();
  const availableMonths = getAvailableMonths();
  const currentMonthReceipts = receipts.filter(
    (r) => r.date && r.date.startsWith(selectedMonth)
  );

  // Calculate percentage change from previous month
  const getPercentageChange = () => {
    if (previousMonthTotal === 0) return monthlyTotal > 0 ? 100 : 0;
    return ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100;
  };

  // Get max amount for trend bar scaling - FIXED
  const getMaxTrendAmount = () => {
    const amounts = monthlyTrends.map((trend) => trend.total);
    return Math.max(...amounts, 1); // Ensure at least 1 to avoid division by zero
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#997bff" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  if (receipts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pie-chart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Expense Data</Text>
        <Text style={styles.emptyText}>
          Scan your first receipt to see detailed expense summaries and charts
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent} // Added for bottom spacing
    >
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <Text style={styles.sectionTitle}>Select Period</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthsScroll}
        >
          <View style={styles.monthsContainer}>
            {availableMonths.map((month) => (
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

      {/* Monthly Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <View style={styles.receiptCount}>
            <Ionicons name="receipt" size={16} color="#666" />
            <Text style={styles.receiptCountText}>
              {currentMonthReceipts.length} receipts
            </Text>
          </View>
        </View>

        <Text style={styles.totalAmount}>${monthlyTotal.toFixed(2)}</Text>

        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>vs Last Month</Text>
            <View
              style={[
                styles.changeIndicator,
                {
                  backgroundColor:
                    getPercentageChange() >= 0 ? "#4CAF50" : "#F44336",
                },
              ]}
            >
              <Ionicons
                name={
                  getPercentageChange() >= 0 ? "trending-up" : "trending-down"
                }
                size={12}
                color="white"
              />
              <Text style={styles.changeText}>
                {Math.abs(getPercentageChange()).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Daily Average</Text>
            <Text style={styles.dailyAverage}>
              ${(monthlyTotal / 30).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="card" size={20} color="#1976D2" />
          </View>
          <Text style={styles.statValue}>${monthlyTotal.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#E8F5E8" }]}>
            <Ionicons name="pricetag" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{categoryBreakdown.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="trending-up" size={20} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>
            {previousMonthTotal > 0 || monthlyTotal > 0
              ? Math.abs(getPercentageChange()).toFixed(0)
              : "0"}
            %
          </Text>
          <Text style={styles.statLabel}>Change</Text>
        </View>
      </View>

      {/* Chart Type Selector */}
      <View style={styles.chartTypeSelector}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === "pie" && styles.chartTypeButtonActive,
          ]}
          onPress={() => setChartType("pie")}
        >
          <Ionicons
            name="pie-chart"
            size={16}
            color={chartType === "pie" ? "white" : "#666"}
          />
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
          <Ionicons
            name="bar-chart"
            size={16}
            color={chartType === "bar" ? "white" : "#666"}
          />
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

      {/* Chart Component */}
      <ExpenseChart
        receipts={receipts}
        type={chartType}
        selectedMonth={selectedMonth}
      />

      {/* Category Breakdown */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownTitle}>Category Breakdown</Text>
          <Text style={styles.breakdownTotal}>
            Total: ${monthlyTotal.toFixed(2)}
          </Text>
        </View>

        {categoryBreakdown.length === 0 ? (
          <View style={styles.emptyBreakdown}>
            <Text style={styles.emptyBreakdownText}>
              No expenses for this period
            </Text>
          </View>
        ) : (
          categoryBreakdown.map((item, index) => (
            <View key={item.category} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryColor,
                      { backgroundColor: getCategoryColor(item.category) },
                    ]}
                  />
                  <Text style={styles.categoryName}>{item.category}</Text>
                </View>
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
              <View style={styles.breakdownFooter}>
                <Text style={styles.percentage}>
                  {((item.amount / monthlyTotal) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.receiptCount}>
                  {
                    currentMonthReceipts.filter(
                      (r) => r.category === item.category
                    ).length
                  }{" "}
                  receipts
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Monthly Trends - FIXED */}
      <View style={styles.trendsCard}>
        <Text style={styles.trendsTitle}>6-Month Spending Trend</Text>
        <View style={styles.trendsList}>
          {monthlyTrends.map((trend, index) => {
            const maxAmount = getMaxTrendAmount();
            const barWidth =
              maxAmount > 0 ? (trend.total / maxAmount) * 100 : 0;

            return (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendMonth}>{trend.month}</Text>
                <View style={styles.trendBarContainer}>
                  <View
                    style={[
                      styles.trendBar,
                      {
                        width: `${barWidth}%`,
                        backgroundColor:
                          trend.total > 0 ? "#997bff" : "#f0f0f0",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.trendAmount}>
                  ${trend.total.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
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
  scrollContent: {
    paddingBottom: 120, // Added bottom padding for spacing
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingBottom: 120, // Added bottom padding for empty state
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
  monthsScroll: {
    marginHorizontal: -16,
  },
  monthsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  monthButtonActive: {
    backgroundColor: "#997bff",
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
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  receiptCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  receiptCountText: {
    fontSize: 14,
    color: "#666",
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#997bff",
    marginBottom: 16,
    textAlign: "center",
  },
  comparisonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  comparisonItem: {
    alignItems: "center",
  },
  comparisonLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  dailyAverage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  chartTypeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  chartTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    gap: 6,
  },
  chartTypeButtonActive: {
    backgroundColor: "#997bff",
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
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  breakdownTotal: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyBreakdown: {
    padding: 20,
    alignItems: "center",
  },
  emptyBreakdownText: {
    fontSize: 14,
    color: "#999",
  },
  breakdownItem: {
    marginBottom: 20,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
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
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  breakdownFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  percentage: {
    fontSize: 12,
    color: "#999",
  },
  receiptCount: {
    fontSize: 12,
    color: "#999",
  },
  trendsCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 30,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
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
    width: 70,
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
    borderRadius: 4,
    minWidth: 0,
  },
  trendAmount: {
    width: 60,
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
  },
});
