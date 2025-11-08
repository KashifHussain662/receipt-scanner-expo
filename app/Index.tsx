import React from "react";
import { View } from "react-native";
import { Provider } from 'react-redux';
import { store } from '../store';
import AuthStack from "./Navigation/AuthStack";

export default function Index() {
  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <AuthStack />
      </View>
    </Provider>
  );
}