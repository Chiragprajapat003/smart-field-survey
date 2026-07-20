import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppLogo({ size = 48, showText = true, variant = "default", textColor = "#FFFFFF" }) {
  const iconSize = size * 0.55;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoBadge,
          { width: size, height: size, borderRadius: size * 0.28 },
          variant === "light" && styles.lightBadge,
        ]}
      >
        <Ionicons
          name="navigate-circle"
          size={iconSize}
          color={variant === "light" ? "#2563EB" : "#FFFFFF"}
        />
        <View style={[styles.dotBadge, { top: size * 0.15, right: size * 0.15 }]}>
          <Ionicons name="checkmark-sharp" size={size * 0.22} color="#10B981" />
        </View>
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            GeoField <Text style={styles.titleHighlight}>Pro</Text>
          </Text>
          <Text style={[styles.subtitle, { color: textColor === "#FFFFFF" ? "rgba(255,255,255,0.7)" : "#6B7280" }]}>
            Smart Survey Suite
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBadge: {
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  lightBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  dotBadge: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 1,
    elevation: 2,
  },
  textContainer: {
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  titleHighlight: {
    color: "#38BDF8",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
