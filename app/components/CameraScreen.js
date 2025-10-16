import { useNavigation, useRoute } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onPhotoTaken } = route.params;

  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing && cameraReady) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false,
        });

        if (!photo.uri) {
          throw new Error("Photo URI is undefined");
        }

        // Call the callback and go back
        onPhotoTaken(photo.uri);
        navigation.goBack();
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={true}
      />

      <CameraView
        style={styles.fullScreenCamera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={handleCameraReady}
        mode="picture"
      />

      {/* Overlay with absolute positioning */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.captureArea}>
          <View style={styles.captureFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <Text style={styles.captureText}>
            {isProcessing ? "Processing..." : "Align receipt within frame"}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.flipButton,
                (isProcessing || !cameraReady) && styles.buttonDisabled,
              ]}
              onPress={() =>
                setFacing((current) => (current === "back" ? "front" : "back"))
              }
              disabled={isProcessing || !cameraReady}
            >
              <Text style={styles.flipButtonText}>🔄 Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled,
                !cameraReady && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isProcessing || !cameraReady}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullScreenCamera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  captureArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  captureFrame: {
    width: 300,
    height: 400,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#fff",
  },
  cornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
  },
  cornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#fff",
  },
  cornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
  },
  captureText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDisabled: {
    backgroundColor: "gray",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "red",
  },
  flipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  flipButtonText: {
    color: "white",
    fontSize: 14,
  },
  placeholder: {
    width: 70,
  },
  message: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    minWidth: 200,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    minWidth: 200,
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontWeight: "500",
  },
});
