# Google Login "Unauthorized" Troubleshooting Plan

The "Google Login: Unauthorized" (or "Developer Error") in Capacitor/Android is typically caused by a mismatch between the app's signature and the registration in the Firebase Console.

## 1. Firebase Console Checklist (USER ACTION REQUIRED)
Please verify these three settings in your [Firebase Console](https://console.firebase.google.com/):

- **Support Email**: Go to **Project Settings (톱니바퀴) > General**. Ensure a "Support email" is selected. **Google Login will not work without this.**
- **Google Provider Enabled**: Go to **Authentication > Sign-in method**. Ensure "Google" is enabled.
- **SHA-1 Fingerprint**: Go to **Project Settings > General > Your Apps (Android)**. Ensure your SHA-1 fingerprint is added.
    - If you are testing locally, you need your **local debug SHA-1**.
    - If you are using an APK from GitHub Actions, you need the **SHA-1 from the build log**.

## 2. Identify your SHA-1
To find your local SHA-1 fingerprint, run this in your terminal:
```powershell
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
*(If `keytool` is not found, it is located in your JDK's `bin` folder)*.

## 3. Code Improvement: Better Error Feedback
We will improve `dataStore.js` to show the exact error message and code from the native plugin to confirm the cause.

## 5. OAuth Consent Screen (Critical)
In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent):
- Ensure the **OAuth Consent Screen** is configured.
- If it's in **"Testing"** mode, you MUST add your email to the **"Test users"** list.

## 6. Capacitor Sync
After adding `google-services.json` or changing `capacitor.config.json`, always run:
```bash
npx cap sync android
```
Then, rebuild the app in Android Studio (or via CLI).
