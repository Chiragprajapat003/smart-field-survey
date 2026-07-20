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
import { useAuth, DEMO_ACCOUNTS } from "@/context/AuthContext";
import AppLogo from "@/components/AppLogo";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter your password.");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      Alert.alert("✅ JWT Auth Success", `Welcome back, ${result.user.name}!`, [
        {
          text: "Open Dashboard",
          onPress: () => router.replace("/(drawer)"),
        },
      ]);
    } else {
      Alert.alert("Authentication Failed", result.error || "Invalid credentials.");
    }
  };

  const handleQuickDemoLogin = async (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);

    const result = await login(demoAccount.email, demoAccount.password);
    if (result.success) {
      router.replace("/(drawer)");
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      {/* Top Gradient Background Accents */}
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding Banner */}
        <View style={styles.headerSection}>
          <View style={styles.logoWrapper}>
            <AppLogo size={54} showText={false} variant="default" />
          </View>
          <Text style={styles.appTitle}>
            GeoField <Text style={styles.appTitleHighlight}>Pro</Text>
          </Text>
          <Text style={styles.appSubtitle}>Smart Field Inspection & Survey Suite</Text>
          <View style={styles.jwtBadge}>
            <Ionicons name="key-sharp" size={14} color="#38BDF8" />
            <Text style={styles.jwtBadgeText}>Secured with JWT Token Authentication</Text>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to Account</Text>
          <Text style={styles.cardSub}>Enter your credentials to generate a JWT session</Text>

          {authError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
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

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.loginBtnText}>Authenticate & Issue JWT</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link to Signup */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Demo Login Accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>⚡ Quick Demo Sign In</Text>
          <Text style={styles.demoSub}>Select a pre-configured profile to issue JWT instantly:</Text>

          <View style={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={styles.demoCard}
                onPress={() => handleQuickDemoLogin(acc)}
              >
                <View style={styles.demoHeader}>
                  <View style={[styles.demoAvatar, { backgroundColor: acc.avatarColor }]}>
                    <Ionicons name="person" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.demoName}>{acc.name}</Text>
                    <Text style={styles.demoRole}>{acc.role}</Text>
                  </View>
                </View>
                <View style={styles.demoFooter}>
                  <Text style={styles.demoEmail}>{acc.email}</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#38BDF8" />
                </View>
              </TouchableOpacity>
            ))}
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
  scrollContent: { padding: 20, paddingVertical: 40 },

  headerSection: { alignItems: "center", marginBottom: 24 },
  logoWrapper: { marginBottom: 12 },
  appTitle: { fontSize: 30, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 },
  appTitleHighlight: { color: "#38BDF8" },
  appSubtitle: { fontSize: 13, color: "#94A3B8", marginTop: 4, fontWeight: "500" },
  jwtBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    marginTop: 12,
  },
  jwtBadgeText: { color: "#38BDF8", fontSize: 12, fontWeight: "700" },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 24,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 },
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

  inputGroup: { marginBottom: 16 },
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

  loginBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 12,
    marginTop: 8,
    elevation: 3,
  },
  loginBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  signupText: { color: "#94A3B8", fontSize: 14 },
  signupLink: { color: "#38BDF8", fontWeight: "bold", fontSize: 14 },

  demoSection: { marginTop: 4 },
  demoTitle: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 },
  demoSub: { fontSize: 12, color: "#94A3B8", marginBottom: 12 },
  demoGrid: { gap: 10 },
  demoCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  demoAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  demoName: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  demoRole: { color: "#94A3B8", fontSize: 12 },
  demoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 8,
  },
  demoEmail: { color: "#38BDF8", fontSize: 12, fontWeight: "600" },
});
