import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import {
  equalTo,
  get,
  limitToFirst,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import { database } from "../firebaseConfig";

const OCR_API_KEY = "K87899142388957";
const OCR_API_URL = "https://api.ocr.space/parse/image";
const MAX_FILE_SIZE_KB = 1000;

// Firebase se vendor aur uske fields fetch karo
const findMatchingVendor = async (extractedVendorName) => {
  try {
    console.log("Firebase mein vendor dhoond raha hoon:", extractedVendorName);

    if (!extractedVendorName || extractedVendorName === "Unknown Vendor") {
      return null;
    }

    const searchName = extractedVendorName.toLowerCase().trim();

    const vendorsRef = ref(database, "vendors");
    const vendorsQuery = query(
      vendorsRef,
      orderByChild("name"),
      equalTo(searchName),
      limitToFirst(1)
    );

    const snapshot = await get(vendorsQuery);

    if (snapshot.exists()) {
      const vendorData = snapshot.val();
      const vendorId = Object.keys(vendorData)[0];
      const vendor = vendorData[vendorId];

      console.log("Firebase mein vendor mil gaya:", vendor);
      return {
        id: vendorId,
        ...vendor,
      };
    } else {
      console.log("Exact match nahi mila, partial search kar raha hoon...");
      return await findPartialVendorMatch(searchName);
    }
  } catch (error) {
    console.error("Firebase vendor search error:", error);
    return null;
  }
};

// Partial vendor match
const findPartialVendorMatch = async (searchName) => {
  try {
    const vendorsRef = ref(database, "vendors");
    const snapshot = await get(vendorsRef);

    if (!snapshot.exists()) {
      return null;
    }

    const vendors = snapshot.val();

    for (const vendorId in vendors) {
      const vendor = vendors[vendorId];
      const vendorName = vendor.name?.toLowerCase() || "";

      if (
        vendorName.includes(searchName) ||
        searchName.includes(vendorName) ||
        calculateSimilarity(vendorName, searchName) > 0.7
      ) {
        console.log("Partial vendor match mil gaya:", vendor);
        return {
          id: vendorId,
          ...vendor,
        };
      }
    }

    console.log("Koi partial match nahi mila");
    return null;
  } catch (error) {
    console.error("Partial vendor search error:", error);
    return null;
  }
};

// Smart field extraction - Ab har vendor ke liye automatically kaam karega
const extractCustomFieldsData = (parsedText, vendorFields) => {
  if (!vendorFields || !Array.isArray(vendorFields)) {
    return {};
  }

  const customFieldsData = {};
  const lines = parsedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log("Field extraction ke liye available lines:", lines);
  console.log("Extract karne ke liye vendor fields:", vendorFields);

  vendorFields.forEach((field) => {
    if (field.enabled) {
      let fieldValue = "";

      switch (field.type) {
        case "amount":
          fieldValue = smartAmountExtraction(lines, field.label);
          break;

        case "text":
          fieldValue = smartTextExtraction(lines, field.label);
          break;

        case "number":
          fieldValue = smartNumberExtraction(lines, field.label);
          break;

        case "date":
          fieldValue = smartDateExtraction(lines, field.label);
          break;

        default:
          fieldValue = smartTextExtraction(lines, field.label);
      }

      // Agar value nahi mili toh default value use karo
      if (!fieldValue && field.defaultValue) {
        fieldValue = field.defaultValue;
      }

      customFieldsData[field.key] = fieldValue;
      console.log(`Field "${field.label}" extract kiya:`, fieldValue);
    }
  });

  return customFieldsData;
};

// Smart amount extraction - Kisi bhi vendor ke liye kaam karega
const smartAmountExtraction = (lines, fieldLabel) => {
  try {
    const labelLower = fieldLabel.toLowerCase();
    console.log(`Amount field dhoond raha hoon: ${fieldLabel}`);

    // Pehle exact label match dhoondo
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (line.includes(labelLower)) {
        console.log(`Label "${fieldLabel}" line ${i} pe mila:`, lines[i]);

        // Current line mein amount dhoondo
        const amountMatch = lines[i].match(/(\d+[\.,]\d+)/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(",", ""));
          console.log(`Same line mein amount mila: ${amount}`);
          return amount;
        }

        // Next line check karo
        if (i + 1 < lines.length) {
          const nextLineAmount = lines[i + 1].match(/(\d+[\.,]\d+)/);
          if (nextLineAmount) {
            const amount = parseFloat(nextLineAmount[1].replace(",", ""));
            console.log(`Next line mein amount mila: ${amount}`);
            return amount;
          }
        }

        // Previous line check karo
        if (i > 0) {
          const prevLineAmount = lines[i - 1].match(/(\d+[\.,]\d+)/);
          if (prevLineAmount) {
            const amount = parseFloat(prevLineAmount[1].replace(",", ""));
            console.log(`Previous line mein amount mila: ${amount}`);
            return amount;
          }
        }
      }
    }

    // Agar exact match nahi mila toh partial match try karo
    const labelWords = labelLower.split(" ").filter((word) => word.length > 2);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Check if any important word matches
      const hasPartialMatch = labelWords.some((word) => line.includes(word));

      if (hasPartialMatch) {
        console.log(`Partial match "${fieldLabel}" line ${i} pe:`, lines[i]);

        const amountMatch = lines[i].match(/(\d+[\.,]\d+)/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(",", ""));
          console.log(`Partial match se amount mila: ${amount}`);
          return amount;
        }
      }
    }

    // Last resort: Receipt ke last section mein generic amount dhoondo
    for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
      const amountMatch = lines[i].match(/(\d+[\.,]\d+)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(",", ""));
        console.log(`Generic amount mila: ${amount}`);
        return amount;
      }
    }

    console.log(`Koi amount nahi mila ${fieldLabel} ke liye`);
    return 0;
  } catch (error) {
    console.error(`Amount extraction error ${fieldLabel} ke liye:`, error);
    return 0;
  }
};

// Smart text extraction
const smartTextExtraction = (lines, fieldLabel) => {
  try {
    const labelLower = fieldLabel.toLowerCase();
    console.log(`Text field dhoond raha hoon: ${fieldLabel}`);

    // Description type fields ke liye special handling
    if (
      labelLower.includes("description") ||
      labelLower.includes("item") ||
      labelLower.includes("product")
    ) {
      // Items list se first item lelo
      for (let i = 0; i < lines.length; i++) {
        if (
          lines[i].toLowerCase().includes("description") ||
          lines[i].toLowerCase().includes("item")
        ) {
          // Next few lines check karo for actual items
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            const itemLine = lines[j];
            if (itemLine && itemLine.length > 0) {
              // Text part extract karo (numbers se pehle)
              const textPart = itemLine.split(/\d/)[0].trim();
              if (textPart && textPart.length > 1) {
                console.log(`Item text mila: ${textPart}`);
                return textPart;
              }
            }
          }
        }
      }
    }

    // General text field extraction
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (line.includes(labelLower)) {
        console.log(`Label "${fieldLabel}" line ${i} pe mila:`, lines[i]);

        // Colon ke baad text lelo
        const colonIndex = lines[i].indexOf(":");
        if (colonIndex !== -1) {
          const textAfterColon = lines[i].substring(colonIndex + 1).trim();
          if (textAfterColon) {
            const cleanText = textAfterColon
              .replace(/[^\w\s]/gi, " ")
              .replace(/\s+/g, " ")
              .trim();
            if (cleanText) {
              console.log(`Colon ke baad text mila: ${cleanText}`);
              return cleanText;
            }
          }
        }

        // Next line check karo
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const cleanText = nextLine
            .replace(/[^\w\s]/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (cleanText && cleanText.length > 1) {
            console.log(`Next line se text mila: ${cleanText}`);
            return cleanText;
          }
        }
      }
    }

    // Partial match try karo
    const labelWords = labelLower.split(" ").filter((word) => word.length > 2);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      const hasPartialMatch = labelWords.some((word) => line.includes(word));

      if (hasPartialMatch) {
        console.log(
          `Partial text match "${fieldLabel}" line ${i} pe:`,
          lines[i]
        );

        const colonIndex = lines[i].indexOf(":");
        if (colonIndex !== -1) {
          const textAfterColon = lines[i].substring(colonIndex + 1).trim();
          if (textAfterColon) {
            const cleanText = textAfterColon
              .replace(/[^\w\s]/gi, " ")
              .replace(/\s+/g, " ")
              .trim();
            if (cleanText) return cleanText;
          }
        }

        // Line se numbers hata ke text lelo
        const textWithoutNumbers = lines[i].replace(/[\d\.,]/g, "").trim();
        if (
          textWithoutNumbers &&
          textWithoutNumbers.length > labelLower.length
        ) {
          return textWithoutNumbers;
        }
      }
    }

    console.log(`Koi text nahi mila ${fieldLabel} ke liye`);
    return "";
  } catch (error) {
    console.error(`Text extraction error ${fieldLabel} ke liye:`, error);
    return "";
  }
};

// Smart number extraction
const smartNumberExtraction = (lines, fieldLabel) => {
  try {
    const labelLower = fieldLabel.toLowerCase();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (line.includes(labelLower)) {
        const numberMatch = lines[i].match(/(\d+)/);
        if (numberMatch) return parseInt(numberMatch[1]);

        if (i + 1 < lines.length) {
          const nextLineNumber = lines[i + 1].match(/(\d+)/);
          if (nextLineNumber) return parseInt(nextLineNumber[1]);
        }
      }
    }

    return 0;
  } catch (error) {
    console.error(`Number extraction error ${fieldLabel} ke liye:`, error);
    return 0;
  }
};

// Smart date extraction
const smartDateExtraction = (lines, fieldLabel) => {
  try {
    const labelLower = fieldLabel.toLowerCase();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (line.includes(labelLower)) {
        const dateMatch = lines[i].match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (dateMatch) return new Date(dateMatch[1]).toISOString();
      }
    }

    // Agar date field hai but specific label nahi mila, toh koi bhi date dhoondo
    for (let i = 0; i < lines.length; i++) {
      const dateMatch = lines[i].match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (dateMatch) return new Date(dateMatch[1]).toISOString();
    }

    return new Date().toISOString();
  } catch (error) {
    console.error(`Date extraction error ${fieldLabel} ke liye:`, error);
    return new Date().toISOString();
  }
};

// Similarity function (same as before)
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  return (
    (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length)
  );
};

const editDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

// Vendor extraction (same as before)
const extractVendorName = (text) => {
  if (!text) return "Unknown Vendor";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 2);

  console.log("OCR Text lines:", lines);

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

  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i].toLowerCase();

    if (skipWords.some((word) => line.includes(word))) {
      continue;
    }

    if (
      line.length > 3 &&
      line.length < 50 &&
      !line.match(/^\d+$/) &&
      !line.match(/^\d+[\.,]\d+$/) &&
      !line.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/) &&
      (vendorIndicators.some((indicator) => line.includes(indicator)) ||
        line.split(" ").length <= 5)
    ) {
      console.log("Vendor mil gaya:", lines[i]);
      return capitalizeVendorName(lines[i]);
    }
  }

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

// Basic fields extraction
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

// Main OCR function
export const extractReceiptData = async (imageUri) => {
  try {
    console.log("OCR processing shuru kar raha hoon...");

    const processedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    const fileInfo = await FileSystem.getInfoAsync(processedImage.uri);
    const fileSizeKB = fileInfo.size / 1024;

    if (fileSizeKB > MAX_FILE_SIZE_KB) {
      const furtherCompressedImage = await manipulateAsync(
        processedImage.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: SaveFormat.JPEG }
      );
      return await sendToOCR(furtherCompressedImage.uri);
    }

    return await sendToOCR(processedImage.uri);
  } catch (error) {
    console.error("OCR Processing Error:", error);
    throw error;
  }
};

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

    console.log("OCR API ko bhej raha hoon...");
    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      throw new Error("OCR processing failed: " + result.ErrorMessage);
    }

    const parsedText = result.ParsedResults[0]?.ParsedText || "";
    console.log("Extracted Text length:", parsedText.length);

    // Vendor name extract karo
    const vendorName = extractVendorName(parsedText);
    console.log("Extracted Vendor:", vendorName);

    // Firebase mein vendor match karo
    const matchedVendor = await findMatchingVendor(vendorName);
    console.log("Firebase se matched vendor:", matchedVendor);

    // 🔥 Vendor ke custom fields ke hisaab se data extract karo
    let customFieldsData = {};
    if (matchedVendor && matchedVendor.fields) {
      console.log("Custom fields data extract kar raha hoon...");
      customFieldsData = extractCustomFieldsData(
        parsedText,
        matchedVendor.fields
      );
      console.log("Custom fields data extract ho gaya:", customFieldsData);
    }

    // Final receipt data banayo
    const receiptData = {
      vendor_name: vendorName,
      matched_vendor: matchedVendor,
      total_amount: extractTotalAmount(parsedText),
      tax: extractTax(parsedText),
      date: extractDate(parsedText),
      category: matchedVendor?.category || "Other",
      payment_method: "Cash",
      location: matchedVendor?.location || "",
      items: [],
      // 🔥 Custom fields data add karo
      custom_fields: customFieldsData,
      // Individual fields ko bhi root level pe add karo
      ...customFieldsData,
    };

    console.log("Final receipt data:", receiptData);
    return receiptData;
  } catch (error) {
    console.error("OCR API Error:", error);
    throw error;
  }
};

// Mock data
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
  ];

  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
  const total = Math.random() * 1000 + 100;
  const tax = total * 0.18;

  // Mock custom fields data
  const mockCustomFields = {
    description: "Sample product description",
    ipsum: 45.5,
    dolor_sit_amet: 23.75,
  };

  return {
    vendor_name: randomVendor,
    matched_vendor: null,
    total_amount: parseFloat(total.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    date: new Date().toISOString(),
    category: "Food & Drinks",
    payment_method: "Cash",
    location: "New Delhi",
    items: [],
    custom_fields: mockCustomFields,
    ...mockCustomFields,
  };
};
