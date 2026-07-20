import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useSurveys } from "@/context/SurveyContext";

export default function ClipboardScreen() {
  const router = useRouter();
  const { surveys, updateSurvey } = useSurveys();
  const [notes, setNotes] = useState("");
  const [selectedSurveyId, setSelectedSurveyId] = useState(
    surveys.length > 0 ? surveys[0].id : ""
  );

  const activeSurvey = surveys.find((s) => s.id === selectedSurveyId);

  // Copy Data
  async function copyData(data, label) {
    if (!data) {
      Alert.alert("Notice", `No ${label} data available.`);
      return;
    }
    await Clipboard.setStringAsync(data);
    Alert.alert("Copied to Clipboard", `${label}: ${data}`);
  }

  // Paste Data
  async function pasteData() {
    const text = await Clipboard.getStringAsync();
    setNotes(text);
    Alert.alert("Pasted", "Content pasted into notes.");
  }

  // Clear Clipboard
  async function clearClipboard() {
    await Clipboard.setStringAsync("");
    setNotes("");
    Alert.alert("Cleared", "Clipboard data cleared.");
  }

  // Save notes to selected survey
  const handleSaveNotesToSurvey = () => {
    if (!selectedSurveyId) {
      Alert.alert("Error", "Please select a survey.");
      return;
    }
    updateSurvey(selectedSurveyId, { notes });
    Alert.alert("✅ Notes Saved", `Notes saved to Survey #${selectedSurveyId}`, [
      {
        text: "View Survey",
        onPress: () =>
          router.push({
            pathname: "/survey-preview",
            params: { surveyId: selectedSurveyId },
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
        <Text style={styles.headerTitle}>Notes & Clipboard</Text>
        <Ionicons name="clipboard" size={22} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Active Survey Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Active Survey Context</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {surveys.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.chip,
                  selectedSurveyId === s.id && styles.chipActive,
                ]}
                onPress={() => {
                  setSelectedSurveyId(s.id);
                  setNotes(s.notes || "");
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSurveyId === s.id && styles.chipTextActive,
                  ]}
                >
                  {s.id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeSurvey && (
            <View style={styles.surveyContextBox}>
              <Text style={styles.surveySiteName}>{activeSurvey.siteName}</Text>
              <Text style={styles.surveyClient}>Client: {activeSurvey.clientName}</Text>
            </View>
          )}
        </View>

        {/* Quick Copy Action Buttons */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Copy Actions</Text>
          <View style={styles.quickCopyGrid}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => copyData(activeSurvey?.id, "Survey ID")}
            >
              <Ionicons name="document-text-outline" size={20} color="#2563EB" />
              <Text style={styles.actionBtnText}>Copy Survey ID</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                copyData(
                  activeSurvey?.contactNumber || "+91 98765 43210",
                  "Contact Number"
                )
              }
            >
              <Ionicons name="call-outline" size={20} color="#2563EB" />
              <Text style={styles.actionBtnText}>Copy Contact</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                copyData(
                  activeSurvey?.location
                    ? `${activeSurvey.location.latitude}, ${activeSurvey.location.longitude}`
                    : "23.0225, 72.5714",
                  "Location Coordinates"
                )
              }
            >
              <Ionicons name="location-outline" size={20} color="#2563EB" />
              <Text style={styles.actionBtnText}>Copy Coordinates</Text>
            </Pressable>
          </View>
        </View>

        {/* Paste & Edit Notes Workspace */}
        <View style={styles.card}>
          <View style={styles.notesHeaderRow}>
            <Text style={styles.sectionTitle}>Field Notes Workspace</Text>
            <TouchableOpacity style={styles.pasteTextBtn} onPress={pasteData}>
              <Ionicons name="clipboard-outline" size={16} color="#2563EB" />
              <Text style={styles.pasteTextBtnLabel}>Paste</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Type field notes or tap Paste from clipboard..."
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.notesFooterButtons}>
            <Pressable
              style={[styles.btn, styles.clearBtn]}
              onPress={clearClipboard}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.clearBtnText}>Clear Notes</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSaveNotesToSurvey}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save to Survey</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 12,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 14,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  container: { padding: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },

  chipScroll: { flexDirection: "row", marginBottom: 12 },
  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipText: { fontSize: 13, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  surveyContextBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  surveySiteName: { fontSize: 15, fontWeight: "bold", color: "#1E40AF" },
  surveyClient: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  quickCopyGrid: { gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionBtnText: { fontSize: 14, color: "#374151", fontWeight: "600" },

  notesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pasteTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pasteTextBtnLabel: { color: "#2563EB", fontSize: 13, fontWeight: "700" },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    marginVertical: 12,
    textAlignVertical: "top",
    color: "#111827",
    fontSize: 14,
  },

  notesFooterButtons: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  clearBtn: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FCA5A5" },
  clearBtnText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  saveBtn: { backgroundColor: "#2563EB" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});