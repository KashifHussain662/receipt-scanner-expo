// App.js
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import AuthStack from "./app/Navigation/AuthStack";
import { store } from "./store";

// Firebase imports
import { ref, set } from "firebase/database";
import { db } from "./firebaseConfig";

export default function App() {
  useEffect(() => {
    // Test write to Firebase Realtime Database
    set(ref(db, "test/path"), {
      message: "Hello Firebase!",
      time: Date.now(),
    })
      .then(() => console.log("Write successful"))
      .catch((error) => console.error("Write failed:", error));
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </Provider>
  );
}
