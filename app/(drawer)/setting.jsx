import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSurveys } from "@/context/SurveyContext";
import { useAuth } from "@/context/AuthContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import AppLogo from "@/components/AppLogo";

const COLOR_PRESETS = [
  "#2563EB", // Blue
  "#059669", // Emerald
  "#7C3AED", // Violet
  "#DC2626", // Red
  "#EA580C", // Orange
  "#0D9488", // Teal
  "#C026D3", // Fuchsia
];

const getInitials = (name) => {
  if (!name) return "CP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

export default function SettingScreen() {
  const router = useRouter();
  const { userProfile, updateUserProfile, isDarkMode, toggleDarkMode, resetAllData } = useSurveys();
  const { user, token, logout, getDecodedToken } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name || userProfile.name);
  const [role, setRole] = useState(user?.role || userProfile.role);
  const [department, setDepartment] = useState(user?.department || userProfile.department);
  const [studentId, setStudentId] = useState(user?.studentId || userProfile.studentId);
  const [institution, setInstitution] = useState(user?.institution || userProfile.institution);
  
  // Avatar states
  const [photoUri, setPhotoUri] = useState(userProfile.photoUri);
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || userProfile.avatarColor || "#2563EB");

  // Camera states
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("back");
  const [cameraFlash, setCameraFlash] = useState("off");
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [previewPhotoUri, setPreviewPhotoUri] = useState(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const decodedObj = getDecodedToken();

  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Camera access is required to take a profile photo."
        );
        return;
      }
    }
    setPreviewPhotoUri(null);
    setIsCameraVisible(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92 });
      setPreviewPhotoUri(photo.uri);
    } catch (error) {
      Alert.alert("Camera Error", error?.message ?? "Could not capture photo.");
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleConfirmPhoto = () => {
    setPhotoUri(previewPhotoUri);
    setIsCameraVisible(false);
    setPreviewPhotoUri(null);
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your custom profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setPhotoUri(null),
        },
      ]
    );
  };

  const handleSaveChanges = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty.");
      return;
    }

    updateUserProfile({
      name,
      role,
      department,
      studentId,
      institution,
      photoUri,
      avatarColor,
    });

    Alert.alert("Success", "Profile details updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      "Revoke Session",
      "Revoke current JWT token session and sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke Session",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      "⚠️ Reset App Storage",
      "Reset all surveys, tasks, and settings to original defaults?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: () => {
            resetAllData();
            Alert.alert("Reset Complete", "App state restored to initial default state.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Preferences</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Branding Header Card */}
        <View style={styles.brandCard}>
          <AppLogo size={48} textColor="#FFFFFF" />
          <Text style={styles.brandSubtitle}>GeoField Survey Pro v2.0 • JWT Engine</Text>
        </View>

        {/* JWT Session Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>JWT Authentication Session</Text>

          <View style={styles.sessionBox}>
            <View style={styles.sessionRow}>
              <Ionicons name="key-outline" size={18} color="#2563EB" />
              <Text style={styles.sessionLabel}>Status:</Text>
              <Text style={styles.sessionVal}>Active Authenticated Session</Text>
            </View>

            {decodedObj && decodedObj.payload ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.sessionSub}>
                  Logged in as: <Text style={{ color: "#111827", fontWeight: "bold" }}>{decodedObj.payload.email}</Text>
                </Text>
                <Text style={styles.sessionSub}>
                  Expires at: {new Date(decodedObj.payload.exp * 1000).toLocaleTimeString()}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.revokeSessionBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              <Text style={styles.revokeSessionBtnText}>Revoke JWT Token Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences & Theme Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="moon-outline" size={22} color="#2563EB" />
              <View>
                <Text style={styles.preferenceTitle}>Dark Mode Theme</Text>
                <Text style={styles.preferenceSub}>Switch app visual theme</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={isDarkMode ? "#2563EB" : "#F3F4F6"}
            />
          </View>
        </View>

        {/* Profile Card / Avatar Selection */}
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.avatarContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarPreview} />
            ) : (
              <View style={[styles.avatarPreview, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
              </View>
            )}

            <View style={styles.avatarActions}>
              <TouchableOpacity
                style={styles.avatarActionBtn}
                onPress={handleOpenCamera}
              >
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <Text style={styles.avatarActionBtnText}>Take Photo</Text>
              </TouchableOpacity>

              {photoUri && (
                <TouchableOpacity
                  style={[styles.avatarActionBtn, styles.removeBtn]}
                  onPress={handleRemovePhoto}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.avatarActionBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Color Presets */}
          <Text style={styles.subTitle}>Select Avatar Background Color</Text>
          <View style={styles.presetsRow}>
            {COLOR_PRESETS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.presetColor,
                  { backgroundColor: color },
                  avatarColor === color && styles.presetColorSelected,
                ]}
                onPress={() => setAvatarColor(color)}
              >
                {avatarColor === color && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Inspector Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Professional Role</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={role}
                onChangeText={setRole}
                style={styles.input}
                placeholder="e.g. Field Inspector & Engineer"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department / Work Area</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="file-tray-full-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={department}
                onChangeText={setDepartment}
                style={styles.input}
                placeholder="e.g. Civil Engineering Department"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Student/Employee ID</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={studentId}
                onChangeText={setStudentId}
                style={styles.input}
                placeholder="Enter ID number"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Institution / Organization</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={institution}
                onChangeText={setInstitution}
                style={styles.input}
                placeholder="Enter institution or company name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
          <Ionicons name="checkmark-done" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Profile Changes</Text>
        </TouchableOpacity>

        {/* Reset Storage */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleResetData}>
          <Ionicons name="refresh-outline" size={20} color="#EF4444" />
          <Text style={styles.resetBtnText}>Restore Default Demo Data</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Camera Capture Modal */}
      <Modal visible={isCameraVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.cameraContainer}>
          <StatusBar backgroundColor="#000" barStyle="light-content" />

          <View style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.cameraCloseBtn}
              onPress={() => {
                setIsCameraVisible(false);
                setPreviewPhotoUri(null);
              }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraHeaderTitle}>Capture Profile Photo</Text>
            <View style={{ width: 28 }} />
          </View>

          {previewPhotoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: previewPhotoUri }} style={styles.previewImage} />
              <View style={styles.previewControls}>
                <TouchableOpacity
                  style={[styles.previewBtn, styles.retakeBtn]}
                  onPress={() => setPreviewPhotoUri(null)}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.previewBtnText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.previewBtn, styles.confirmBtn]}
                  onPress={handleConfirmPhoto}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.previewBtnText}>Use Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <CameraView
                ref={cameraRef}
                style={styles.cameraView}
                facing={cameraFacing}
                flash={cameraFlash}
                mode="picture"
              />

              <View style={styles.cameraControlsOverlay}>
                <View style={styles.cameraTopControls}>
                  <TouchableOpacity
                    style={styles.cameraBarBtn}
                    onPress={() =>
                      setCameraFlash((prev) => (prev === "off" ? "on" : "off"))
                    }
                  >
                    <Ionicons
                      name={cameraFlash === "on" ? "flash" : "flash-off"}
                      size={24}
                      color={cameraFlash === "on" ? "#FCD34D" : "#fff"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cameraBarBtn}
                    onPress={() =>
                      setCameraFacing((prev) => (prev === "back" ? "front" : "back"))
                    }
                  >
                    <Ionicons name="camera-reverse" size={26} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.shutterRow}>
                  <TouchableOpacity
                    style={styles.shutterOuter}
                    onPress={handleTakePhoto}
                    disabled={isTakingPhoto}
                  >
                    {isTakingPhoto ? (
                      <ActivityIndicator size="large" color="#2563EB" />
                    ) : (
                      <View style={styles.shutterInner} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  container: { flex: 1, padding: 16 },

  brandCard: {
    backgroundColor: "#1E40AF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  brandSubtitle: { color: "#93C5FD", fontSize: 12, marginTop: 8, fontWeight: "600" },

  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
    width: "100%",
    paddingHorizontal: 8,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563EB",
    elevation: 3,
  },
  avatarInitials: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  avatarActions: { flex: 1, gap: 10 },
  avatarActionBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  avatarActionBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  removeBtn: { backgroundColor: "#EF4444" },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  presetsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  presetColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 1,
  },
  presetColorSelected: { borderColor: "#111827", transform: [{ scale: 1.1 }] },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sessionBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sessionLabel: { fontSize: 13, color: "#4B5563", fontWeight: "600" },
  sessionVal: { fontSize: 13, color: "#059669", fontWeight: "bold" },
  sessionSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  revokeSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  revokeSessionBtnText: { color: "#EF4444", fontSize: 12, fontWeight: "bold" },

  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preferenceLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  preferenceTitle: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  preferenceSub: { fontSize: 12, color: "#6B7280" },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 46, color: "#111827", fontSize: 15 },

  saveBtn: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  resetBtn: {
    backgroundColor: "#FEE2E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  resetBtnText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },

  cameraContainer: { flex: 1, backgroundColor: "#000" },
  cameraHeader: {
    height: 60,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  cameraHeaderTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cameraCloseBtn: { padding: 4 },
  cameraView: { flex: 1 },
  cameraControlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 24,
  },
  cameraTopControls: { flexDirection: "row", justifyContent: "space-between" },
  cameraBarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterRow: { alignItems: "center", marginBottom: 10 },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff" },
  previewContainer: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  previewImage: { flex: 1, resizeMode: "contain" },
  previewControls: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 20,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 140,
  },
  retakeBtn: { backgroundColor: "#EF4444" },
  confirmBtn: { backgroundColor: "#10B981" },
  previewBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});