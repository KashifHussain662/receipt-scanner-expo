import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import ReceiptsScreen from "./screens/ReceiptsScreen";
import ScanScreen from "./screens/ScanScreen";
import SummaryScreen from "./screens/SummaryScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Scan") {
              iconName = focused ? "camera" : "camera-outline";
            } else if (route.name === "Receipts") {
              iconName = focused ? "receipt" : "receipt-outline";
            } else if (route.name === "Summary") {
              iconName = focused ? "pie-chart" : "pie-chart-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Receipts" component={ReceiptsScreen} />
        <Tab.Screen name="Summary" component={SummaryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
