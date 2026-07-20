import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";

const SurveyContext = createContext();

const STORAGE_KEYS = {
  SURVEYS: "GEOFIELD_SURVEYS_V2",
  TASKS: "GEOFIELD_TASKS_V2",
  PROFILE: "GEOFIELD_PROFILE_V2",
  SETTINGS: "GEOFIELD_SETTINGS_V2",
};

// Safe storage helper working on Web, Expo, and native fallback
const safeStorage = {
  async getItem(key) {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage read error", e);
    }
    return null;
  },
  async setItem(key, value) {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("Storage write error", e);
    }
  },
};

const DEFAULT_SURVEYS = [
  {
    id: "SURVEY-2026-001",
    siteName: "Metro Line 4 Extension",
    clientName: "Infrastructure InfraCorp",
    description: "Geotechnical soil survey & foundation stability assessment for pillar 42.",
    priority: "High",
    date: "7/18/2026",
    status: "Submitted",
    photoUri: null,
    contactName: "Rajesh Sharma",
    contactNumber: "+91 98765 43210",
    location: { latitude: 23.0225, longitude: 72.5714, accuracy: 4.5 },
    notes: "Bedrock layer reached at 12m depth. Core samples stored in sample kit #4.",
    createdAt: "2026-07-18T10:30:00.000Z",
  },
  {
    id: "SURVEY-2026-002",
    siteName: "Green Valley Smart Highway",
    clientName: "National Highway Authority",
    description: "Post-monsoon drainage overflow analysis and road surface cracking audit.",
    priority: "Medium",
    date: "7/19/2026",
    status: "Draft",
    photoUri: null,
    contactName: "Anil Patel",
    contactNumber: "+91 91234 56789",
    location: { latitude: 23.0331, longitude: 72.585, accuracy: 3.2 },
    notes: "Waterlogging detected around KM 14. Needs culvert enlargement.",
    createdAt: "2026-07-19T14:15:00.000Z",
  },
  {
    id: "SURVEY-2026-003",
    siteName: "Solar Park Sector B",
    clientName: "CleanEnergy Solutions",
    description: "Solar panel array mounting structural check and wire conduit inspection.",
    priority: "Low",
    date: "7/20/2026",
    status: "Draft",
    photoUri: null,
    contactName: "Priya Mehta",
    contactNumber: "+91 99887 76655",
    location: { latitude: 23.015, longitude: 72.56, accuracy: 5.0 },
    notes: "Panel frames aligned. Minor rust noticed on rack #12 support pin.",
    createdAt: "2026-07-20T09:00:00.000Z",
  },
];

const DEFAULT_TASKS = [
  {
    id: "TASK-101",
    title: "Verify Soil Load Capacity",
    description: "Perform cone penetration test at pillar 42 zone.",
    category: "Inspection",
    priority: "High",
    status: "Completed",
    dueDate: "2026-07-18",
    surveyId: "SURVEY-2026-001",
    createdAt: "2026-07-18T08:00:00.000Z",
  },
  {
    id: "TASK-102",
    title: "Capture High-Res Site Photos",
    description: "Take wide and close-up photos of drainage erosion.",
    category: "Camera",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2026-07-20",
    surveyId: "SURVEY-2026-002",
    createdAt: "2026-07-19T09:00:00.000Z",
  },
  {
    id: "TASK-103",
    title: "Pin GPS Location of Culvert #3",
    description: "Acquire high-accuracy GPS coordinates for culvert point.",
    category: "Location",
    priority: "High",
    status: "Pending",
    dueDate: "2026-07-21",
    surveyId: "SURVEY-2026-002",
    createdAt: "2026-07-19T11:30:00.000Z",
  },
  {
    id: "TASK-104",
    title: "Client Sign-off & Contact Sync",
    description: "Confirm survey results with site supervisor Priya Mehta.",
    category: "Contact",
    priority: "Low",
    status: "Pending",
    dueDate: "2026-07-22",
    surveyId: "SURVEY-2026-003",
    createdAt: "2026-07-20T10:00:00.000Z",
  },
];

const DEFAULT_PROFILE = {
  name: "Chirag Prajapat",
  role: "Lead Field Engineer & Inspector",
  department: "Civil & Computer Engineering",
  studentId: "SURV-2026-88",
  institution: "GeoField Tech Institute",
  photoUri: null,
  avatarColor: "#2563EB",
};

export const SurveyProvider = ({ children }) => {
  const [surveys, setSurveys] = useState(DEFAULT_SURVEYS);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDraft, setActiveDraft] = useState(null); // Active working context for quick attaching

  // Load stored data on startup
  useEffect(() => {
    (async () => {
      try {
        const storedSurveys = await safeStorage.getItem(STORAGE_KEYS.SURVEYS);
        if (storedSurveys) setSurveys(JSON.parse(storedSurveys));

        const storedTasks = await safeStorage.getItem(STORAGE_KEYS.TASKS);
        if (storedTasks) setTasks(JSON.parse(storedTasks));

        const storedProfile = await safeStorage.getItem(STORAGE_KEYS.PROFILE);
        if (storedProfile) setUserProfile(JSON.parse(storedProfile));

        const storedSettings = await safeStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setIsDarkMode(!!parsed.isDarkMode);
        }
      } catch (err) {
        console.warn("Error loading persisted survey data", err);
      }
    })();
  }, []);

  // Sync helpers
  const saveSurveys = (newSurveys) => {
    setSurveys(newSurveys);
    safeStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(newSurveys));
  };

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    safeStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
  };

  const saveProfile = (newProfile) => {
    setUserProfile(newProfile);
    safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
  };

  // --- SURVEY METHODS ---
  const addSurvey = (survey) => {
    const newId = `SURVEY-${new Date().getFullYear()}-${String(surveys.length + 1).padStart(3, "0")}`;
    const newSurvey = {
      id: newId,
      siteName: survey.siteName || "Untitled Site",
      clientName: survey.clientName || "General Client",
      description: survey.description || "",
      priority: survey.priority || "Medium",
      date: survey.date || new Date().toLocaleDateString(),
      status: "Draft",
      photoUri: survey.photoUri || null,
      contactName: survey.contactName || "",
      contactNumber: survey.contactNumber || "",
      location: survey.location || null,
      notes: survey.notes || "",
      createdAt: new Date().toISOString(),
    };

    const updated = [newSurvey, ...surveys];
    saveSurveys(updated);
    setActiveDraft(newSurvey);
    return newSurvey;
  };

  const updateSurvey = (id, updates) => {
    const updated = surveys.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveSurveys(updated);
    if (activeDraft && activeDraft.id === id) {
      setActiveDraft((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteSurvey = (id) => {
    const updated = surveys.filter((s) => s.id !== id);
    saveSurveys(updated);
    // Also cleanup linked tasks
    const updatedTasks = tasks.filter((t) => t.surveyId !== id);
    saveTasks(updatedTasks);
    if (activeDraft && activeDraft.id === id) {
      setActiveDraft(null);
    }
  };

  const getSurveyById = (id) => surveys.find((s) => s.id === id);

  const getTodayCount = () => {
    const today = new Date().toLocaleDateString();
    return surveys.filter((s) => s.date === today).length;
  };

  // --- TASK METHODS ---
  const addTask = (taskData) => {
    const newId = `TASK-${100 + tasks.length + 1}`;
    const newTask = {
      id: newId,
      title: taskData.title || "New Field Task",
      description: taskData.description || "",
      category: taskData.category || "Inspection",
      priority: taskData.priority || "Medium",
      status: taskData.status || "Pending",
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
      surveyId: taskData.surveyId || null,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    saveTasks(updated);
    return newTask;
  };

  const updateTask = (id, updates) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveTasks(updated);
  };

  const toggleTaskStatus = (id) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextStatus =
          t.status === "Pending"
            ? "In Progress"
            : t.status === "In Progress"
            ? "Completed"
            : "Pending";
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const getTasksBySurveyId = (surveyId) => tasks.filter((t) => t.surveyId === surveyId);

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, percent };
  };

  // --- PROFILE & SETTINGS ---
  const updateUserProfile = (updates) => {
    const updated = { ...userProfile, ...updates };
    saveProfile(updated);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ isDarkMode: next }));
      return next;
    });
  };

  const resetAllData = () => {
    saveSurveys(DEFAULT_SURVEYS);
    saveTasks(DEFAULT_TASKS);
    saveProfile(DEFAULT_PROFILE);
    setIsDarkMode(false);
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        getSurveyById,
        getTodayCount,
        // Tasks
        tasks,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        getTasksBySurveyId,
        getTaskStats,
        // User Profile & Settings
        userProfile,
        updateUserProfile,
        isDarkMode,
        toggleDarkMode,
        activeDraft,
        setActiveDraft,
        resetAllData,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveys = () => {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurveys must be used within SurveyProvider");
  return ctx;
};
