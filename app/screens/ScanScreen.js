import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { extractReceiptData, mockReceiptData } from "../../utils/api";
import { saveReceipt } from "../../utils/storage";
import ReceiptCard from "../components/ReceiptCard";

export default function ScanScreen() {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedReceipt, setScannedReceipt] = useState(null);
  const [extractedVendor, setExtractedVendor] = useState("");
  const [vendorMatch, setVendorMatch] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error(error);
    }
  };

  const openCamera = () => {
    navigation.navigate("CameraScreen", {
      onPhotoTaken: handlePhotoTaken,
    });
  };

  const processImage = async (imageUri) => {
    setIsProcessing(true);
    setExtractedVendor("");
    setVendorMatch(null);

    try {
      console.log("Processing image for vendor extraction...");

      let receiptData;
      try {
        receiptData = await extractReceiptData(imageUri);
        setExtractedVendor(receiptData.vendor_name);
        setVendorMatch(receiptData.matched_vendor);
      } catch (apiError) {
        console.log("API failed, using mock data:", apiError);
        receiptData = mockReceiptData();
        setExtractedVendor(receiptData.vendor_name);
        setVendorMatch(null);
      }

      const savedReceipt = await saveReceipt(receiptData);
      setScannedReceipt(savedReceipt);

      // Show appropriate alert based on vendor match
      if (receiptData.matched_vendor) {
        Alert.alert(
          "✅ Vendor Matched!",
          `Vendor: ${receiptData.vendor_name}\n\nCategory: ${receiptData.matched_vendor.category}\nLocation: ${receiptData.matched_vendor.location}`
        );
      } else {
        Alert.alert(
          "📋 Vendor Detected",
          `Vendor: ${receiptData.vendor_name}\n\nNo exact match found in database. Using default category.`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process receipt. Please try again.");
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoTaken = (imageUri) => {
    processImage(imageUri);
  };

  const handleDeleteReceipt = async (id) => {
    setScannedReceipt(null);
    setExtractedVendor("");
    setVendorMatch(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Receipt</Text>
        <Text style={styles.subtitle}>
          Capture receipt to extract vendor and match with database
        </Text>
      </View>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>
            Extracting vendor details...
          </Text>
          {extractedVendor && (
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorFound}>Vendor: {extractedVendor}</Text>
              <Text style={styles.matchingText}>Matching with database...</Text>
            </View>
          )}
        </View>
      )}

      {!isProcessing && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={openCamera}>
            <Text style={styles.actionButtonText}>📷 Camera</Text>
            <Text style={styles.actionButtonSubtext}>
              Take photo of receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionButtonText}>🖼️ Gallery</Text>
            <Text style={styles.actionButtonSubtext}>Choose from gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {scannedReceipt && !isProcessing && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Scanned Receipt</Text>

          {/* Vendor Match Status */}
          {/* <View
            style={[
              styles.matchStatus,
              vendorMatch ? styles.matchSuccess : styles.matchNotFound,
            ]}
          >
            <Text style={styles.matchStatusText}>
              {vendorMatch ? "✅ Database Match Found" : "ℹ️ New Vendor"}
            </Text>
            <Text style={styles.vendorName}>{scannedReceipt.vendor_name}</Text>
            {vendorMatch && (
              <Text style={styles.matchDetails}>
                Category: {vendorMatch.category} | Location:{" "}
                {vendorMatch.location}
              </Text>
            )}
          </View> */}

          <ReceiptCard
            receipt={scannedReceipt}
            onDelete={handleDeleteReceipt}
          />
        </View>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Vendor Matching:</Text>
        <Text style={styles.tip}>
          • Automatically matches with Firebase database
        </Text>
        <Text style={styles.tip}>• Uses exact and partial name matching</Text>
        <Text style={styles.tip}>
          • Updates category and location from database
        </Text>
        <Text style={styles.tip}>• Shows match status immediately</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  processingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  vendorInfo: {
    alignItems: "center",
    marginTop: 12,
  },
  vendorFound: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  matchingText: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  resultContainer: {
    padding: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    paddingLeft: 16,
  },
  matchStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  matchSuccess: {
    backgroundColor: "#E8F5E8",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  matchNotFound: {
    backgroundColor: "#FFF3E0",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  matchStatusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 12,
    color: "#666",
  },
  tipsContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  tip: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
});
