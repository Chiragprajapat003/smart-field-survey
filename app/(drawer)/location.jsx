import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import { useSurveys } from "@/context/SurveyContext";

const LocationScreen = () => {
  const router = useRouter();
  const { surveys, updateSurvey, addSurvey } = useSurveys();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSelectSurveyModalOpen, setIsSelectSurveyModalOpen] = useState(false);

  const getLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to acquire site coordinates.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
    } catch (err) {
      Alert.alert("GPS Error", err?.message || "Unable to acquire location.");
    } finally {
      setLoading(false);
    }
  };

  const copyLocation = async () => {
    if (!location) {
      Alert.alert("Error", "Location not available.");
      return;
    }

    const text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\nAccuracy: ${location.coords.accuracy.toFixed(2)} meters`;
    await Clipboard.setStringAsync(text);
    Alert.alert("Success", "Location coordinates copied to clipboard.");
  };

  const handleAttachLocationToSurvey = (surveyId) => {
    if (!location) return;
    updateSurvey(surveyId, {
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
    });
    setIsSelectSurveyModalOpen(false);
    Alert.alert("✅ Location Attached", `Coordinates attached to Survey #${surveyId}`, [
      {
        text: "View Survey",
        onPress: () =>
          router.push({
            pathname: "/survey-preview",
            params: { surveyId },
          }),
      },
    ]);
  };

  const handleCreateSurveyWithLocation = () => {
    if (!location) return;
    setIsSelectSurveyModalOpen(false);
    const newS = addSurvey({
      siteName: "Site Location Survey",
      clientName: "Pending Client",
      description: `GPS coordinates acquired at ${new Date().toLocaleTimeString()}`,
      priority: "Medium",
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
    });
    Alert.alert("✅ New Survey Created", `Created Survey ${newS.id} with location!`, [
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

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#fff" />
        <Text style={styles.headerTitle}>GPS Location Tool</Text>
        <Ionicons name="location" size={22} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="compass-outline" size={44} color="#2563EB" />
          </View>
          <Text style={styles.heroTitle}>Acquire GPS Coordinates</Text>
          <Text style={styles.heroSub}>
            Fetch high-precision latitude, longitude, and elevation accuracy for your survey site reports.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.primaryBtn]}
            onPress={getLocation}
            disabled={loading}
          >
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? "Acquiring GPS Satellite Data..." : "Acquire Current Location"}
            </Text>
          </TouchableOpacity>
        </View>

        {location && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pin" size={20} color="#059669" />
              <Text style={styles.cardHeaderTitle}>Current Coordinates</Text>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Latitude</Text>
                <Text style={styles.value}>{location.coords.latitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Longitude</Text>
                <Text style={styles.value}>{location.coords.longitude.toFixed(6)}°</Text>
              </View>
            </View>

            <View style={styles.accuracyRow}>
              <Text style={styles.label}>Accuracy</Text>
              <Text style={styles.accuracyValue}>
                ± {location.coords.accuracy.toFixed(2)} meters
              </Text>
            </View>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[styles.button, styles.attachBtn]}
                onPress={() => setIsSelectSurveyModalOpen(true)}
              >
                <Ionicons name="link-sharp" size={18} color="#fff" />
                <Text style={styles.buttonText}>Attach to Survey</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.copyButton]}
                onPress={copyLocation}
              >
                <Ionicons name="copy-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Copy Coordinates</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Select Target Survey Modal */}
      <Modal visible={isSelectSurveyModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attach Coordinates to Survey</Text>
              <TouchableOpacity onPress={() => setIsSelectSurveyModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.createNewOption}
              onPress={handleCreateSurveyWithLocation}
            >
              <Ionicons name="add-circle" size={24} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.createNewOptionTitle}>Create New Survey</Text>
                <Text style={styles.createNewOptionSub}>
                  Start a new survey with these GPS coordinates
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionDividerText}>OR SELECT EXISTING SURVEY</Text>

            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {surveys.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.surveySelectCard}
                  onPress={() => handleAttachLocationToSurvey(s.id)}
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
};

export default LocationScreen;

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 14,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  container: {
    padding: 16,
  },

  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 6 },
  heroSub: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 18, marginBottom: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardHeaderTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },

  gridRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  gridItem: { flex: 1, backgroundColor: "#F9FAFB", padding: 12, borderRadius: 10 },
  label: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  value: { fontSize: 16, color: "#111827", fontWeight: "bold", marginTop: 4 },
  accuracyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  accuracyValue: { fontSize: 14, color: "#059669", fontWeight: "bold" },

  actionGrid: { gap: 10 },

  button: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
  },
  primaryBtn: { backgroundColor: "#2563EB", width: "100%" },
  attachBtn: { backgroundColor: "#059669" },
  copyButton: { backgroundColor: "#7C3AED" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

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