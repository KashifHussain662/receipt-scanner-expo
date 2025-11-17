// App.js
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from "react-redux";
import AuthStack from "./app/Navigation/AuthStack";

import { store } from "./store";

export default function App() {
  return (
    <Provider store={store}>
       <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </Provider>
  );
}
