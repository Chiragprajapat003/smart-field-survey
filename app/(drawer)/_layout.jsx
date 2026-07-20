import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useSurveys } from "@/context/SurveyContext";
import { useAuth } from "@/context/AuthContext";
import AppLogo from "@/components/AppLogo";

const getInitials = (name) => {
  if (!name) return "CP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

function CustomDrawerContent(props) {
  const router = useRouter();
  const { userProfile } = useSurveys();
  const { user, logout } = useAuth();

  // Use Auth user profile if available, fallback to survey userProfile
  const displayName = user?.name || userProfile.name;
  const displayRole = user?.role || userProfile.role;

  const handleLogout = () => {
    Alert.alert(
      "🔒 Revoke JWT Session",
      "Are you sure you want to sign out and invalidate your local JWT token?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out & Revoke",
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
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header with App Logo & User Banner */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <AppLogo size={36} textColor="#FFFFFF" />
        </View>

        <View style={styles.userCard}>
          {userProfile.photoUri ? (
            <Image
              source={{ uri: userProfile.photoUri }}
              style={styles.drawerAvatar}
            />
          ) : (
            <View
              style={[
                styles.drawerAvatar,
                { backgroundColor: userProfile.avatarColor || "rgba(255,255,255,0.2)" },
              ]}
            >
              <Text style={styles.drawerAvatarText}>{getInitials(displayName)}</Text>
            </View>
          )}
          <View style={styles.userInfoText}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userRole} numberOfLines={1}>{displayRole}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>

      {/* Logout / JWT Revoke Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out (JWT Revoke)</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#2563EB",
        drawerInactiveTintColor: "#374151",
        drawerActiveBackgroundColor: "#EFF6FF",
        drawerLabelStyle: { fontSize: 15, fontWeight: "600" },
        drawerStyle: { backgroundColor: "#F9FAFB" },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tasks"
        options={{
          title: "Field Tasks",
          drawerLabel: "Field Tasks",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="camera"
        options={{
          title: "Camera Tool",
          drawerLabel: "Camera Tool",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="contacts"
        options={{
          title: "Site Contacts",
          drawerLabel: "Site Contacts",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="location"
        options={{
          title: "GPS Location",
          drawerLabel: "GPS Location",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="clipboard"
        options={{
          title: "Notes & Clipboard",
          drawerLabel: "Notes & Clipboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="setting"
        options={{
          title: "Settings & Profile",
          drawerLabel: "Settings & Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="survey-preview"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1E40AF",
    padding: 20,
    paddingTop: 48,
    marginBottom: 8,
  },
  brandRow: { marginBottom: 16 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  drawerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  drawerAvatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  userInfoText: { flex: 1 },
  userName: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  userRole: { color: "#93C5FD", fontSize: 12, marginTop: 2 },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  logoutText: { color: "#EF4444", fontWeight: "bold", fontSize: 14 },
});