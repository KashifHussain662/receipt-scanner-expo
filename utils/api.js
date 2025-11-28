import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { get, ref } from "firebase/database";
import { database } from "../firebaseConfig";

const OCR_API_KEY = "K87899142388957";
const OCR_API_URL = "https://api.ocr.space/parse/image";

// Firebase se vendor aur uske fields fetch karo
const findMatchingVendor = async (extractedVendorName) => {
  try {
    if (!extractedVendorName || extractedVendorName === "Unknown Vendor") {
      return null;
    }

    const vendorsRef = ref(database, "vendors");
    const snapshot = await get(vendorsRef);

    if (!snapshot.exists()) {
      return null;
    }

    const vendors = snapshot.val();
    const searchName = extractedVendorName.toLowerCase().trim();

    for (const vendorId in vendors) {
      const vendor = vendors[vendorId];
      const vendorName = vendor.name?.toLowerCase() || "";

      if (vendorName.includes(searchName) || searchName.includes(vendorName)) {
        return {
          id: vendorId,
          ...vendor,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Firebase vendor search error:", error);
    return null;
  }
};

// Items section identify karo
const findItemsSection = (lines) => {
  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes("description") || line.includes("item")) {
      start = i + 1;
    }

    if ((line.includes("total") || line.includes("subtotal")) && start !== -1) {
      end = i;
      break;
    }
  }

  return { start, end };
};

// Items section se field extract karo
const extractFromItemsSection = (lines, itemsSection, field) => {
  const fieldLabel = field.label.toLowerCase();

  for (let i = itemsSection.start; i < itemsSection.end; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes(fieldLabel)) {
      if (field.type === "amount" || field.type === "number") {
        const numbers = lines[i].match(/(\d+[\.,]\d+)/g);
        if (numbers && numbers.length > 0) {
          return parseFloat(numbers[numbers.length - 1].replace(",", ""));
        }
      } else {
        const textPart = lines[i].replace(/[\d\.,]/g, "").trim();
        if (textPart && textPart.length > 1) {
          const cleanText = textPart
            .replace(new RegExp(fieldLabel, "gi"), "")
            .trim();
          return cleanText || textPart;
        }
      }
    }
  }
  return null;
};

// Smart field extraction
const extractCustomFieldsData = (parsedText, vendorFields) => {
  if (!vendorFields || !Array.isArray(vendorFields)) {
    return {};
  }

  const customFieldsData = {};
  const lines = parsedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const itemsSection = findItemsSection(lines);

  vendorFields.forEach((field) => {
    if (field.enabled) {
      let fieldValue = "";

      if (itemsSection.start !== -1) {
        fieldValue = extractFromItemsSection(lines, itemsSection, field);
      }

      if (!fieldValue && field.defaultValue) {
        fieldValue = field.defaultValue;
      }

      if (field.type === "amount" || field.type === "number") {
        fieldValue = parseFloat(fieldValue) || 0;
      }

      customFieldsData[field.key] = fieldValue;
    }
  });

  return customFieldsData;
};

// Vendor extraction
const extractVendorName = (text) => {
  if (!text) return "Unknown Vendor";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 2);

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
  ];

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
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
      line.split(" ").length <= 5
    ) {
      return lines[i];
    }
  }

  return "Unknown Vendor";
};

// Main OCR function
export const extractReceiptData = async (imageUri) => {
  try {
    const processedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

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

    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      throw new Error("OCR processing failed");
    }

    const parsedText = result.ParsedResults[0]?.ParsedText || "";

    // Vendor name extract karo
    const vendorName = extractVendorName(parsedText);

    // Firebase mein vendor match karo
    const matchedVendor = await findMatchingVendor(vendorName);

    // Vendor ke custom fields ke hisaab se data extract karo
    let customFieldsData = {};
    if (matchedVendor && matchedVendor.fields) {
      customFieldsData = extractCustomFieldsData(
        parsedText,
        matchedVendor.fields
      );
    }

    // Final receipt data banayo
    const receiptData = {
      vendor_name: vendorName,
      matched_vendor: matchedVendor,
      custom_fields: customFieldsData,
      ...customFieldsData,
    };

    return receiptData;
  } catch (error) {
    console.error("OCR API Error:", error);
    throw error;
  }
};

// Mock data
// export const mockReceiptData = () => {
//   return {
//     vendor_name: "Shop Name",
//     matched_vendor: {
//       id: "1764018397524",
//       name: "Shop Name",
//       fields: [
//         {
//           defaultValue: "0",
//           enabled: true,
//           key: "dolor_sit_amet",
//           label: "Dolor Sit amet",
//           type: "number"
//         },
//         {
//           defaultValue: "0",
//           enabled: true,
//           key: "ipsum",
//           label: "Ipsum",
//           type: "number"
//         }
//       ]
//     },
//     custom_fields: {
//       dolor_sit_amet: 3.3,
//       ipsum: 2.2
//     },
//     dolor_sit_amet: 3.3,
//     ipsum: 2.2
//   };
// };
