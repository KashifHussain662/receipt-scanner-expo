import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, set, update } from "firebase/database";
import { database } from "../firebaseConfig";

export const saveReceipt = async (receiptData) => {
  try {
    const receiptId = Date.now().toString();
    const receipt = {
      id: receiptId,
      ...receiptData,
      createdAt: new Date().toISOString(),
      status: "draft",
    };

    const existingReceipts = await AsyncStorage.getItem("receipts");
    const receipts = existingReceipts ? JSON.parse(existingReceipts) : [];
    receipts.unshift(receipt);
    await AsyncStorage.setItem("receipts", JSON.stringify(receipts));

    console.log("Receipt local save ho gaya:", receipt.custom_fields);
    return receipt;
  } catch (error) {
    console.error("Receipt save karne mein error:", error);
    throw error;
  }
};

// Existing receipt update karo
export const updateReceipt = async (receiptId, updatedData) => {
  try {
    const existingReceipts = await AsyncStorage.getItem("receipts");
    const receipts = existingReceipts ? JSON.parse(existingReceipts) : [];

    const updatedReceipts = receipts.map((receipt) =>
      receipt.id === receiptId
        ? { ...receipt, ...updatedData, updatedAt: new Date().toISOString() }
        : receipt
    );

    await AsyncStorage.setItem("receipts", JSON.stringify(updatedReceipts));

    // Agar Firebase mein bhi save hai toh wahan bhi update karo
    const receipt = updatedReceipts.find((r) => r.id === receiptId);
    if (receipt.firebase_id) {
      const receiptRef = ref(database, `receipts/${receipt.firebase_id}`);
      await update(receiptRef, updatedData);
    }

    return receipt;
  } catch (error) {
    console.error("Receipt update karne mein error:", error);
    throw error;
  }
};

// Receipts fetch karo
export const getReceipts = async () => {
  try {
    const receipts = await AsyncStorage.getItem("receipts");
    return receipts ? JSON.parse(receipts) : [];
  } catch (error) {
    console.error("Receipts fetch karne mein error:", error);
    return [];
  }
};

// Specific receipt delete karo
export const deleteReceipt = async (receiptId) => {
  try {
    const existingReceipts = await AsyncStorage.getItem("receipts");
    const receipts = existingReceipts ? JSON.parse(existingReceipts) : [];

    const receiptToDelete = receipts.find((r) => r.id === receiptId);
    const updatedReceipts = receipts.filter(
      (receipt) => receipt.id !== receiptId
    );

    await AsyncStorage.setItem("receipts", JSON.stringify(updatedReceipts));

    // Firebase se bhi delete karo agar saved hai
    if (receiptToDelete?.firebase_id) {
      const receiptRef = ref(
        database,
        `receipts/${receiptToDelete.firebase_id}`
      );
      await set(receiptRef, null);
    }

    return true;
  } catch (error) {
    console.error("Receipt delete karne mein error:", error);
    throw error;
  }
};
