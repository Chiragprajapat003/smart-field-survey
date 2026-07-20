import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSurveys } from "@/context/SurveyContext";
import { useAuth } from "@/context/AuthContext";
import { DrawerToggleButton } from "@react-navigation/drawer";
import * as Clipboard from "expo-clipboard";
import AppLogo from "@/components/AppLogo";

const getInitials = (name) => {
  if (!name) return "CP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

export default function ProfileScreen() {
  const router = useRouter();
  const { surveys, userProfile, getTaskStats } = useSurveys();
  const { user, token, logout, getDecodedToken } = useAuth();
  const [showFullToken, setShowFullToken] = useState(false);

  const displayName = user?.name || userProfile.name;
  const displayRole = user?.role || userProfile.role;
  const displayDept = user?.department || userProfile.department;
  const displayId = user?.studentId || userProfile.studentId;

  const submittedCount = surveys.filter((s) => s.status === "Submitted").length;
  const draftCount = surveys.filter((s) => s.status === "Draft").length;
  const taskStats = getTaskStats();

  const decodedObj = getDecodedToken();

  const copyJwtToken = async () => {
    if (!token) {
      Alert.alert("Notice", "No active JWT token.");
      return;
    }
    await Clipboard.setStringAsync(token);
    Alert.alert("✅ JWT Token Copied", "Raw JWT token string copied to clipboard!");
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out and invalidate local JWT session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
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
        <DrawerToggleButton tintColor="#fff" />
        <Text style={styles.headerTitle}>Inspector Profile</Text>
        <Ionicons name="person" size={22} color="#fff" />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          {userProfile.photoUri ? (
            <Image
              source={{ uri: userProfile.photoUri }}
              style={styles.avatarLarge}
            />
          ) : (
            <View
              style={[
                styles.avatarLarge,
                { backgroundColor: user?.avatarColor || userProfile.avatarColor || "#2563EB" },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          )}
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>{displayRole}</Text>
          <Text style={styles.userDepartment}>{displayDept}</Text>
        </View>

        {/* JWT Security Credentials Card */}
        <View style={styles.jwtCard}>
          <View style={styles.jwtCardHeader}>
            <View style={styles.jwtTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color="#38BDF8" />
              <Text style={styles.jwtCardTitle}>JWT Security Session</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          </View>

          {/* Token String Display Box */}
          <Text style={styles.jwtLabel}>Raw JSON Web Token (Header.Payload.Sig):</Text>
          <View style={styles.tokenBox}>
            <Text style={styles.tokenText} numberOfLines={showFullToken ? undefined : 2}>
              {token || "No JWT token issued"}
            </Text>
          </View>

          <View style={styles.jwtActionsRow}>
            <TouchableOpacity
              style={styles.toggleTokenBtn}
              onPress={() => setShowFullToken((prev) => !prev)}
            >
              <Ionicons
                name={showFullToken ? "eye-off-outline" : "eye-outline"}
                size={16}
                color="#38BDF8"
              />
              <Text style={styles.toggleTokenText}>
                {showFullToken ? "Hide Token" : "View Full Token"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.copyJwtBtn} onPress={copyJwtToken}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
              <Text style={styles.copyJwtBtnText}>Copy JWT Token</Text>
            </TouchableOpacity>
          </View>

          {/* Decoded Claims Details */}
          {decodedObj && decodedObj.payload ? (
            <View style={styles.claimsBox}>
              <Text style={styles.claimsTitle}>Decoded JWT Claims:</Text>

              <View style={styles.claimItem}>
                <Text style={styles.claimKey}>Subject (sub):</Text>
                <Text style={styles.claimVal}>{decodedObj.payload.sub}</Text>
              </View>

              <View style={styles.claimItem}>
                <Text style={styles.claimKey}>Email Claim:</Text>
                <Text style={styles.claimVal}>{decodedObj.payload.email}</Text>
              </View>

              <View style={styles.claimItem}>
                <Text style={styles.claimKey}>Issued At (iat):</Text>
                <Text style={styles.claimVal}>
                  {new Date(decodedObj.payload.iat * 1000).toLocaleString()}
                </Text>
              </View>

              <View style={styles.claimItem}>
                <Text style={styles.claimKey}>Expires At (exp):</Text>
                <Text style={styles.claimVal}>
                  {new Date(decodedObj.payload.exp * 1000).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Survey Analytics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Survey Analytics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{surveys.length}</Text>
              <Text style={styles.statLabel}>Total Created</Text>
            </View>
            <View style={[styles.statBox, { borderColor: "#D1FAE5" }]}>
              <Text style={[styles.statNum, { color: "#059669" }]}>{submittedCount}</Text>
              <Text style={styles.statLabel}>Submitted</Text>
            </View>
            <View style={[styles.statBox, { borderColor: "#FEF3C7" }]}>
              <Text style={[styles.statNum, { color: "#D97706" }]}>{draftCount}</Text>
              <Text style={styles.statLabel}>Drafts</Text>
            </View>
          </View>
        </View>

        {/* Field Tasks Analytics Card */}
        <TouchableOpacity
          style={styles.statsCard}
          onPress={() => router.push("/tasks")}
        >
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionTitle}>Field Tasks Analytics</Text>
            <Text style={styles.viewLinkText}>Manage Tasks →</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { borderColor: "#E0E7FF" }]}>
              <Text style={[styles.statNum, { color: "#4338CA" }]}>{taskStats.total}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={[styles.statBox, { borderColor: "#D1FAE5" }]}>
              <Text style={[styles.statNum, { color: "#059669" }]}>{taskStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statBox, { borderColor: "#FDE68A" }]}>
              <Text style={[styles.statNum, { color: "#D97706" }]}>{taskStats.pending + taskStats.inProgress}</Text>
              <Text style={styles.statLabel}>Active Pending</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* User Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Inspector Details</Text>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={20} color="#4B5563" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Inspector / Student ID</Text>
              <Text style={styles.detailValue}>{displayId}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="business-outline" size={20} color="#4B5563" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Institution / Organization</Text>
              <Text style={styles.detailValue}>{userProfile.institution}</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <AppLogo size={42} showText={true} textColor="#FFFFFF" />
          <Text style={styles.appInfoVersion}>Version 2.0.0 • JWT Secured Engine</Text>
          <Text style={styles.appInfoDesc}>
            Smart Field Inspection, GPS Mapping, Photo Evidence & Task Management Suite.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutActionBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutActionBtnText}>Sign Out & Revoke JWT Token</Text>
        </TouchableOpacity>

        <View style={{ height: 28 }} />
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
  container: { flex: 1, padding: 16 },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#EFF6FF",
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  userRole: { fontSize: 14, color: "#2563EB", fontWeight: "600", marginBottom: 2 },
  userDepartment: { fontSize: 13, color: "#6B7280", textAlign: "center" },

  jwtCard: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  jwtCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  jwtTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  jwtCardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  activeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  activeBadgeText: { color: "#10B981", fontSize: 11, fontWeight: "bold" },
  jwtLabel: { color: "#94A3B8", fontSize: 12, marginBottom: 6 },
  tokenBox: {
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  tokenText: { color: "#38BDF8", fontFamily: "monospace", fontSize: 11, lineHeight: 16 },
  jwtActionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toggleTokenBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  toggleTokenText: { color: "#38BDF8", fontSize: 12, fontWeight: "600" },
  copyJwtBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyJwtBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  claimsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  claimsTitle: { color: "#CBD5E1", fontSize: 12, fontWeight: "bold", marginBottom: 8 },
  claimItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  claimKey: { color: "#94A3B8", fontSize: 11 },
  claimVal: { color: "#F8FAFC", fontSize: 11, fontWeight: "600" },

  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginBottom: 12 },
  viewLinkText: { fontSize: 12, color: "#2563EB", fontWeight: "700" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  statNum: { fontSize: 22, fontWeight: "bold", color: "#2563EB" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 4, fontWeight: "600" },

  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailText: { marginLeft: 14 },
  detailLabel: { fontSize: 12, color: "#6B7280" },
  detailValue: { fontSize: 15, color: "#111827", fontWeight: "600", marginTop: 2 },

  appInfoCard: {
    backgroundColor: "#1E40AF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  appInfoVersion: { color: "#38BDF8", fontSize: 13, fontWeight: "700", marginTop: 12 },
  appInfoDesc: { color: "#93C5FD", fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 },

  logoutActionBtn: {
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
  logoutActionBtnText: { color: "#EF4444", fontSize: 15, fontWeight: "bold" },
});