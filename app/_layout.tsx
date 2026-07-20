import React, { useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SurveyProvider } from "@/context/SurveyContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/SplashScreen";

function NavigationStack() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(drawer)" />
      ) : (
        <>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </>
      )}
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isSplashActive, setIsSplashActive] = useState(true);

  return (
    <AuthProvider>
      <SurveyProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          {isSplashActive ? (
            <SplashScreen onFinish={() => setIsSplashActive(false)} />
          ) : (
            <NavigationStack />
          )}
          <StatusBar style="light" />
        </ThemeProvider>
      </SurveyProvider>
    </AuthProvider>
  );
}