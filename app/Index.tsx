import React from "react";
import { View } from "react-native";
import AuthStack from "./Navigation/AuthStack";

export default function Index() {
  // console.log("Firebase App: ", auth);
  return (
    <View style={{ flex: 1 }}>
      <AuthStack />
    </View>
  );
}
