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
import CameraScreen from "../components/CameraScreen";
import ReceiptCard from "../components/ReceiptCard";
import { extractReceiptData } from "../utils/api";
import { saveReceipt } from "../utils/storage";

export default function ScanScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedReceipt, setScannedReceipt] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
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

  const processImage = async (imageUri) => {
    setIsProcessing(true);
    try {
      const receiptData = await extractReceiptData(imageUri);
      const savedReceipt = await saveReceipt(receiptData);
      setScannedReceipt(savedReceipt);
      Alert.alert("Success", "Receipt scanned and saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to process receipt. Please try again.");
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoTaken = (imageUri) => {
    setShowCamera(false);
    processImage(imageUri);
  };

  const handleDeleteReceipt = async (id) => {
    setScannedReceipt(null);
  };

  if (showCamera) {
    return (
      <CameraScreen
        onPhotoTaken={handlePhotoTaken}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Receipt</Text>
        <Text style={styles.subtitle}>
          Capture or upload a receipt to extract and save expense details
        </Text>
      </View>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Processing receipt...</Text>
        </View>
      )}

      {!isProcessing && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.actionButtonText}>📷 Camera</Text>
            <Text style={styles.actionButtonSubtext}>Take a photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionButtonText}>🖼️ Gallery</Text>
            <Text style={styles.actionButtonSubtext}>Choose from gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {scannedReceipt && !isProcessing && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Scanned Receipt</Text>
          <ReceiptCard
            receipt={scannedReceipt}
            onDelete={handleDeleteReceipt}
          />
        </View>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for better scanning:</Text>
        <Text style={styles.tip}>• Ensure good lighting</Text>
        <Text style={styles.tip}>• Keep receipt flat and in focus</Text>
        <Text style={styles.tip}>• Include entire receipt in frame</Text>
        <Text style={styles.tip}>• Avoid glare and shadows</Text>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  tipsContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
