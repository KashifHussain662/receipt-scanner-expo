import * as FileSystem from "expo-file-system/legacy"; // Legacy API import
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const OCR_API_KEY = "K87899142388957";
const OCR_API_URL = "https://api.ocr.space/parse/image";
const MAX_FILE_SIZE_KB = 1000;

// Vendor name extraction function
const extractVendorName = (text) => {
  if (!text) return "Unknown Vendor";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 2);

  console.log("OCR Text lines:", lines);

  // Common vendor indicators and patterns
  const vendorIndicators = [
    "restaurant",
    "cafe",
    "hotel",
    "mart",
    "store",
    "shop",
    "supermarket",
    "bazar",
    "enterprises",
    "limited",
    "ltd",
    "inc",
    "corporation",
    "foods",
    "bakery",
    "juice",
    "bar",
    "grill",
    "kitchen",
  ];

  // Skip common receipt headers
  const skipWords = [
    "tax",
    "invoice",
    "bill",
    "receipt",
    "total",
    "subtotal",
    "amount",
    "date",
    "time",
    "qty",
    "quantity",
    "price",
    "cash",
    "change",
    "thank",
    "visit",
    "welcome",
    "card",
    "debit",
    "credit",
    "gst",
  ];

  // Look for vendor name in first few lines
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i].toLowerCase();

    // Skip lines that are clearly not vendor names
    if (skipWords.some((word) => line.includes(word))) {
      continue;
    }

    // Check if line looks like a vendor name
    if (
      line.length > 3 &&
      line.length < 50 &&
      !line.match(/^\d+$/) &&
      !line.match(/^\d+[\.,]\d+$/) &&
      !line.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/) &&
      (vendorIndicators.some((indicator) => line.includes(indicator)) ||
        line.split(" ").length <= 5)
    ) {
      console.log("Found vendor:", lines[i]);
      return capitalizeVendorName(lines[i]);
    }
  }

  // Fallback: return first meaningful line
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 30 && !line.match(/^\d/)) {
      console.log("Fallback vendor:", line);
      return capitalizeVendorName(line);
    }
  }

  return "Unknown Vendor";
};

const capitalizeVendorName = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const extractTotalAmount = (text) => {
  const totalRegex = /total[\s:]*[\$₹]?\s*(\d+[\.,]\d+)/gi;
  const match = totalRegex.exec(text);
  return match ? parseFloat(match[1].replace(",", "")) : 0;
};

const extractTax = (text) => {
  const taxRegex = /tax[\s:]*[\$₹]?\s*(\d+[\.,]\d+)/gi;
  const match = taxRegex.exec(text);
  return match ? parseFloat(match[1].replace(",", "")) : 0;
};

const extractDate = (text) => {
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const match = dateRegex.exec(text);
  return match ? new Date(match[1]).toISOString() : new Date().toISOString();
};

// Main OCR function with new FileSystem API
export const extractReceiptData = async (imageUri) => {
  try {
    console.log("Starting OCR processing...");

    // Process image
    const processedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    // File size check with new API
    const fileInfo = await FileSystem.getInfoAsync(processedImage.uri);

    if (!fileInfo.exists) {
      throw new Error("Processed image file not found");
    }

    const fileSizeKB = fileInfo.size / 1024;
    console.log("File size:", fileSizeKB, "KB");

    if (fileSizeKB > MAX_FILE_SIZE_KB) {
      // If file is too large, compress further
      console.log("File too large, compressing further...");
      const furtherCompressedImage = await manipulateAsync(
        processedImage.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: SaveFormat.JPEG }
      );

      const newFileInfo = await FileSystem.getInfoAsync(
        furtherCompressedImage.uri
      );
      const newFileSizeKB = newFileInfo.size / 1024;
      console.log("New file size:", newFileSizeKB, "KB");

      if (newFileSizeKB > MAX_FILE_SIZE_KB) {
        throw new Error("File size too large even after compression");
      }

      // Use the further compressed image
      return await sendToOCR(furtherCompressedImage.uri);
    }

    return await sendToOCR(processedImage.uri);
  } catch (error) {
    console.error("OCR Processing Error:", error);
    throw error;
  }
};

// Separate function for OCR API call
const sendToOCR = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "receipt.jpg",
    });
    formData.append("language", "eng");
    formData.append("isTable", "true");
    formData.append("OCREngine", "2");

    console.log("Sending to OCR API...");
    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("OCR API Response received");

    if (result.IsErroredOnProcessing) {
      throw new Error("OCR processing failed: " + result.ErrorMessage);
    }

    const parsedText = result.ParsedResults[0]?.ParsedText || "";
    console.log("Extracted Text length:", parsedText.length);

    // Extract vendor name and other data
    const vendorName = extractVendorName(parsedText);

    console.log("Extracted Vendor:", vendorName);

    return {
      vendor_name: vendorName,
      total_amount: extractTotalAmount(parsedText),
      tax: extractTax(parsedText),
      date: extractDate(parsedText),
      category: "Other",
      payment_method: "Cash",
      location: "",
      items: [],
    };
  } catch (error) {
    console.error("OCR API Error:", error);
    throw error;
  }
};

// Enhanced mock data for better testing
export const mockReceiptData = () => {
  const vendors = [
    "Domino's Pizza",
    "Starbucks Coffee",
    "Big Bazaar",
    "Reliance Fresh",
    "McDonald's",
    "KFC",
    "Subway",
    "Burger King",
    "Pizza Hut",
    "Cafe Coffee Day",
    "More Supermarket",
    "DMart",
    "Food Court",
    "Local Restaurant",
  ];

  const categories = [
    "Food & Drinks",
    "Shopping",
    "Groceries",
    "Fast Food",
    "Restaurant",
  ];

  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const total = Math.random() * 1000 + 100;
  const tax = total * 0.18; // 18% GST

  return {
    vendor_name: randomVendor,
    total_amount: parseFloat(total.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    date: new Date().toISOString(),
    category: randomCategory,
    payment_method: Math.random() > 0.5 ? "Card" : "Cash",
    location: "New Delhi",
    items: [
      { name: "Item 1", price: (total * 0.3).toFixed(2) },
      { name: "Item 2", price: (total * 0.4).toFixed(2) },
      { name: "Item 3", price: (total * 0.3).toFixed(2) },
    ],
  };
};
