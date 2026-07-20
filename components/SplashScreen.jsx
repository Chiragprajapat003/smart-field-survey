import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [loadingText, setLoadingText] = useState("Initializing GeoField Engine...");

  useEffect(() => {
    // Fade & Scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();

    // Progress text updates
    const t1 = setTimeout(() => {
      setLoadingText("Loading surveys & tasks...");
    }, 700);

    const t2 = setTimeout(() => {
      setLoadingText("Readying field tools...");
    }, 1500);

    const t3 = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      {/* Decorative Gradient Background Elements */}
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />

      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Main Logo Container */}
        <View style={styles.logoBadgeOuter}>
          <View style={styles.logoBadgeInner}>
            <Ionicons name="map-sharp" size={48} color="#FFFFFF" />
            <View style={styles.compassOverlay}>
              <Ionicons name="compass" size={24} color="#38BDF8" />
            </View>
          </View>
        </View>

        {/* Title & Tagline */}
        <Text style={styles.appName}>
          GeoField <Text style={styles.appHighlight}>Pro</Text>
        </Text>
        <Text style={styles.tagline}>Smart Field Survey & Task Platform</Text>
        <View style={styles.badgeRow}>
          <View style={styles.versionBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
            <Text style={styles.versionText}>v2.0 Dynamic Engine</Text>
          </View>
        </View>
      </Animated.View>

      {/* Footer Loader */}
      <View style={styles.loaderContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingStatusText}>{loadingText}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  topOrb: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(37, 99, 235, 0.25)",
  },
  bottomOrb: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoBadgeOuter: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: "rgba(37, 99, 235, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    marginBottom: 24,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoBadgeInner: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  compassOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#0F172A",
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  appHighlight: {
    color: "#38BDF8",
  },
  tagline: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  versionText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
  loaderContainer: {
    position: "absolute",
    bottom: 60,
    width: width * 0.75,
    alignItems: "center",
  },
  progressBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#38BDF8",
    borderRadius: 3,
  },
  loadingStatusText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
});
