import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useSurveys } from "@/context/SurveyContext";
import AppLogo from "@/components/AppLogo";

const PRIORITY_COLORS = {
  High: { bg: "#FEE2E2", text: "#DC2626" },
  Medium: { bg: "#FEF3C7", text: "#D97706" },
  Low: { bg: "#D1FAE5", text: "#059669" },
};

const getInitials = (name) => {
  if (!name) return "CP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

export default function Dashboard() {
  const router = useRouter();
  const { surveys, getTodayCount, userProfile, getTaskStats } = useSurveys();
  const todayCount = getTodayCount();
  const recentSurveys = surveys.slice(0, 3);
  const taskStats = getTaskStats();

  const quickActions = [
    {
      icon: "document-text",
      label: "New Survey",
      color: "#2563EB",
      route: "/survey",
    },
    {
      icon: "checkbox",
      label: "Field Tasks",
      color: "#059669",
      route: "/tasks",
    },
    {
      icon: "camera",
      label: "Camera Tool",
      color: "#7C3AED",
      route: "/camera",
    },
    {
      icon: "location",
      label: "GPS Location",
      color: "#D97706",
      route: "/location",
    },
    {
      icon: "people",
      label: "Contacts",
      color: "#DC2626",
      route: "/contacts",
    },
    {
      icon: "settings",
      label: "Settings",
      color: "#4B5563",
      route: "/setting",
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#1E40AF" barStyle="light-content" />

      {/* Custom App Header with GeoField Pro Logo */}
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#fff" />
        <AppLogo size={36} showText={true} variant="default" textColor="#FFFFFF" />
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/setting")}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeGreeting}>👋 Welcome Back!</Text>
              <Text style={styles.welcomeName}>{userProfile.name}</Text>
              <Text style={styles.welcomeInfo}>Role: {userProfile.role}</Text>
              <Text style={styles.welcomeInfo}>ID: {userProfile.studentId}</Text>
            </View>
            {userProfile.photoUri ? (
              <Image
                source={{ uri: userProfile.photoUri }}
                style={styles.avatarLarge}
              />
            ) : (
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: userProfile.avatarColor || "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text style={styles.avatarText}>{getInitials(userProfile.name)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dynamic Analytics Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="today" size={26} color="#2563EB" />
            <Text style={styles.statCount}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today's Surveys</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="library" size={26} color="#059669" />
            <Text style={[styles.statCount, { color: "#059669" }]}>
              {surveys.length}
            </Text>
            <Text style={styles.statLabel}>Total Surveys</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#F5F3FF" }]}>
            <Ionicons name="checkbox" size={26} color="#7C3AED" />
            <Text style={[styles.statCount, { color: "#7C3AED" }]}>
              {taskStats.total}
            </Text>
            <Text style={styles.statLabel}>Field Tasks</Text>
          </View>
        </View>

        {/* Dynamic Tasks Overview Widget */}
        <Pressable
          style={({ pressed }) => [
            styles.tasksWidgetCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/tasks")}
        >
          <View style={styles.tasksWidgetHeader}>
            <View style={styles.tasksWidgetTitleRow}>
              <Ionicons name="checkbox-outline" size={22} color="#059669" />
              <Text style={styles.tasksWidgetTitle}>Field Tasks Progress</Text>
            </View>
            <Text style={styles.tasksWidgetPercent}>{taskStats.percent}%</Text>
          </View>

          <View style={styles.tasksProgressBarTrack}>
            <View
              style={[styles.tasksProgressBarFill, { width: `${taskStats.percent}%` }]}
            />
          </View>

          <View style={styles.tasksWidgetFooter}>
            <Text style={styles.tasksWidgetSub}>
              {taskStats.completed} completed, {taskStats.pending + taskStats.inProgress} pending
            </Text>
            <Text style={styles.tasksWidgetManage}>Manage Tasks →</Text>
          </View>
        </Pressable>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Tools & Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: action.color },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(action.route)}
            >
              <Ionicons name={action.icon} size={28} color="#fff" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Surveys */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Surveys</Text>
          <Pressable onPress={() => router.push("/history")}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {recentSurveys.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No surveys yet</Text>
            <Text style={styles.emptySubText}>
              Create your first survey to get started!
            </Text>
          </View>
        ) : (
          recentSurveys.map((survey) => {
            const pc = PRIORITY_COLORS[survey.priority] || PRIORITY_COLORS.Low;
            return (
              <Pressable
                key={survey.id}
                style={({ pressed }) => [
                  styles.surveyCard,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/survey-preview",
                    params: { surveyId: survey.id },
                  })
                }
              >
                <View style={styles.surveyCardTop}>
                  <Text style={styles.surveyCardSite} numberOfLines={1}>
                    {survey.siteName}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: pc.bg },
                    ]}
                  >
                    <Text style={[styles.priorityText, { color: pc.text }]}>
                      {survey.priority}
                    </Text>
                  </View>
                </View>
                <Text style={styles.surveyCardClient}>
                  Client: {survey.clientName}
                </Text>
                <View style={styles.surveyCardFooter}>
                  <Text style={styles.surveyCardDate}>📅 {survey.date}</Text>
                  <Text style={styles.surveyCardStatus}>{survey.status}</Text>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 14,
  },
  headerIconBtn: { padding: 4 },
  container: { flex: 1, padding: 16 },

  welcomeCard: {
    backgroundColor: "#1E40AF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeGreeting: { color: "#BFDBFE", fontSize: 13, marginBottom: 4 },
  welcomeName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  welcomeInfo: { color: "#93C5FD", fontSize: 12, marginTop: 1 },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    elevation: 2,
  },
  statCount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2563EB",
    marginTop: 4,
  },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2, fontWeight: "600", textAlign: "center" },

  tasksWidgetCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tasksWidgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tasksWidgetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tasksWidgetTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  tasksWidgetPercent: { fontSize: 16, fontWeight: "bold", color: "#059669" },
  tasksProgressBarTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  tasksProgressBarFill: { height: "100%", backgroundColor: "#059669", borderRadius: 4 },
  tasksWidgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tasksWidgetSub: { fontSize: 12, color: "#6B7280" },
  tasksWidgetManage: { fontSize: 13, color: "#2563EB", fontWeight: "700" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  seeAll: { color: "#2563EB", fontWeight: "700", fontSize: 14 },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: "31%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 3,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },

  surveyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  surveyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  surveyCardSite: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  priorityBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  priorityText: { fontSize: 12, fontWeight: "700" },
  surveyCardClient: { color: "#6B7280", fontSize: 14, marginBottom: 8 },
  surveyCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  surveyCardDate: { color: "#9CA3AF", fontSize: 13 },
  surveyCardStatus: { color: "#2563EB", fontSize: 13, fontWeight: "600" },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
    elevation: 1,
  },
  emptyText: { color: "#374151", fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptySubText: { color: "#9CA3AF", fontSize: 13, marginTop: 4, textAlign: "center" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});