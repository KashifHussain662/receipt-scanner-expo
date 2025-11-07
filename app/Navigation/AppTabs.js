import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import CustomFieldsScreen from "../screens/CustomFieldsScreen";
import ReceiptsScreen from "../screens/ReceiptsScreen";
import ScanScreen from "../screens/ScanScreen";
import SummaryScreen from "../screens/SummaryScreen";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Scan") {
              iconName = "camera-outline";
            } else if (route.name === "Receipts") {
              iconName = "receipt-outline";
            } else if (route.name === "Summary") {
              iconName = "pie-chart-outline";
            } else if (route.name === "CustomFieldsScreen") {
              iconName = "settings-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#997bff",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: {
            fontSize: width * 0.03,
            fontWeight: "600",
          },
          tabBarStyle: {
            position: "absolute",
            bottom: Platform.OS === "ios" ? 30 : 20,
            left: width * 0.1,
            right: width * 0.1,
            elevation: 12,
            backgroundColor: "#fff",
            borderRadius: 40,
            height: Platform.OS === "ios" ? 70 : 65,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            borderTopWidth: 0,
          },
          headerStyle: {
            backgroundColor: "#997bff",
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        })}
      >
        <Tab.Screen
          name="CustomFieldsScreen"
          component={CustomFieldsScreen}
          options={{ title: "Create Fields" }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{ title: "Scan Receipt" }}
        />
        <Tab.Screen
          name="Receipts"
          component={ReceiptsScreen}
          options={{ title: "My Receipts" }}
        />
        <Tab.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ title: "Expense Summary" }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
});
