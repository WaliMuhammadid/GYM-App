# BeastFit AI Mobile App (Expo & EAS Build)

This is the mobile application wrapper for the BeastFit AI Gym & Nutrition system. It connects directly to your BeastFit backend and provides an immersive native mobile experience on Android & iOS.

## How to Build on Expo.dev (EAS Build)

### Method A: Build via EAS CLI (Recommended)

1. **Install EAS CLI**:
   `ash
   npm install -g eas-cli
   `

2. **Login to your Expo account**:
   `ash
   eas login
   `

3. **Navigate to the mobile directory**:
   `ash
   cd mobile
   `

4. **Build Standalone Android APK (Install directly on phone)**:
   `ash
   npx eas-cli build -p android --profile preview
   `
   - EAS will upload the project to **expo.dev**
   - Expo cloud servers will compile and build the Android APK
   - Once complete, you will receive a QR code and direct download link to install the .apk on any Android phone!

5. **Build for Google Play Store (Production AAB)**:
   `ash
   npx eas-cli build -p android --profile production
   `

---

### Method B: Build directly on Expo.dev Web Dashboard

1. Go to [https://expo.dev](https://expo.dev) and log in.
2. Click **Create a project** -> **Import Git Repository**.
3. Select your GitHub repository: https://github.com/WaliMuhammadid/GYM-App.
4. Set the **Root directory** to mobile.
5. Under **Builds**, select **Android** and profile **preview**.
6. Click **Start Build**!
