# 🛰️ GeoField Survey Pro

> **Smart Field Inspection, GPS Mapping, Photo Evidence & Task Management Suite**

GeoField Survey Pro is a cross-platform React Native & Expo application designed for field engineers, site inspectors, geotechnical auditors, and project managers. It offers an end-to-end workflow for managing site surveys, capturing GPS coordinates, taking high-resolution site photos, assigning field tasks, managing site contacts, and securing inspector sessions with **JWT (JSON Web Token) Authentication**.

---

## 🌟 Key Features

### 🔑 1. JWT Authentication & Security
- **JSON Web Token Engine**: Full client-side JWT generation, Base64URL encoding/decoding, and payload signature verification (`Header.Payload.Signature`).
- **Standard JWT Claims**: Encodes `sub` (Subject ID), `email`, `name`, `role`, `department`, `studentId`, `iat` (Issued At), and `exp` (Expires At).
- **Session Persistence & Revocation**: Automatically verifies stored JWT tokens on launch and supports instant session revocation/sign-out.
- **JWT Inspection Tool**: View raw JWT token strings, inspect decoded claims, and copy tokens to clipboard directly from the Profile screen.

### 📋 2. Field Tasks & Checklists Manager
- **Dynamic Task Tracking**: Create, assign, and track field inspection tasks with progress percentage indicators (e.g. *75% Completed*).
- **One-Tap Status Cycle**: Interactively toggle task statuses (`Pending` ➔ `In Progress` ➔ `Completed`) with visual status badges and progress updates.
- **Survey Linking**: Link specific tasks directly to survey reports.
- **Categories & Priorities**: Categorize tasks under *Inspection, Camera, Location, Contact, Safety, or General*, with *High, Medium, or Low* priorities.

### 🗺️ 3. High-Precision GPS Location Tool
- Acquire real-time satellite GPS coordinates (*latitude, longitude, accuracy in meters*).
- One-tap attachment of current GPS coordinates to active or newly created site surveys.
- Copy location coordinates to clipboard.

### 📷 4. Site Photo Evidence Camera
- Custom in-app camera with flash control (Off / On / Auto) and camera flipping (Front / Back).
- Preview photos with timestamp watermark.
- Attach photo evidence directly to existing draft surveys or create new surveys with pre-attached photos.

### 👥 5. Site Contacts Integration
- Read device site contacts or access built-in site supervisor directory.
- Instant search and phone number copying.
- Attach site supervisor contacts directly to survey reports.

### 📝 6. Field Notes & Clipboard Workspace
- Context-aware clipboard manager to copy Survey IDs, Contact numbers, or Location coordinates.
- Paste clipboard content into active survey notes or workspace.

### 📊 7. Dashboard & Analytics
- Live metrics showing *Today's Surveys*, *Total Surveys*, and *Field Tasks Completion Rate*.
- Quick action grid for instant access to key field tools.
- Recent surveys list with priority badges and status filtering.

### 🎨 8. Premium UI & Startup Splash Screen
- **Branded Logo Splash Screen**: Custom animated splash screen (`SplashScreen.jsx`) displaying logo animations, progress status loader, and smooth transitions on app open.
- **Custom App Logo (`AppLogo.jsx`)**: Scalable vector logo component.
- **Drawer Navigation**: Sleek side drawer with active user badge, quick navigation, and JWT logout button.

---

## 🏗️ Tech Stack

| Technology | Description |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) (v0.81) with [Expo](https://expo.dev/) (SDK 54) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation v6) |
| **State & Context** | React Context API (`AuthContext`, `SurveyContext`) |
| **Authentication** | Custom JWT Token Engine (`utils/jwt.js`) |
| **Hardware APIs** | `expo-camera`, `expo-location`, `expo-contacts`, `expo-clipboard`, `expo-splash-screen` |
| **Icons & UI** | `@expo/vector-icons` (Ionicons), `react-native-reanimated` |

---

## 📁 Project Structure

```text
MyApp/
├── app/                        # Expo Router Pages & Screens
│   ├── (drawer)/              # Side Drawer Navigator
│   │   ├── (tabs)/            # Bottom Tabs Navigator
│   │   │   ├── dashboard.jsx  # Main Analytics & Dashboard
│   │   │   ├── history.jsx    # Survey History & Search
│   │   │   ├── profile.jsx    # User Profile & JWT Token Inspector
│   │   │   └── survey.jsx     # Create New Survey Form
│   │   ├── _layout.jsx        # Custom Drawer Layout & Header
│   │   ├── camera.jsx         # Site Photo Camera Tool
│   │   ├── clipboard.jsx      # Notes & Clipboard Workspace
│   │   ├── contacts.jsx       # Site Contacts Tool
│   │   ├── location.jsx       # GPS Location Acquisition Tool
│   │   ├── setting.jsx        # Settings & Preference Controls
│   │   ├── survey-preview.jsx # Detailed Survey & Linked Tasks View
│   │   └── tasks.jsx          # Field Tasks & Checklist Manager
│   ├── _layout.tsx            # Root Layout & Protected Auth Router
│   ├── login.jsx              # JWT Login Screen
│   ├── signup.jsx             # Inspector Registration Screen
│   └── modal.tsx              # Modal Container
├── components/                 # Reusable UI Components
│   ├── AppLogo.jsx            # GeoField Pro Custom App Logo
│   └── SplashScreen.jsx       # Startup Animated Logo Splash Screen
├── context/                    # Global React Context Providers
│   ├── AuthContext.jsx        # JWT Auth State, Token Storage & Credentials
│   └── SurveyContext.jsx      # Surveys, Tasks, Profile & App Data Provider
├── utils/                      # Helper Utilities
│   └── jwt.js                 # JWT Token Generator, Base64URL & Validator
├── assets/                     # App Images, Icons & Splash Assets
├── app.json                    # Expo Configuration File
└── package.json                # Project Dependencies & Scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go app](https://expo.dev/go) on your Android/iOS device (or Android Studio / Xcode Emulators)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/geofield-survey-pro.git
   cd geofield-survey-pro/MyApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

4. **Run on your device**:
   - Scan the QR code displayed in the terminal using the **Expo Go** app (Android) or **Camera** app (iOS).
   - Press `a` to run on an Android Emulator.
   - Press `i` to run on an iOS Simulator.
   - Press `w` to run in a Web Browser.

---

## 🔐 Demo Login Credentials

For quick testing and demonstration, use the pre-configured demo credentials on the Login screen:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Lead Inspector** | `chirag@geofield.com` | `password123` | Lead Field Inspector |
| **Chief Auditor** | `admin@geofield.com` | `adminpassword` | Chief Field Auditor |

*Note: You can also register a new account on the Signup screen to issue a fresh custom JWT token.*

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---

Designed & Developed with ❤️ for **Smart Field Survey Operations**.
