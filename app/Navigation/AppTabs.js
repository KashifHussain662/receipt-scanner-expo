import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import ReceiptsScreen from "../screens/ReceiptsScreen";
import ScanScreen from "../screens/ScanScreen";
import SummaryScreen from "../screens/SummaryScreen";

const { width } = Dimensions.get("window");

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <View style={styles.container}>
      <View style={styles.tabBarBackground} />
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
            } else if (route.name === "Settings") {
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
            backgroundColor: "#fff",
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 60 : 70,
            marginHorizontal: width * 0.05,
            borderRadius: 124,
            position: "absolute",
            bottom: Platform.OS === "ios" ? 20 : 12,
            left: 0,
            right: 0,
            bottom: 40,
            elevation: 12,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 5 },
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
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 90 : 80,
    backgroundColor: "#f2f2f2",
    borderTopLeftRadius: 124,
    borderTopRightRadius: 124,
    zIndex: -1,
  },
});
