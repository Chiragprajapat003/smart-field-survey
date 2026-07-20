import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSurveys } from "@/context/SurveyContext";
import * as Clipboard from "expo-clipboard";

export default function SurveyPreview() {
  const router = useRouter();
  const { surveyId } = useLocalSearchParams();
  const {
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    getTasksBySurveyId,
    toggleTaskStatus,
  } = useSurveys();

  const [survey, setSurvey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [siteName, setSiteName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");

  const surveyTasks = surveyId ? getTasksBySurveyId(surveyId) : [];

  useEffect(() => {
    if (surveyId) {
      const data = getSurveyById(surveyId);
      if (data) {
        setSurvey(data);
        setSiteName(data.siteName);
        setClientName(data.clientName);
        setDescription(data.description);
        setPriority(data.priority);
        setNotes(data.notes || "");
      }
    }
  }, [surveyId, getSurveyById]);

  if (!survey) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Survey details not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCopy = async (text, type) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Success", `${type} copied to clipboard.`);
  };

  const handleSave = () => {
    if (!siteName.trim() || !clientName.trim() || !description.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    updateSurvey(survey.id, {
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      description: description.trim(),
      priority,
      notes: notes.trim(),
    });

    setIsEditing(false);
    setSurvey((prev) => ({
      ...prev,
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      description: description.trim(),
      priority,
      notes: notes.trim(),
    }));
    Alert.alert("Success", "Survey updated successfully!");
  };

  const handleSubmit = () => {
    updateSurvey(survey.id, { status: "Submitted" });
    setSurvey((prev) => ({ ...prev, status: "Submitted" }));
    Alert.alert("Success", "Survey submitted successfully!");
    router.push("/history");
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this survey and associated data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSurvey(survey.id);
            Alert.alert("Deleted", "Survey has been deleted.");
            router.push("/history");
          },
        },
      ]
    );
  };

  const PRIORITY_COLORS = {
    High: "#DC2626",
    Medium: "#D97706",
    Low: "#059669",
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Survey" : "Survey Preview"}
        </Text>
        <View style={styles.headerActions}>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerActionBtn}>
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.headerActionBtn}>
            <Ionicons name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Basic Survey Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.surveyId}>{survey.id}</Text>
            <TouchableOpacity onPress={() => handleCopy(survey.id, "Survey ID")}>
              <Ionicons name="copy-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: survey.status === "Submitted" ? "#D1FAE5" : "#FEF3C7" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: survey.status === "Submitted" ? "#059669" : "#D97706" },
                ]}
              >
                {survey.status}
              </Text>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <Text style={styles.label}>Site Name</Text>
              <TextInput
                style={styles.input}
                value={siteName}
                onChangeText={setSiteName}
                placeholder="Enter Site Name"
              />

              <Text style={styles.label}>Client Name</Text>
              <TextInput
                style={styles.input}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Enter Client Name"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="Enter Description"
              />

              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                {["Low", "Medium", "High"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.priorityBtn,
                      { borderColor: PRIORITY_COLORS[item] },
                      priority === item && {
                        backgroundColor: PRIORITY_COLORS[item],
                      },
                    ]}
                    onPress={() => setPriority(item)}
                  >
                    <Text
                      style={[
                        styles.priorityBtnText,
                        { color: PRIORITY_COLORS[item] },
                        priority === item && { color: "#fff" },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.details}>
              <Text style={styles.detailSite}>{survey.siteName}</Text>
              <Text style={styles.detailClient}>Client: {survey.clientName}</Text>
              <Text style={styles.detailDesc}>{survey.description}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{survey.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flag-outline" size={16} color="#6B7280" />
                  <Text
                    style={[
                      styles.metaText,
                      { color: PRIORITY_COLORS[survey.priority] || "#374151", fontWeight: "bold" },
                    ]}
                  >
                    {survey.priority}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Linked Field Tasks Section */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="checkbox-outline" size={18} /> Linked Field Tasks
            </Text>
            <TouchableOpacity onPress={() => router.push("/tasks")}>
              <Text style={styles.manageTasksLink}>+ Add / Manage</Text>
            </TouchableOpacity>
          </View>

          {surveyTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks linked to this survey yet</Text>
              <TouchableOpacity
                style={styles.actionBtnLink}
                onPress={() => router.push("/tasks")}
              >
                <Text style={styles.actionBtnLinkText}>Create Survey Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            surveyTasks.map((t) => (
              <View key={t.id} style={styles.taskItemRow}>
                <TouchableOpacity onPress={() => toggleTaskStatus(t.id)}>
                  <Ionicons
                    name={
                      t.status === "Completed"
                        ? "checkmark-circle"
                        : t.status === "In Progress"
                        ? "time"
                        : "ellipse-outline"
                    }
                    size={22}
                    color={
                      t.status === "Completed"
                        ? "#059669"
                        : t.status === "In Progress"
                        ? "#D97706"
                        : "#9CA3AF"
                    }
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={[
                      styles.taskItemTitle,
                      t.status === "Completed" && styles.taskCompletedText,
                    ]}
                  >
                    {t.title}
                  </Text>
                  <Text style={styles.taskItemCategory}>
                    {t.category} • Due: {t.dueDate}
                  </Text>
                </View>
                <View
                  style={[
                    styles.taskItemBadge,
                    {
                      backgroundColor:
                        t.status === "Completed"
                          ? "#D1FAE5"
                          : t.status === "In Progress"
                          ? "#FEF3C7"
                          : "#F3F4F6",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.taskItemBadgeText,
                      {
                        color:
                          t.status === "Completed"
                            ? "#059669"
                            : t.status === "In Progress"
                            ? "#D97706"
                            : "#4B5563",
                      },
                    ]}
                  >
                    {t.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Captured Photo */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="image-outline" size={18} /> Survey Photo Evidence
          </Text>
          {survey.photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: survey.photoUri }} style={styles.photo} />
              {survey.captureTime && (
                <Text style={styles.photoTime}>Captured: {survey.captureTime}</Text>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No site photo captured yet</Text>
              <TouchableOpacity
                style={styles.actionBtnLink}
                onPress={() => router.push("/camera")}
              >
                <Text style={styles.actionBtnLinkText}>Open Camera Tool</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Contact info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="people-outline" size={18} /> Site Supervisor / Contact
          </Text>
          {survey.contactNumber ? (
            <View style={styles.contactContainer}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {survey.contactName ? survey.contactName[0].toUpperCase() : "?"}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{survey.contactName}</Text>
                <Text style={styles.contactNumber}>{survey.contactNumber}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopy(survey.contactNumber, "Contact Number")}
                style={styles.copyBtn}
              >
                <Ionicons name="copy-outline" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No contact connected</Text>
              <TouchableOpacity
                style={styles.actionBtnLink}
                onPress={() => router.push("/contacts")}
              >
                <Text style={styles.actionBtnLinkText}>Select Site Contact</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={18} /> Survey GPS Location
          </Text>
          {survey.location ? (
            <View style={styles.locationContainer}>
              <View style={styles.locationGrid}>
                <View style={styles.locField}>
                  <Text style={styles.locLabel}>Latitude</Text>
                  <Text style={styles.locValue}>{survey.location.latitude}°</Text>
                </View>
                <View style={styles.locField}>
                  <Text style={styles.locLabel}>Longitude</Text>
                  <Text style={styles.locValue}>{survey.location.longitude}°</Text>
                </View>
                {survey.location.accuracy && (
                  <View style={styles.locFieldFull}>
                    <Text style={styles.locLabel}>Accuracy</Text>
                    <Text style={styles.locValue}>
                      ± {typeof survey.location.accuracy === 'number' ? survey.location.accuracy.toFixed(2) : survey.location.accuracy} meters
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleCopy(
                    `${survey.location.latitude}, ${survey.location.longitude}`,
                    "Location Coordinates"
                  )
                }
                style={styles.locationCopyBtn}
              >
                <Ionicons name="copy-outline" size={18} color="#fff" />
                <Text style={styles.locationCopyBtnText}>Copy Coordinates</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No location captured yet</Text>
              <TouchableOpacity
                style={styles.actionBtnLink}
                onPress={() => router.push("/location")}
              >
                <Text style={styles.actionBtnLinkText}>Acquire GPS Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="clipboard-outline" size={18} /> Field Notes
          </Text>
          {isEditing ? (
            <View>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholder="Enter field notes here or paste from clipboard..."
              />
              <TouchableOpacity
                style={styles.pasteBtn}
                onPress={async () => {
                  const text = await Clipboard.getStringAsync();
                  setNotes(text);
                }}
              >
                <Ionicons name="clipboard-outline" size={16} color="#2563EB" />
                <Text style={styles.pasteBtnText}>Paste from Clipboard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.notesText}>
                {survey.notes || "No field notes added yet. Edit survey to type or paste notes."}
              </Text>
            </View>
          )}
        </View>

        {/* Actions panel */}
        {isEditing ? (
          <View style={styles.actionsPanel}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelBtn]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveBtn]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          survey.status !== "Submitted" && (
            <View style={styles.submitPanel}>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Survey Report</Text>
              </TouchableOpacity>
            </View>
          )
        )}
        <View style={{ height: 40 }} />
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
  headerBackBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerActions: { flexDirection: "row", gap: 12 },
  headerActionBtn: { padding: 4 },
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  errorText: { fontSize: 16, color: "#374151", marginVertical: 16 },
  backButton: { backgroundColor: "#2563EB", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButtonText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  surveyId: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  statusBadge: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  details: {},
  detailSite: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  detailClient: { fontSize: 15, color: "#4B5563", marginBottom: 12 },
  detailDesc: { fontSize: 15, color: "#374151", lineHeight: 22, marginBottom: 16 },
  metaRow: { flexDirection: "row", gap: 20 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 14, color: "#4B5563" },

  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  manageTasksLink: { fontSize: 13, color: "#2563EB", fontWeight: "700" },

  taskItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  taskItemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  taskCompletedText: { textDecorationLine: "line-through", color: "#9CA3AF" },
  taskItemCategory: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  taskItemBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  taskItemBadgeText: { fontSize: 11, fontWeight: "700" },

  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyStateText: { fontSize: 14, color: "#9CA3AF", marginTop: 8 },
  actionBtnLink: { marginTop: 10 },
  actionBtnLinkText: { color: "#2563EB", fontWeight: "600", fontSize: 14 },

  photoContainer: { borderRadius: 12, overflow: "hidden" },
  photo: { width: "100%", height: 200, resizeMode: "cover" },
  photoTime: { fontSize: 12, color: "#6B7280", marginTop: 8, textAlign: "right" },

  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  contactNumber: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  copyBtn: { padding: 8 },

  locationContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  locField: { width: "47%" },
  locFieldFull: { width: "100%" },
  locLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  locValue: { fontSize: 15, color: "#111827", marginTop: 2, fontWeight: "600" },
  locationCopyBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  locationCopyBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  notesText: { fontSize: 14, color: "#374151", lineHeight: 20 },

  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  textarea: { height: 80, textAlignVertical: "top" },
  priorityRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  priorityBtn: { flex: 1, borderWidth: 2, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  priorityBtnText: { fontWeight: "700", fontSize: 13 },
  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  pasteBtnText: { color: "#2563EB", fontWeight: "600", fontSize: 13 },

  actionsPanel: { flexDirection: "row", gap: 12, marginVertical: 16 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  cancelBtn: { backgroundColor: "#E5E7EB" },
  cancelBtnText: { color: "#374151", fontWeight: "600", fontSize: 15 },
  saveBtn: { backgroundColor: "#2563EB" },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  submitPanel: { marginVertical: 16 },
  submitBtn: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
