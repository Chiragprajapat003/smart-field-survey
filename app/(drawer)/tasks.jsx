import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useSurveys } from "@/context/SurveyContext";
import AppLogo from "@/components/AppLogo";

const CATEGORIES = [
  { name: "Inspection", icon: "clipboard-outline", color: "#2563EB" },
  { name: "Camera", icon: "camera-outline", color: "#7C3AED" },
  { name: "Location", icon: "location-outline", color: "#059669" },
  { name: "Contact", icon: "people-outline", color: "#DC2626" },
  { name: "Safety", icon: "shield-checkmark-outline", color: "#D97706" },
  { name: "General", icon: "pricetag-outline", color: "#4B5563" },
];

const PRIORITY_COLORS = {
  High: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" },
  Medium: { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D" },
  Low: { bg: "#D1FAE5", text: "#059669", border: "#6EE7B7" },
};

const STATUS_CONFIG = {
  Pending: { bg: "#F3F4F6", text: "#4B5563", icon: "ellipse-outline" },
  "In Progress": { bg: "#FEF3C7", text: "#D97706", icon: "time-outline" },
  Completed: { bg: "#D1FAE5", text: "#059669", icon: "checkmark-circle" },
};

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, addTask, toggleTaskStatus, deleteTask, getTaskStats, surveys } =
    useSurveys();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form fields
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Inspection");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSurveyId, setSelectedSurveyId] = useState("");

  const stats = getTaskStats();

  const handleCreateTask = () => {
    if (!newTitle.trim()) {
      Alert.alert("Validation Error", "Please enter a task title.");
      return;
    }

    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate,
      surveyId: selectedSurveyId || null,
    });

    setNewTitle("");
    setNewDesc("");
    setNewCategory("Inspection");
    setNewPriority("Medium");
    setSelectedSurveyId("");
    setIsModalOpen(false);

    Alert.alert("✅ Task Created", "Field task added successfully!");
  };

  const handleDeleteTask = (id) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(id),
      },
    ]);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      selectedFilter === "All" || task.status === selectedFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderTaskItem = ({ item }) => {
    const priorityStyle = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low;
    const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const catObj =
      CATEGORIES.find((c) => c.name === item.category) || CATEGORIES[0];

    return (
      <View style={styles.taskCard}>
        {/* Top Header line */}
        <View style={styles.cardTop}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${catObj.color}15`, borderColor: catObj.color },
            ]}
          >
            <Ionicons name={catObj.icon} size={14} color={catObj.color} />
            <Text style={[styles.categoryText, { color: catObj.color }]}>
              {item.category}
            </Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border },
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {item.priority}
            </Text>
          </View>
        </View>

        {/* Task Title & Desc */}
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.taskDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Linked Survey Badge */}
        {item.surveyId ? (
          <TouchableOpacity
            style={styles.linkedSurveyChip}
            onPress={() =>
              router.push({
                pathname: "/survey-preview",
                params: { surveyId: item.surveyId },
              })
            }
          >
            <Ionicons name="link-outline" size={14} color="#2563EB" />
            <Text style={styles.linkedSurveyText}>Linked: {item.surveyId}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Footer with Status Toggle & Due Date */}
        <View style={styles.cardFooter}>
          <View style={styles.dueDateRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.statusToggleBtn,
                { backgroundColor: statusStyle.bg },
              ]}
              onPress={() => toggleTaskStatus(item.id)}
            >
              <Ionicons
                name={statusStyle.icon}
                size={16}
                color={statusStyle.text}
              />
              <Text style={[styles.statusToggleText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteTaskBtn}
              onPress={() => handleDeleteTask(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#fff" />
        <AppLogo size={36} showText={false} variant="default" />
        <Text style={styles.headerTitle}>Field Tasks</Text>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={() => setIsModalOpen(true)}
        >
          <Ionicons name="add-circle" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Progress Banner */}
        <View style={styles.progressBanner}>
          <View style={styles.progressTextRow}>
            <View>
              <Text style={styles.bannerTitle}>Task Completion Rate</Text>
              <Text style={styles.bannerSub}>
                {stats.completed} of {stats.total} field tasks completed
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{stats.percent}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${stats.percent}%` }]}
            />
          </View>

          {/* Stats breakdown chips */}
          <View style={styles.statsChipsRow}>
            <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Text style={styles.statChipText}>⏳ {stats.pending} Pending</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Text style={styles.statChipText}>⚡ {stats.inProgress} In Progress</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Text style={styles.statChipText}>✅ {stats.completed} Done</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search field tasks by keyword..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {["All", "Pending", "In Progress", "Completed"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Field Tasks Found</Text>
            <Text style={styles.emptySub}>
              Tap the "+ Add Task" button to create a new task.
            </Text>
            <TouchableOpacity
              style={styles.createTaskBtn}
              onPress={() => setIsModalOpen(true)}
            >
              <Ionicons name="add-outline" size={18} color="#fff" />
              <Text style={styles.createTaskBtnText}>Create Field Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Create Task Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Field Task</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Task Title *</Text>
              <TextInput
                placeholder="e.g. Inspect soil density at point B"
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                placeholder="Add details or instructions..."
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textarea]}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryOption,
                      newCategory === cat.name && {
                        backgroundColor: cat.color,
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => setNewCategory(cat.name)}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={newCategory === cat.name ? "#fff" : cat.color}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newCategory === cat.name && { color: "#fff" },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {["Low", "Medium", "High"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      { borderColor: PRIORITY_COLORS[p].border },
                      newPriority === p && {
                        backgroundColor: PRIORITY_COLORS[p].text,
                        borderColor: PRIORITY_COLORS[p].text,
                      },
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        { color: PRIORITY_COLORS[p].text },
                        newPriority === p && { color: "#fff" },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Link to Survey (Optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.surveyScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.surveyChip,
                    !selectedSurveyId && styles.surveyChipSelected,
                  ]}
                  onPress={() => setSelectedSurveyId("")}
                >
                  <Text
                    style={[
                      styles.surveyChipText,
                      !selectedSurveyId && styles.surveyChipTextSelected,
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>

                {surveys.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.surveyChip,
                      selectedSurveyId === s.id && styles.surveyChipSelected,
                    ]}
                    onPress={() => setSelectedSurveyId(s.id)}
                  >
                    <Text
                      style={[
                        styles.surveyChipText,
                        selectedSurveyId === s.id && styles.surveyChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {s.id} — {s.siteName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.submitTaskBtn}
                onPress={handleCreateTask}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitTaskBtnText}>Create Field Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
    gap: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 8,
  },
  addHeaderBtn: { padding: 4 },
  container: { flex: 1, padding: 16 },

  progressBanner: {
    backgroundColor: "#1E40AF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bannerTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  bannerSub: { color: "#93C5FD", fontSize: 12, marginTop: 2 },
  percentBadge: {
    backgroundColor: "#38BDF8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentText: { color: "#0F172A", fontWeight: "bold", fontSize: 15 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", backgroundColor: "#38BDF8", borderRadius: 4 },
  statsChipsRow: { flexDirection: "row", gap: 8 },
  statChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statChipText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#111827", fontSize: 14 },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterTab: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  filterTabText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  filterTabTextActive: { color: "#fff" },

  listContent: { paddingBottom: 30 },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: { fontSize: 11, fontWeight: "700" },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: { fontSize: 11, fontWeight: "700" },

  taskTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  taskDesc: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 8 },

  linkedSurveyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  linkedSurveyText: { color: "#2563EB", fontSize: 11, fontWeight: "600" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
    marginTop: 4,
  },
  dueDateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dueDateText: { fontSize: 12, color: "#6B7280" },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusToggleText: { fontSize: 12, fontWeight: "700" },
  deleteTaskBtn: { padding: 4 },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#374151", marginTop: 12 },
  emptySub: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center" },
  createTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  createTaskBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },

  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  textarea: { height: 70, textAlignVertical: "top" },

  categoryScroll: { flexDirection: "row", gap: 8, marginBottom: 4 },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginRight: 8,
    backgroundColor: "#F9FAFB",
  },
  categoryOptionText: { fontSize: 12, fontWeight: "700", color: "#374151" },

  prioritySelector: { flexDirection: "row", gap: 8 },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
  },
  priorityOptionText: { fontSize: 13, fontWeight: "700" },

  surveyScroll: { flexDirection: "row", gap: 8, marginBottom: 12 },
  surveyChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    maxWidth: 200,
  },
  surveyChipSelected: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  surveyChipText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  surveyChipTextSelected: { color: "#fff" },

  submitTaskBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  submitTaskBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
