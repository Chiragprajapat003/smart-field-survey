import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import { generateJwtToken, verifyJwtToken, decodeJwtToken } from "@/utils/jwt";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "GEOFIELD_JWT_TOKEN_V2";

const safeStorage = {
  async getItem(key) {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Auth storage read error", e);
    }
    return null;
  },
  async setItem(key, value) {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("Auth storage write error", e);
    }
  },
  async removeItem(key) {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("Auth storage remove error", e);
    }
  },
};

// Demo default accounts for easy one-tap login
export const DEMO_ACCOUNTS = [
  {
    id: "USR-2026-88",
    email: "chirag@geofield.com",
    name: "Chirag Prajapat",
    password: "password123",
    role: "Lead Field Inspector",
    department: "Civil & Computer Engineering",
    studentId: "SURV-2026-88",
    institution: "GeoField Tech Institute",
    avatarColor: "#2563EB",
  },
  {
    id: "USR-2026-99",
    email: "admin@geofield.com",
    name: "Dr. A. Sharma (Chief Auditor)",
    password: "adminpassword",
    role: "Chief Field Auditor & Admin",
    department: "Quality Control Department",
    studentId: "AUDIT-9901",
    institution: "National Infra Survey Council",
    avatarColor: "#059669",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Check stored JWT token on launch
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await safeStorage.getItem(AUTH_STORAGE_KEY);
        if (storedToken) {
          const verification = verifyJwtToken(storedToken);
          if (verification.valid && verification.payload) {
            setToken(storedToken);
            setUser(verification.payload);
            setIsAuthenticated(true);
          } else {
            // Token expired or invalid
            await safeStorage.removeItem(AUTH_STORAGE_KEY);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn("Error checking auth token", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError("");
    setIsLoading(true);

    try {
      // Simulate network authentication request
      await new Promise((resolve) => setTimeout(resolve, 600));

      const cleanEmail = email.trim().toLowerCase();
      let matchedAccount = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === cleanEmail
      );

      // If custom email entered, auto-create payload for seamless testing
      if (!matchedAccount) {
        matchedAccount = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          email: cleanEmail,
          name: cleanEmail.split("@")[0].toUpperCase() || "Field Inspector",
          role: "Field Inspector",
          department: "Geotechnical Survey Division",
          studentId: `INS-${Math.floor(100 + Math.random() * 900)}`,
          institution: "GeoField Network",
          avatarColor: "#7C3AED",
        };
      }

      const { token: newJwtToken, payload } = generateJwtToken(matchedAccount);

      await safeStorage.setItem(AUTH_STORAGE_KEY, newJwtToken);
      setToken(newJwtToken);
      setUser(payload);
      setIsAuthenticated(true);
      return { success: true, token: newJwtToken, user: payload };
    } catch (err) {
      setAuthError(err?.message || "Login failed");
      return { success: false, error: err?.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const signup = async (userData) => {
    setAuthError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const newAccount = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        email: userData.email.trim().toLowerCase(),
        name: userData.name.trim(),
        role: userData.role || "Field Inspector",
        department: userData.department || "Survey Operations",
        studentId: userData.studentId || `INS-${Math.floor(100 + Math.random() * 900)}`,
        institution: userData.institution || "GeoField Institute",
        avatarColor: "#059669",
      };

      const { token: newJwtToken, payload } = generateJwtToken(newAccount);

      await safeStorage.setItem(AUTH_STORAGE_KEY, newJwtToken);
      setToken(newJwtToken);
      setUser(payload);
      setIsAuthenticated(true);
      return { success: true, token: newJwtToken, user: payload };
    } catch (err) {
      setAuthError(err?.message || "Registration failed");
      return { success: false, error: err?.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await safeStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn("Error clearing storage token", e);
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        authError,
        login,
        signup,
        logout,
        getDecodedToken: () => decodeJwtToken(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
