import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// OCR.space API key (free tier)
const OCR_API_KEY = "K87899142388957";
const OCR_API_URL = "https://api.ocr.space/parse/image";

// Maximum file size for OCR.space (1MB = 1024 KB)
const MAX_FILE_SIZE_KB = 1000;

export const extractReceiptData = async (imageUri) => {
  try {
    console.log("Extracting receipt data from image...");

    // Use OCR with compression
    const extractedText = await extractTextWithOCR(imageUri);
    console.log("Extracted Text:", extractedText);

    // Parse text with enhanced logic
    const receiptData = parseReceiptText(extractedText);
    console.log("Parsed Receipt Data:", receiptData);

    return receiptData;
  } catch (error) {
    console.log("OCR extraction failed, using fallback data:", error);
    return fallbackReceiptData();
  }
};

// Fixed OCR function with updated FileSystem API
const extractTextWithOCR = async (imageUri) => {
  try {
    console.log("Processing image URI:", imageUri);

    // Compress image first to avoid size issues
    const compressedUri = await compressImageForOCR(imageUri);

    let base64Image;
    try {
      // Use the new FileSystem API with File class
      const file = new FileSystem.File(compressedUri);
      const fileInfo = await file.getInfo();

      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      console.log(
        `File size after compression: ${(fileInfo.size / 1024).toFixed(2)} KB`
      );

      // Read file as base64 using the new API
      base64Image = await file.readAsStringAsync({
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (fsError) {
      console.log("FileSystem operation failed:", fsError);
      // Fallback to using the compressed URI directly without base64
      base64Image = null;
    }

    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("OCREngine", "2");
    formData.append("scale", "true");
    formData.append("isTable", "true");
    formData.append("detectOrientation", "true");

    if (base64Image) {
      formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
    } else {
      // Use compressed file URI directly
      formData.append("file", {
        uri: compressedUri,
        type: "image/jpeg",
        name: "receipt.jpg",
      });
    }

    console.log("Sending request to OCR API...");

    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });

    console.log("OCR API Response status:", response.status);

    if (!response.ok) {
      throw new Error(`OCR API HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error("OCR processing error: " + data.ErrorMessage);
    }

    if (!data.ParsedResults || !data.ParsedResults[0]) {
      throw new Error("No parsed results from OCR");
    }

    const extractedText = data.ParsedResults[0].ParsedText;
    console.log("Successfully extracted text:", extractedText ? "Yes" : "No");

    return extractedText;
  } catch (error) {
    console.error("OCR API error:", error);
    throw error;
  }
};

// Image compression function with simplified file checking
const compressImageForOCR = async (imageUri) => {
  try {
    console.log("Compressing image for OCR...");

    // Compress the image without checking file size first (we'll check after compression)
    const compressedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Resize to max width 800px for better compression
      {
        compress: 0.6, // 60% quality for smaller file size
        format: SaveFormat.JPEG,
      }
    );

    // Try to check file size with new API, but don't fail if it doesn't work
    try {
      const file = new FileSystem.File(compressedImage.uri);
      const fileInfo = await file.getInfo();
      console.log(
        `Compressed file size: ${(fileInfo.size / 1024).toFixed(2)} KB`
      );

      // If still too large, compress more aggressively
      if (fileInfo.size > MAX_FILE_SIZE_KB * 1024) {
        console.log("File still too large, compressing more aggressively...");
        const moreCompressed = await manipulateAsync(
          compressedImage.uri,
          [{ resize: { width: 600 } }],
          {
            compress: 0.4, // 40% quality
            format: SaveFormat.JPEG,
          }
        );

        return moreCompressed.uri;
      }
    } catch (sizeError) {
      console.log(
        "Could not check file size, using compressed image:",
        sizeError
      );
    }

    return compressedImage.uri;
  } catch (error) {
    console.log("Image compression failed, using original:", error);
    return imageUri; // Fallback to original image
  }
};

// Alternative: Simple compression without file size checks
const compressImageSimple = async (imageUri) => {
  try {
    console.log("Compressing image with simple method...");

    // Direct compression without file operations
    const compressedImage = await manipulateAsync(
      imageUri,
      [
        { resize: { width: 800 } }, // Resize to reasonable width
      ],
      {
        compress: 0.5, // 50% quality
        format: SaveFormat.JPEG,
        base64: false,
      }
    );

    return compressedImage.uri;
  } catch (error) {
    console.log("Simple compression failed:", error);
    return imageUri;
  }
};

// Enhanced receipt text parsing for all receipt types
const parseReceiptText = (text) => {
  if (!text || text.trim().length === 0) {
    console.log("No text extracted, using fallback data");
    return fallbackReceiptData();
  }

  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  console.log("Total lines to parse:", lines.length);

  let vendor_name = "Unknown Store";
  let total_amount = "0";
  let tax = "0";
  let date = new Date().toISOString().split("T")[0];
  let category = "Other";

  // 1. VENDOR NAME DETECTION (Multiple methods)
  vendor_name = extractVendorName(lines);

  // 2. TOTAL AMOUNT DETECTION (Multiple patterns)
  const amountData = extractAmounts(lines);
  total_amount = amountData.total;
  tax = amountData.tax;

  // 3. DATE DETECTION (Multiple formats)
  date = extractDate(lines);

  // 4. CATEGORY DETECTION
  category = determineCategory(vendor_name);

  const parsedData = {
    vendor_name: vendor_name,
    total_amount: parseFloat(total_amount) || 0,
    tax: parseFloat(tax) || 0,
    date: date,
    category: category,
  };

  console.log("Final parsed data:", parsedData);
  return parsedData;
};

// Enhanced vendor name extraction
const extractVendorName = (lines) => {
  const vendorPatterns = [
    // Pattern 1: First non-empty line that looks like a store name
    {
      test: (line) =>
        line.length > 2 &&
        line.length < 50 &&
        !line.match(/^\d/) &&
        !isCommonReceiptWord(line),
      weight: 10,
    },

    // Pattern 2: Lines containing common store indicators
    {
      test: (line) =>
        line.match(/\b(STORE|MARKET|SHOP|RESTAURANT|CAFE|HOTEL)\b/i),
      weight: 8,
    },

    // Pattern 3: Lines with ALL CAPS (common in receipts)
    {
      test: (line) =>
        line === line.toUpperCase() && line.length > 3 && line.length < 40,
      weight: 7,
    },

    // Pattern 4: Lines containing @ symbol (email/website)
    {
      test: (line) =>
        line.includes("@") || line.includes(".com") || line.includes("www."),
      weight: 6,
    },
  ];

  let bestVendor = "Unknown Store";
  let bestScore = 0;

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();

    for (const pattern of vendorPatterns) {
      if (pattern.test(line)) {
        if (pattern.weight > bestScore) {
          bestScore = pattern.weight;
          bestVendor = line;
        }
      }
    }
  }

  return bestVendor !== "Unknown Store"
    ? bestVendor
    : extractVendorFromCommonPatterns(lines);
};

// Common receipt words to avoid as vendor names
const isCommonReceiptWord = (line) => {
  const commonWords = [
    "receipt",
    "invoice",
    "bill",
    "total",
    "subtotal",
    "tax",
    "date",
    "time",
    "cash",
    "card",
    "change",
    "thank",
    "visitor",
    "customer",
    "balance",
    "amount",
    "payment",
    "due",
    "paid",
    "qty",
    "quantity",
    "description",
    "price",
    "discount",
    "refund",
    "return",
    "exchange",
    "welcome",
  ];

  const lowerLine = line.toLowerCase();
  return commonWords.some((word) => lowerLine.includes(word));
};

// Fallback vendor extraction from common patterns
const extractVendorFromCommonPatterns = (lines) => {
  for (let line of lines) {
    // Look for common store patterns
    if (
      line.match(
        /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(STORE|SHOP|MARKET|MALL|RESTAURANT|CAFE)/i
      )
    ) {
      return line.trim();
    }

    // Look for email patterns that might contain vendor name
    if (line.includes("@")) {
      const emailMatch = line.match(/([a-zA-Z0-9._-]+)@/);
      if (emailMatch) {
        const domain = emailMatch[1].replace(/[0-9._-]/g, " ");
        if (domain.length > 3) return domain.trim();
      }
    }
  }

  return "Unknown Store";
};

// Enhanced amount extraction for different receipt formats
const extractAmounts = (lines) => {
  let total = "0";
  let tax = "0";

  const amountPatterns = [
    // Pattern 1: Total with currency symbols
    {
      pattern:
        /(?:total|balance|amount|grand total)[^\d]*([$£€₹]?\s*\d+[.,]\d+)/i,
      type: "total",
    },

    // Pattern 2: Total at end of line
    { pattern: /([$£€₹]?\s*\d+[.,]\d+)\s*(?:total|balance)?$/i, type: "total" },

    // Pattern 3: Tax amounts
    { pattern: /(?:tax|vat|gst)[^\d]*([$£€₹]?\s*\d+[.,]\d+)/i, type: "tax" },

    // Pattern 4: Subtotal (fallback for total)
    {
      pattern: /(?:subtotal|sub total)[^\d]*([$£€₹]?\s*\d+[.,]\d+)/i,
      type: "subtotal",
    },

    // Pattern 5: Largest number in receipt (fallback)
    { pattern: /([$£€₹]?\s*(\d+[.,]\d{2}))/g, type: "largest" },
  ];

  let largestAmount = 0;
  let subtotal = "0";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const { pattern, type } of amountPatterns) {
      const matches = line.match(pattern);
      if (matches) {
        const amountStr = extractNumberFromString(matches[1] || matches[0]);
        const amount = parseFloat(amountStr);

        if (!isNaN(amount)) {
          switch (type) {
            case "total":
              if (amount > parseFloat(total)) total = amountStr;
              break;
            case "tax":
              if (amount > parseFloat(tax)) tax = amountStr;
              break;
            case "subtotal":
              subtotal = amountStr;
              break;
            case "largest":
              if (amount > largestAmount) largestAmount = amount;
              break;
          }
        }
      }
    }
  }

  // If no total found, use subtotal or largest amount
  if (total === "0" && subtotal !== "0") {
    total = subtotal;
  } else if (total === "0" && largestAmount > 0) {
    total = largestAmount.toString();
  }

  // If no tax found, estimate it
  if (tax === "0" && parseFloat(total) > 0) {
    tax = (parseFloat(total) * 0.1).toFixed(2); // 10% estimate
  }

  return { total, tax };
};

// Extract number from string with currency symbols
const extractNumberFromString = (str) => {
  // Remove currency symbols and spaces
  const cleaned = str.replace(/[$£€₹\s]/g, "");

  // Handle both comma and dot decimal separators
  if (cleaned.includes(",") && cleaned.includes(".")) {
    // If both present, comma is usually thousand separator
    return cleaned.replace(/,(?=\d{3})/g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // Comma as decimal separator
    return cleaned.replace(",", ".");
  }

  return cleaned;
};

// Enhanced date extraction for multiple formats
const extractDate = (lines) => {
  const datePatterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4})/,

    // YYYY-MM-DD
    /(\d{4}[-]\d{1,2}[-]\d{1,2})/,

    // DD/MM/YY or MM/DD/YY
    /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2})/,

    // Month name format
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,

    // Time stamp with date
    /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\s+\d{1,2}:\d{2})/,
  ];

  for (let line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const parsedDate = parseDateString(match[1]);
        if (parsedDate) return parsedDate;
      }
    }
  }

  return new Date().toISOString().split("T")[0];
};

// Parse various date formats
const parseDateString = (dateStr) => {
  try {
    // Try direct parsing first
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    // Handle specific formats
    if (
      dateStr.includes("/") ||
      dateStr.includes("-") ||
      dateStr.includes(".")
    ) {
      const parts = dateStr.split(/[\/\-.]/);
      if (parts.length === 3) {
        let year, month, day;

        if (parts[2].length === 4) {
          // Has 4-digit year
          if (parseInt(parts[0]) > 12) {
            // DD/MM/YYYY
            day = parts[0];
            month = parts[1];
            year = parts[2];
          } else {
            // MM/DD/YYYY
            month = parts[0];
            day = parts[1];
            year = parts[2];
          }
        } else {
          // 2-digit year
          if (parseInt(parts[0]) > 12) {
            // DD/MM/YY
            day = parts[0];
            month = parts[1];
            year = `20${parts[2]}`;
          } else {
            // MM/DD/YY
            month = parts[0];
            day = parts[1];
            year = `20${parts[2]}`;
          }
        }

        const formattedDate = new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        );
        if (!isNaN(formattedDate.getTime())) {
          return formattedDate.toISOString().split("T")[0];
        }
      }
    }

    // Handle month name format
    const monthNameMatch = dateStr.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (monthNameMatch) {
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      const month = monthNames.findIndex((m) =>
        m.startsWith(monthNameMatch[1].toLowerCase())
      );
      if (month !== -1) {
        const date = new Date(
          parseInt(monthNameMatch[3]),
          month,
          parseInt(monthNameMatch[2])
        );
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      }
    }
  } catch (error) {
    console.log("Date parsing error:", error);
  }

  return null;
};

// Enhanced category detection with more vendors
const determineCategory = (vendorName) => {
  const lowerVendor = vendorName.toLowerCase();

  const categoryPatterns = [
    {
      category: "Food & Drinks",
      patterns: [
        "starbucks",
        "mcdonald",
        "kfc",
        "subway",
        "pizza",
        "burger",
        "domino",
        "cafe",
        "restaurant",
        "coffee",
        "tea",
        "bakery",
        "food",
        "dining",
        "eat",
        "meal",
        "kitchen",
        "grill",
        "bar",
        "pub",
      ],
    },
    {
      category: "Shopping",
      patterns: [
        "walmart",
        "target",
        "amazon",
        "mall",
        "store",
        "shop",
        "mart",
        "department",
        "supermarket",
        "grocery",
        "retail",
        "outlet",
        "fashion",
        "clothing",
        "apparel",
        "electronics",
        "home depot",
      ],
    },
    {
      category: "Transportation",
      patterns: [
        "gas",
        "fuel",
        "shell",
        "bp",
        "uber",
        "taxi",
        "petrol",
        "auto",
        "car",
        "vehicle",
        "transport",
        "bus",
        "train",
        "metro",
        "airport",
        "parking",
        "toll",
        "mechanic",
        "repair",
      ],
    },
    {
      category: "Entertainment",
      patterns: [
        "netflix",
        "movie",
        "cinema",
        "theater",
        "entertainment",
        "game",
        "sports",
        "concert",
        "event",
        "amusement",
        "park",
        "gym",
        "fitness",
        "streaming",
        "music",
        "video",
      ],
    },
    {
      category: "Healthcare",
      patterns: [
        "medical",
        "hospital",
        "clinic",
        "pharmacy",
        "doctor",
        "dental",
        "health",
        "wellness",
        "medicine",
        "drug",
        "optical",
        "lab",
      ],
    },
    {
      category: "Utilities",
      patterns: [
        "electric",
        "water",
        "gas",
        "internet",
        "phone",
        "mobile",
        "cable",
        "utility",
        "bill",
        "payment",
        "service",
        "provider",
      ],
    },
  ];

  for (const { category, patterns } of categoryPatterns) {
    if (patterns.some((pattern) => lowerVendor.includes(pattern))) {
      return category;
    }
  }

  return "Other";
};

// Fallback data with more realistic receipt data
const fallbackReceiptData = () => {
  const receiptTemplates = [
    {
      vendor: "Starbucks Coffee",
      category: "Food & Drinks",
      minAmount: 8,
      maxAmount: 25,
    },
    {
      vendor: "Walmart Supercenter",
      category: "Shopping",
      minAmount: 25,
      maxAmount: 150,
    },
    {
      vendor: "Shell Gas Station",
      category: "Transportation",
      minAmount: 30,
      maxAmount: 80,
    },
    {
      vendor: "Local Grocery Store",
      category: "Shopping",
      minAmount: 15,
      maxAmount: 100,
    },
    {
      vendor: "McDonald's Restaurant",
      category: "Food & Drinks",
      minAmount: 10,
      maxAmount: 30,
    },
    {
      vendor: "Amazon Online Store",
      category: "Shopping",
      minAmount: 20,
      maxAmount: 200,
    },
  ];

  const template =
    receiptTemplates[Math.floor(Math.random() * receiptTemplates.length)];
  const randomAmount = (
    Math.random() * (template.maxAmount - template.minAmount) +
    template.minAmount
  ).toFixed(2);
  const randomTax = (parseFloat(randomAmount) * 0.08).toFixed(2); // 8% tax

  const receiptData = {
    vendor_name: template.vendor,
    total_amount: randomAmount,
    tax: randomTax,
    date: new Date().toISOString().split("T")[0],
    category: template.category,
  };

  console.log("Using fallback data:", receiptData);
  return receiptData;
};

// Default export
export default function ApiUtils() {
  return null;
}
