import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useSurveys } from "@/context/SurveyContext";

const PRIORITY_COLORS = {
  Low: "#059669",
  Medium: "#D97706",
  High: "#DC2626",
};

const Survey = () => {
  const router = useRouter();
  const { addSurvey } = useSurveys();

  const [siteName, setSiteName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!siteName.trim()) {
      Alert.alert("Validation Error", "Please enter Site Name");
      return;
    }
    if (!clientName.trim()) {
      Alert.alert("Validation Error", "Please enter Client Name");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter Description");
      return;
    }
    if (!priority) {
      Alert.alert("Validation Error", "Please select Priority");
      return;
    }

    const newSurvey = addSurvey({
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      description: description.trim(),
      priority,
      date: date.toLocaleDateString(),
      photoUri: null,
      contactName: "",
      contactNumber: "",
      location: null,
      notes: "",
    });

    Alert.alert("✅ Success", "Survey created successfully!", [
      {
        text: "View Survey",
        onPress: () =>
          router.push({
            pathname: "/survey-preview",
            params: { surveyId: newSurvey.id },
          }),
      },
      {
        text: "New Survey",
        onPress: () => {
          setSiteName("");
          setClientName("");
          setDescription("");
          setPriority("");
          setDate(new Date());
        },
      },
    ]);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#fff" />
        <Text style={styles.headerTitle}>Create Survey</Text>
        <Ionicons name="document-text" size={22} color="#fff" />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Site Name */}
          <Text style={styles.label}>
            <Ionicons name="business-outline" size={16} /> Site Name *
          </Text>
          <TextInput
            placeholder="Enter site name"
            value={siteName}
            onChangeText={setSiteName}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />

          {/* Client Name */}
          <Text style={styles.label}>
            <Ionicons name="person-outline" size={16} /> Client Name *
          </Text>
          <TextInput
            placeholder="Enter client name"
            value={clientName}
            onChangeText={setClientName}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />

          {/* Description */}
          <Text style={styles.label}>
            <Ionicons name="document-outline" size={16} /> Description *
          </Text>
          <TextInput
            placeholder="Describe the survey..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textarea]}
            placeholderTextColor="#9CA3AF"
          />

          {/* Priority */}
          <Text style={styles.label}>
            <Ionicons name="flag-outline" size={16} /> Priority *
          </Text>
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

          {/* Date */}
          <Text style={styles.label}>
            <Ionicons name="calendar-outline" size={16} /> Survey Date *
          </Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar" size={18} color="#2563EB" />
            <Text style={styles.dateBtnText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitText}>Create Survey</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Survey;

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
  container: { flex: 1 },
  form: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  priorityBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },

  dateBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateBtnText: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
  },

  submitBtn: {
    backgroundColor: "#2563EB",
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});