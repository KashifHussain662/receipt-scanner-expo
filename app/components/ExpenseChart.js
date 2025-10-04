import { Dimensions, StyleSheet, Text, View } from "react-native";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryPie,
  VictoryTheme,
} from "victory-native";

const { width } = Dimensions.get("window");

export default function ExpenseChart({ receipts, type = "pie" }) {
  const categoryData = calculateCategoryData(receipts);
  const monthlyData = calculateMonthlyData(receipts);

  if (type === "pie") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spending by Category</Text>
        <VictoryPie
          data={categoryData}
          width={width - 32}
          height={300}
          colorScale={[
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#96CEB4",
            "#FFEAA7",
            "#DDA0DD",
            "#B2B2B2",
          ]}
          innerRadius={70}
          padAngle={2}
          style={{
            labels: {
              fill: "white",
              fontSize: 12,
              fontWeight: "bold",
            },
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Spending</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={20}
        width={width - 32}
        height={300}
      >
        <VictoryAxis
          tickFormat={monthlyData.map((d) => d.month)}
          style={{
            tickLabels: { fontSize: 10, angle: -45 },
          }}
        />
        <VictoryAxis dependentAxis tickFormat={(x) => `$${x}`} />
        <VictoryBar
          data={monthlyData}
          x="month"
          y="amount"
          style={{
            data: { fill: "#007AFF" },
          }}
        />
      </VictoryChart>
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

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    x: category,
    y: amount,
    label: `${category}\n$${amount.toFixed(2)}`,
  }));
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
});
