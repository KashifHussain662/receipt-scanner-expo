// App.js
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import AuthStack from "./app/Navigation/AuthStack";
import { store } from "./store";

// Firebase imports
import { get, ref, set } from "firebase/database";
import { database } from "./firebaseConfig";



export default function App() {
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

  //    useEffect(() => {
  //   // App start hote hi Firebase se vendors fetch karein
  //   const loadVendorsFromFirebase = async () => {
  //     const vendors = await firebaseService.fetchVendorsFromFirebase();
  //     if (vendors.length > 0) {
  //       store.dispatch(setVendors(vendors));
  //     }
  //   };
    
  //   loadVendorsFromFirebase();
  // }, []);


  return (
    <Provider store={store}>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </Provider>
  );
}
