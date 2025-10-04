// Use mock data since we don't have API key
const USE_MOCK_DATA = true;

// Mock data function - yeh export karna important hai
export const mockReceiptData = () => {
  const vendors = [
    "Starbucks",
    "McDonald's",
    "Walmart",
    "Target",
    "Amazon",
    "Local Grocery Store",
  ];
  const categories = [
    "Food & Drinks",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Utilities",
  ];

  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const randomAmount = (Math.random() * 100 + 10).toFixed(2);
  const randomTax = (parseFloat(randomAmount) * 0.1).toFixed(2);

  return {
    vendor_name: randomVendor,
    total_amount: randomAmount,
    tax: randomTax,
    date: new Date().toISOString().split("T")[0],
    category: randomCategory,
  };
};

export const extractReceiptData = async (imageUri) => {
  // Directly use mock data for now
  console.log("Using mock receipt data");
  return mockReceiptData();
};

// Simple fallback function for basic text extraction (agar future mein use karna ho)
const extractWithOCR = async (imageUri) => {
  try {
    // Simple mock implementation
    return mockReceiptData();
  } catch (error) {
    console.error("OCR failed:", error);
    return mockReceiptData();
  }
};

// Default export for any routing
export default function ApiUtils() {
  return null;
}
