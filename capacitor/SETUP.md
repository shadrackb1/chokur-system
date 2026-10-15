# Capacitor Mobile App Setup for Chokur System

## Prerequisites

```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Install Capacitor core packages
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/local-notifications @capacitor/push-notifications @capacitor/filesystem @capacitor/camera @capacitor/share @capacitor/haptics @capacitor/keyboard @capacitor/network
```

## Initialize Capacitor

```bash
# Initialize (run once)
npx cap init "Chokur System" com.chokur.system --web-dir=dist
```

## Build for Production

```bash
# Build the web app
npm run build

# Sync with native platforms
npx cap sync
```

## Android Setup

```bash
# Open Android Studio
npx cap open android

# Or build directly
npx cap build android
```

### Android Configuration

1. **Keystore Setup** (for release builds):
   ```bash
   # Generate keystore
   keytool -genkey -v -keystore release.keystore -alias chokur -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Gradle Configuration** (`android/app/build.gradle`):
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("release.keystore")
               storePassword System.getenv("KEYSTORE_PASSWORD")
               keyAlias "chokur"
               keyPassword System.getenv("KEY_PASSWORD")
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Permissions** (already in capacitor.config.json):
   - INTERNET
   - ACCESS_NETWORK_STATE
   - CAMERA (for QR code scanning if needed)
   - READ/WRITE_EXTERNAL_STORAGE (for file downloads)
   - VIBRATE (for notifications)
   - FOREGROUND_SERVICE (for background sync)

## iOS Setup

```bash
# Open Xcode
npx cap open ios

# Or build directly
npx cap build ios
```

### iOS Configuration

1. **Xcode Project Settings**:
   - Bundle Identifier: `com.chokur.system`
   - Deployment Target: iOS 15.0+
   - Signing & Capabilities: Add Push Notifications, Background Modes

2. **Info.plist Additions**:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>Chokur needs camera access for QR code scanning</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Chokur needs photo library access for profile pictures</string>
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <false/>
   </dict>
   ```

## Push Notifications Setup

### Firebase Cloud Messaging (FCM)

1. **Create Firebase Project**: https://console.firebase.google.com
2. **Add Android/iOS Apps** with same bundle IDs
3. **Download Config Files**:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/App/`

4. **Install FCM Plugin**:
   ```bash
   npm install @capacitor-firebase/messaging
   npx cap sync
   ```

5. **Service Worker** (for web PWA):
   ```javascript
   // public/firebase-messaging-sw.js
   importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
   importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

   firebase.initializeApp({
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   });

   const messaging = firebase.messaging();
   ```

## App Icons & Splash Screens

```bash
# Generate icons and splash screens
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor "#FEF9EF" --splashBackgroundColor "#FEF9EF"
```

## Environment Variables for Mobile

Create `.env.mobile`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://chokur-system.vercel.app
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/mobile.yml
name: Mobile Build

on:
  push:
    tags: ['v*']

jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - uses: android-actions/setup-android@v2
      - run: ./gradlew assembleRelease
        working-directory: ./android
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
      - uses: actions/upload-artifact@v4
        with:
          name: app-release.aab
          path: android/app/build/outputs/bundle/release/app-release.aab

  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx cap sync ios
      - run: xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath App.xcarchive archive
      - run: xcodebuild -exportArchive -archivePath App.xcarchive -exportPath . -exportOptionsPlist ExportOptions.plist
      - uses: actions/upload-artifact@v4
        with:
          name: Chokur.ipa
          path: Chokur.ipa
```

## Testing on Devices

```bash
# Run on connected Android device
npx cap run android

# Run on connected iOS device
npx cap run ios

# Live reload during development
npx cap run android --livereload --external
```

## Offline Sync Strategy

The app uses a hybrid offline-first approach:

1. **IndexedDB** stores all data locally
2. **Service Worker** caches app shell and assets
3. **Background Sync** queues mutations when offline
4. **Supabase Realtime** pushes updates when online

### Sync Implementation

```typescript
// src/lib/mobileSync.ts
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { BackgroundTask } from '@capacitor/background-task';

export async function setupMobileSync() {
  if (!Capacitor.isNativePlatform()) return;

  // Listen for network changes
  Network.addListener('networkStatusChange', async (status) => {
    if (status.connected) {
      await syncPendingChanges();
    }
  });

  // Register background sync task
  BackgroundTask.beforeExit(async () => {
    await syncPendingChanges();
  });
}

async function syncPendingChanges() {
  // Implementation uses the existing hybrid sync logic
  // from HybridGradingContext
}
```

## App Store Deployment

### Google Play Store

1. **Build AAB**: `npx cap build android` → `android/app/build/outputs/bundle/release/app-release.aab`
2. **Upload to Play Console**: https://play.google.com/console
3. **Internal Testing** → **Closed Testing** → **Open Testing** → **Production**

### Apple App Store

1. **Build IPA**: `npx cap build ios` → Archive in Xcode → Export IPA
2. **Upload via Transporter** or Xcode Organizer
3. **App Store Connect**: https://appstoreconnect.apple.com
4. **TestFlight** → **App Store Review**

## Version Management

Update `capacitor.config.json` and `package.json` version together:

```bash
# Patch version
npm version patch
# Minor version
npm version minor
# Major version
npm version major
```

## Troubleshooting

### Common Issues

1. **White Screen on Launch**:
   - Check `server.url` in capacitor.config.json
   - Verify `dist` folder exists and has index.html

2. **Push Notifications Not Working**:
   - Verify FCM config files are in correct locations
   - Check `google-services.json` / `GoogleService-Info.plist`
   - Ensure Push Notifications capability enabled in Xcode

3. **Camera/Storage Permissions**:
   - Test on physical device (not emulator)
   - Check AndroidManifest.xml / Info.plist permissions

4. **Build Failures**:
   - Clean: `npx cap sync` then rebuild
   - Check Gradle/Xcode versions match requirements

### Debug Commands

```bash
# View Android logs
adb logcat | grep -i chokur

# View iOS logs
xcrun simctl spawn booted log stream --predicate 'process == "App"'

# Clear Capacitor cache
npx cap clean android
npx cap clean ios
```