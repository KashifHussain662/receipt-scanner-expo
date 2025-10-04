import AsyncStorage from "@react-native-async-storage/async-storage";

const RECEIPTS_KEY = "@receipts";

export const saveReceipt = async (receipt) => {
  try {
    const existingReceipts = await getReceipts();
    const newReceipt = {
      id: Date.now().toString(),
      ...receipt,
      createdAt: new Date().toISOString(),
    };

    const updatedReceipts = [...existingReceipts, newReceipt];
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(updatedReceipts));
    return newReceipt;
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw error;
  }
};

export const getReceipts = async () => {
  try {
    const receipts = await AsyncStorage.getItem(RECEIPTS_KEY);
    return receipts ? JSON.parse(receipts) : [];
  } catch (error) {
    console.error("Error getting receipts:", error);
    return [];
  }
};

export const deleteReceipt = async (id) => {
  try {
    const receipts = await getReceipts();
    const filteredReceipts = receipts.filter((receipt) => receipt.id !== id);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(filteredReceipts));
    return true;
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw error;
  }
};
