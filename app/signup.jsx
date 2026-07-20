import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AppLogo from "@/components/AppLogo";

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, authError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Field Inspector & Engineer");
  const [department, setDepartment] = useState("Civil & Geotechnical Dept.");
  const [studentId, setStudentId] = useState("");
  const [institution, setInstitution] = useState("GeoField Institute");

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your Full Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Validation Error", "Please enter a valid Email address.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long.");
      return;
    }

    const result = await signup({
      name,
      email,
      password,
      role,
      department,
      studentId: studentId.trim() || `INS-${Math.floor(100 + Math.random() * 900)}`,
      institution,
    });

    if (result.success) {
      Alert.alert("✅ Account Created", "JWT token issued & signed in!", [
        {
          text: "Open Dashboard",
          onPress: () => router.replace("/(drawer)"),
        },
      ]);
    } else {
      Alert.alert("Registration Error", result.error || "Could not register account.");
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      {/* Background Orbs */}
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppLogo size={44} showText={true} textColor="#FFFFFF" />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Inspector Account</Text>
          <Text style={styles.cardSub}>
            Register your inspector details to receive an authenticated JWT token.
          </Text>

          {authError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Chirag Prajapat"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. inspector@geofield.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password (6+ chars) *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          {/* Role */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Professional Role</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="e.g. Lead Field Inspector"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          {/* Department */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="file-tray-full-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="e.g. Civil & Computer Engineering"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          {/* Student/Inspector ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Inspector / Student ID</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. SURV-2026-88"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.signupBtnText}>Register & Generate JWT Token</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already registered?</Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.loginLink}>Sign In Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#0F172A" },
  topOrb: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(37, 99, 235, 0.2)",
  },
  bottomOrb: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
  },
  scrollContent: { padding: 20, paddingVertical: 30 },

  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  backBtn: { padding: 4 },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    elevation: 4,
    marginBottom: 30,
  },
  cardTitle: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#94A3B8", marginBottom: 20 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    marginBottom: 16,
  },
  errorText: { color: "#EF4444", fontSize: 13, fontWeight: "600" },

  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#CBD5E1", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#334155",
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15 },

  signupBtn: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 12,
    marginTop: 12,
    elevation: 3,
  },
  signupBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  loginText: { color: "#94A3B8", fontSize: 14 },
  loginLink: { color: "#38BDF8", fontWeight: "bold", fontSize: 14 },
});
