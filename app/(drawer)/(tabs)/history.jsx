import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSurveys } from "@/context/SurveyContext";
import { DrawerToggleButton } from "@react-navigation/drawer";

const PRIORITY_COLORS = {
  High: { bg: "#FEE2E2", text: "#DC2626" },
  Medium: { bg: "#FEF3C7", text: "#D97706" },
  Low: { bg: "#D1FAE5", text: "#059669" },
};

export default function SurveyHistory() {
  const router = useRouter();
  const { surveys, deleteSurvey } = useSurveys();

  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");

  const handleSearch = (text) => {
    setSearch(text);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this survey?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSurvey(id);
            Alert.alert("Deleted", "Survey has been deleted.");
          },
        },
      ]
    );
  };

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.siteName.toLowerCase().includes(search.toLowerCase()) ||
      survey.clientName.toLowerCase().includes(search.toLowerCase()) ||
      survey.id.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      selectedPriority === "All" || survey.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const renderItem = ({ item }) => {
    const pc = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            router.push({
              pathname: "/survey-preview",
              params: { surveyId: item.id },
            })
          }
        >
          <View style={styles.cardHeader}>
            <Text style={styles.surveyId}>{item.id}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
              <Text style={[styles.priorityText, { color: pc.text }]}>
                {item.priority}
              </Text>
            </View>
          </View>

          <Text style={styles.siteName}>{item.siteName}</Text>
          <Text style={styles.clientName}>Client: {item.clientName}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.status === "Submitted" ? "#D1FAE5" : "#FEF3C7" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.status === "Submitted" ? "#059669" : "#D97706" },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#fff" />
        <Text style={styles.headerTitle}>Survey History</Text>
        <Ionicons name="list" size={22} color="#fff" />
      </View>

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by Site, Client or ID..."
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Priority Filters */}
        <View style={styles.filterRow}>
          {["All", "Low", "Medium", "High"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.filterTab,
                selectedPriority === p && styles.filterTabActive,
              ]}
              onPress={() => setSelectedPriority(p)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedPriority === p && styles.filterTabTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Surveys FlatList */}
        {filteredSurveys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>No surveys found</Text>
            <Text style={styles.emptySubText}>
              Try altering your search or create a new survey
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSurveys}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  container: { flex: 1, padding: 16 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterTabText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#fff",
  },

  listContainer: { paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  surveyId: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  siteName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  clientName: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#F3F4F6",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
});