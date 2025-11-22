import { createStackNavigator } from "@react-navigation/stack";
import { get, ref, set } from "firebase/database";
import { useEffect } from "react";
import { database } from "../../firebaseConfig";
import CameraScreen from "../components/CameraScreen";
import FieldsScreen from "../screens/FieldsScreen";
import VendorDataScreen from "../screens/VendorDataScreen";
import AppTabs from "./AppTabs";

const Stack = createStackNavigator();

const AuthStack = () => {
  // Firebase connection test
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        const testRef = ref(database, "connection_test");
        await set(testRef, {
          timestamp: Date.now(),
          message: "Testing Firebase connection",
        });
        console.log("Firebase connection successful! Data written.");

        const snapshot = await get(testRef);
        console.log("Data retrieved:", snapshot.val());
      } catch (error) {
        console.error("Firebase connection failed:", error);
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="FieldsScreen"
        component={FieldsScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      <Stack.Screen
        name="VendorDataScreen"
        component={VendorDataScreen}
        options={{ title: "Vendor Data" }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
