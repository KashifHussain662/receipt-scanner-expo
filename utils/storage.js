import AsyncStorage from "@react-native-async-storage/async-storage";
import { push, ref, set, update } from "firebase/database";
import { database } from "../firebaseConfig";

// Receipt ko custom fields ke saath save karo
export const saveReceipt = async (receiptData) => {
  try {
    const receiptId = Date.now().toString();
    const receipt = {
      id: receiptId,
      ...receiptData,
      createdAt: new Date().toISOString(),
      status: "draft", // draft, saved
    };

    // AsyncStorage mein save karo
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

// Receipt ko Firebase mein final save karo
export const saveReceiptToFirebase = async (receiptData) => {
  try {
    console.log("Firebase mein receipt save kar raha hoon...");

    const receiptWithTimestamp = {
      ...receiptData,
      savedAt: new Date().toISOString(),
      status: "saved",
    };

    // Firebase mein save karo
    const receiptsRef = ref(database, "receipts");
    const newReceiptRef = push(receiptsRef);
    await set(newReceiptRef, {
      ...receiptWithTimestamp,
      // Vendor reference bhi save karo
      vendor_id: receiptData.matched_vendor?.id || null,
      vendor_name: receiptData.vendor_name,
      firebase_id: newReceiptRef.key,
    });

    // Local storage mein status update karo
    const existingReceipts = await AsyncStorage.getItem("receipts");
    const receipts = existingReceipts ? JSON.parse(existingReceipts) : [];

    const updatedReceipts = receipts.map((receipt) =>
      receipt.id === receiptData.id
        ? { ...receipt, status: "saved", firebase_id: newReceiptRef.key }
        : receipt
    );

    await AsyncStorage.setItem("receipts", JSON.stringify(updatedReceipts));

    console.log("Receipt Firebase mein successfully save ho gaya");
    return { ...receiptWithTimestamp, firebase_id: newReceiptRef.key };
  } catch (firebaseError) {
    console.error("Firebase save error:", firebaseError);
    throw firebaseError;
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
