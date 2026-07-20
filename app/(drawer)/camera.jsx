import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useSurveys } from "@/context/SurveyContext";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const { surveys, updateSurvey, addSurvey } = useSurveys();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [photoUri, setPhotoUri] = useState(null);
  const [captureTime, setCaptureTime] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectSurveyModalOpen, setIsSelectSurveyModalOpen] = useState(false);

  const hasCameraPermission = cameraPermission?.granted;

  if (!cameraPermission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#2563EB" size="large" />
        <Text style={styles.loadingText}>Opening GeoField Camera...</Text>
      </View>
    );
  }

  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <StatusBar backgroundColor="#1E40AF" barStyle="light-content" />
        <View style={styles.permHeader}>
          <DrawerToggleButton tintColor="#fff" />
          <Text style={styles.permHeaderTitle}>Camera Tool</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera" size={48} color="#2563EB" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Allow camera permission to capture high-definition site photos for your survey reports.
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Attach photo to existing survey
  const handleAttachToSurvey = (surveyId) => {
    updateSurvey(surveyId, { photoUri, captureTime });
    setIsSelectSurveyModalOpen(false);
    Alert.alert("✅ Photo Attached", `Photo attached to Survey #${surveyId}`, [
      {
        text: "View Survey",
        onPress: () =>
          router.push({
            pathname: "/survey-preview",
            params: { surveyId },
          }),
      },
      { text: "Take Another Photo", onPress: () => setPhotoUri(null) },
    ]);
  };

  // Create new survey with photo
  const handleCreateNewSurveyWithPhoto = () => {
    setIsSelectSurveyModalOpen(false);
    const newS = addSurvey({
      siteName: "Site Inspection (Camera)",
      clientName: "Pending Client",
      description: `Photo captured on ${captureTime}`,
      priority: "Medium",
      photoUri,
      captureTime,
    });
    Alert.alert("✅ New Survey Created", `Created Survey ${newS.id} with photo!`, [
      {
        text: "Edit Survey Details",
        onPress: () =>
          router.push({
            pathname: "/survey-preview",
            params: { surveyId: newS.id },
          }),
      },
    ]);
  };

  if (photoUri) {
    return (
      <View style={styles.previewFullContainer}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <Image source={{ uri: photoUri }} style={styles.previewFullImage} />

        <View style={styles.previewTopBar}>
          <Pressable
            style={styles.previewBackBtn}
            onPress={() => {
              Alert.alert("Retake Photo", "Discard this photo and retake?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Retake",
                  onPress: () => {
                    setPhotoUri(null);
                    setCaptureTime(null);
                  },
                },
              ]);
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
            <Text style={styles.previewBackText}>Retake</Text>
          </Pressable>
          <Text style={styles.previewTitle}>Photo Preview</Text>
          <Pressable
            style={styles.deleteBtn}
            onPress={() => {
              Alert.alert(
                "🗑️ Delete Photo",
                "Are you sure you want to delete this photo?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      setPhotoUri(null);
                      setCaptureTime(null);
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.captureTimeBar}>
          <Ionicons name="time-outline" size={16} color="#E5E7EB" />
          <Text style={styles.captureTimeText}>Captured: {captureTime}</Text>
        </View>

        <View style={styles.previewActions}>
          <Pressable
            style={styles.usePhotoBtn}
            onPress={() => setIsSelectSurveyModalOpen(true)}
          >
            <Ionicons name="link-sharp" size={22} color="#fff" />
            <Text style={styles.usePhotoText}>Attach Photo to Survey</Text>
          </Pressable>
        </View>

        {/* Modal to Select Target Survey */}
        <Modal visible={isSelectSurveyModalOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Attach Photo to Survey</Text>
                <TouchableOpacity onPress={() => setIsSelectSurveyModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.createNewOption}
                onPress={handleCreateNewSurveyWithPhoto}
              >
                <Ionicons name="add-circle" size={24} color="#2563EB" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.createNewOptionTitle}>Create New Survey</Text>
                  <Text style={styles.createNewOptionSub}>
                    Start a new survey with this photo
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.sectionDividerText}>OR SELECT EXISTING SURVEY</Text>

              <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                {surveys.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.surveySelectCard}
                    onPress={() => handleAttachToSurvey(s.id)}
                  >
                    <View style={styles.surveySelectRow}>
                      <Text style={styles.surveySelectId}>{s.id}</Text>
                      <Text style={styles.surveySelectStatus}>{s.status}</Text>
                    </View>
                    <Text style={styles.surveySelectSite}>{s.siteName}</Text>
                    <Text style={styles.surveySelectClient}>Client: {s.clientName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const toggleFacing = () => setFacing((curr) => (curr === "back" ? "front" : "back"));

  const toggleFlash = () => {
    setFlash((curr) => {
      if (curr === "off") return "on";
      if (curr === "on") return "auto";
      return "off";
    });
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    try {
      setIsTakingPhoto(true);
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92 });
      setPhotoUri(photo.uri);
      const now = new Date();
      setCaptureTime(`${now.toLocaleTimeString()} — ${now.toLocaleDateString()}`);
    } catch (error) {
      Alert.alert("Camera Error", error?.message ?? "Could not take photo.");
    } finally {
      setIsTakingPhoto(false);
      setIsLoading(false);
    }
  };

  const flashIcons = { off: "flash-off", on: "flash", auto: "flash" };
  const flashLabels = { off: "Off", on: "On", auto: "Auto" };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        mode="picture"
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <View style={styles.drawerToggleContainer}>
            <DrawerToggleButton tintColor="#fff" />
          </View>

          <Pressable style={styles.controlButton} onPress={toggleFlash}>
            <Ionicons
              name={flashIcons[flash]}
              size={20}
              color={flash !== "off" ? "#FCD34D" : "#fff"}
            />
            <Text style={[styles.controlLabel, flash !== "off" && { color: "#FCD34D" }]}>
              {flashLabels[flash]}
            </Text>
          </Pressable>
        </View>

        <View style={styles.focusFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.captureRow}>
            <View style={styles.thumbnailSlot}>
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.shutterBtn,
                (pressed || isTakingPhoto) && styles.shutterPressed,
              ]}
              onPress={takePhoto}
              disabled={isTakingPhoto}
            >
              {isLoading ? (
                <ActivityIndicator color="#2563EB" size="large" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </Pressable>

            <Pressable style={styles.flipBtn} onPress={toggleFacing}>
              <Ionicons name="camera-reverse" size={28} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.tapHint}>Tap shutter to capture site photo</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, justifyContent: "space-between" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: { color: "#374151", marginTop: 16, fontSize: 16 },

  permissionScreen: { flex: 1, backgroundColor: "#1E40AF" },
  permHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
  },
  permHeaderTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  permissionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 44) + 4,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawerToggleContainer: { padding: 4 },
  controlButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 2,
  },
  controlLabel: { color: "#fff", fontSize: 11, fontWeight: "700" },

  focusFrame: {
    alignSelf: "center",
    width: 220,
    height: 220,
  },
  corner: {
    width: 36,
    height: 36,
    position: "absolute",
    borderColor: "rgba(255,255,255,0.9)",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },

  bottomPanel: {
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopColor: "rgba(255,255,255,0.12)",
    borderTopWidth: 1,
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  thumbnailSlot: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  shutterBtn: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  shutterPressed: { opacity: 0.75, transform: [{ scale: 0.95 }] },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#1E40AF",
  },
  flipBtn: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tapHint: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
  },

  previewFullContainer: { flex: 1, backgroundColor: "#000" },
  previewFullImage: { ...StyleSheet.absoluteFillObject, resizeMode: "contain" },
  previewTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 44) + 4,
    paddingBottom: 14,
  },
  previewBackBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewBackText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  previewTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteBtn: { backgroundColor: "#DC2626", padding: 8, borderRadius: 8 },
  captureTimeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  captureTimeText: { color: "#E5E7EB", fontSize: 13 },
  previewActions: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  usePhotoBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 14,
    elevation: 4,
  },
  usePhotoText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  createNewOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    marginBottom: 16,
  },
  createNewOptionTitle: { fontSize: 15, fontWeight: "bold", color: "#1E40AF" },
  createNewOptionSub: { fontSize: 12, color: "#6B7280" },
  sectionDividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  surveySelectCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  surveySelectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  surveySelectId: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  surveySelectStatus: { fontSize: 11, color: "#059669", fontWeight: "600" },
  surveySelectSite: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  surveySelectClient: { fontSize: 13, color: "#6B7280" },
});