# Security Setup Guide

## 🔐 Firebase Security Configuration

This project has been secured by removing all hardcoded Firebase API keys and credentials. All Firebase configuration now relies on environment variables.

### ⚠️ Important Security Notice

The previous security alert was caused by hardcoded Firebase API keys in the source code. This has been **FIXED** by:

1. ✅ Removed all hardcoded Firebase credentials from `config/firebase.ts`
2. ✅ Made Firebase configuration depend entirely on environment variables
3. ✅ Added validation to ensure all required environment variables are set
4. ✅ Created example environment file (`.env.example`)

## 🚀 Setup Instructions

### 1. Create Environment File

Copy the example environment file and fill in your Firebase project details:

```bash
cp .env.example .env
```

### 2. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ (Project settings)
4. Scroll down to "Your apps" section
5. Click on your web app or create one if you haven't
6. Copy the configuration values from the Firebase SDK snippet

### 3. Update .env File

Edit your `.env` file with your actual Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyB...your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🌐 Deployment Configuration

### For Vercel Deployment

Set environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each environment variable:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

### For Other Deployment Platforms

Each platform has its own way to set environment variables:

- **Netlify**: Site settings → Build & deploy → Environment variables
- **GitHub Actions**: Repository Settings → Secrets and variables → Actions
- **Railway**: Project settings → Variables
- **Heroku**: Settings → Config Vars

## 🔒 Security Best Practices

### Firebase API Key Security

**Important**: Firebase API keys for web/mobile apps are **not secret**. They are meant to be public and are designed to be included in client-side code. However, we use environment variables because:

1. **Different environments**: Separate development, staging, and production Firebase projects
2. **Configuration management**: Easier to manage different configurations
3. **Security scanning compliance**: Prevents false positives in security scans
4. **Best practices**: Following industry standards for configuration management

### Firebase Security Rules

The real security for Firebase comes from **Security Rules**, not hiding the API key. Make sure your Firebase Security Rules are properly configured:

```javascript
// Example Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚨 Emergency Response

If you suspect your Firebase API key has been compromised:

1. **Don't panic**: Firebase web API keys are meant to be public
2. **Check Firebase Security Rules**: Ensure they're properly restrictive
3. **Monitor usage**: Check Firebase Console for unusual activity
4. **Rotate if needed**: Create a new Firebase project if absolutely necessary
5. **Review access**: Check who has access to your Firebase project

## 📋 Checklist

Before deploying to production:

- [ ] All environment variables are set in deployment platform
- [ ] Firebase Security Rules are configured and tested
- [ ] Authentication is working correctly
- [ ] Database permissions are restrictive
- [ ] Storage rules are secure
- [ ] No hardcoded credentials in source code
- [ ] `.env` file is in `.gitignore`

## 🆘 Troubleshooting

### "Firebase configuration incomplete" Error

This error occurs when required environment variables are missing:

1. Check if `.env` file exists and has all required variables
2. Restart your development server after adding environment variables
3. For deployment, ensure all environment variables are set in your hosting platform

### Firebase Not Initializing

1. Verify all environment variables are correctly named (must start with `EXPO_PUBLIC_`)
2. Check for typos in variable names
3. Ensure values don't have extra quotes or spaces
4. Test with a minimal Firebase project to isolate the issue

---

**Note**: After making these security changes, you should commit and push these changes to resolve the GitHub security alert.