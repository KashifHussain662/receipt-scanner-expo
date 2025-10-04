import * as FileSystem from "expo-file-system";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

const OCR_API_KEY = "K87899142388957";
const OCR_API_URL = "https://api.ocr.space/parse/image";

export const extractReceiptData = async (imageUri) => {
  try {
    return await extractWithGemini(imageUri);
  } catch (error) {
    console.log("Gemini failed, trying OCR:", error);
    return await extractWithOCR(imageUri);
  }
};

const extractWithGemini = async (imageUri) => {
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Analyze this receipt image and extract the following information in JSON format only. Return ONLY valid JSON, no other text:
            {
              "vendor_name": "extract the store or vendor name",
              "total_amount": "extract total amount as number",
              "tax": "extract tax amount as number, if not found use 0",
              "date": "extract date in YYYY-MM-DD format",
              "category": "choose from: Food & Drinks, Shopping, Transportation, Entertainment, Healthcare, Utilities, Other"
            }`,
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API error");
  }

  const responseText = data.candidates[0].content.parts[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  } else {
    throw new Error("No JSON found in response");
  }
};

const extractWithOCR = async (imageUri) => {
  const formData = new FormData();
  formData.append("apikey", OCR_API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append(
    "base64Image",
    `data:image/jpeg;base64,${await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    })}`
  );
  formData.append("OCREngine", "2");

  const response = await fetch(OCR_API_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    throw new Error("OCR processing error");
  }

  const extractedText = data.ParsedResults[0].ParsedText;
  return parseReceiptText(extractedText);
};

const parseReceiptText = (text) => {
  const lines = text.split("\n");

  let vendor_name = "Unknown";
  let total_amount = "0";
  let tax = "0";
  let date = new Date().toISOString().split("T")[0];
  let category = "Other";

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();

    if (vendor_name === "Unknown" && line.length > 0 && line.length < 50) {
      vendor_name = line.trim();
    }

    if (lowerLine.includes("total") || lowerLine.includes("amount")) {
      const amountMatch = line.match(/(\d+[.,]\d+)/);
      if (amountMatch) {
        total_amount = amountMatch[1].replace(",", ".");
      }
    }

    if (lowerLine.includes("tax")) {
      const taxMatch = line.match(/(\d+[.,]\d+)/);
      if (taxMatch) {
        tax = taxMatch[1].replace(",", ".");
      }
    }

    const dateMatch = line.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/);
    if (dateMatch) {
      date = formatDate(dateMatch[1]);
    }
  });

  return {
    vendor_name,
    total_amount: parseFloat(total_amount) || 0,
    tax: parseFloat(tax) || 0,
    date,
    category,
  };
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};
