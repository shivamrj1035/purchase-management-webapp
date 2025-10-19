# 🔥 Firebase Setup - Step by Step

## ⚠️ Current Issue: Invalid API Key

You're seeing this error because the Firebase credentials in `frontend/.env.local` are placeholder values.

---

## 📋 Quick Fix (5 minutes)

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. Sign in with your Google account

### Step 2: Create/Select Project

**Option A: Create New Project**

1. Click "Add project" or "Create a project"
2. Project name: `housing-management` (or your choice)
3. Disable Google Analytics (optional)
4. Click "Create project"
5. Wait for setup to complete (~30 seconds)

**Option B: Use Existing Project**

1. Select your existing Firebase project from the list

### Step 3: Enable Authentication

1. In the left sidebar, click "Authentication"
2. Click "Get started" button
3. Click "Email/Password" under Sign-in providers
4. Toggle "Enable" to ON
5. Click "Save"

✅ **Email/Password authentication is now enabled!**

### Step 4: Create Firestore Database

1. In the left sidebar, click "Firestore Database"
2. Click "Create database"
3. Select "Start in **test mode**" (for development)
   - Production mode requires security rules
4. Choose location (e.g., `us-central` or closest to you)
5. Click "Enable"
6. Wait for database creation (~1 minute)

✅ **Firestore database is ready!**

### Step 5: Get Web App Configuration

1. Click the ⚙️ (Settings gear) icon → "Project settings"
2. Scroll down to "Your apps" section
3. If you don't see a web app:
   - Click the `</>` (Web) icon
   - App nickname: `housing-management-web`
   - Don't check "Firebase Hosting" yet
   - Click "Register app"
4. You'll see the Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...", // ← Copy this
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### Step 6: Update Frontend .env.local

1. Open: `frontend/.env.local`
2. Replace ALL the placeholder values:

```env
# Firebase Configuration (FROM STEP 5 ABOVE)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...  # ← Paste YOUR apiKey here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend API URL (keep as is)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Save the file**

### Step 7: Restart Frontend Server

**Important:** You MUST restart the dev server for .env changes to take effect!

1. Go to the terminal running `npm run dev`
2. Press `Ctrl+C` to stop
3. Run again: `npm run dev`
4. Wait for "Ready" message

---

## ✅ Test It Works

1. Go to: http://localhost:3000/register
2. Create a new account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123456`
   - Phone: `+1234567890` (optional)
3. Click "Sign Up"

**Expected Result:**

- ✅ No error about invalid API key
- ✅ User created in Firebase
- ✅ Redirected to dashboard
- ✅ Success toast notification

**Check Firebase:**

1. Go back to Firebase Console
2. Click "Authentication" → "Users" tab
3. You should see your test user listed!

---

## 🔍 Verify Your Setup

### Check 1: .env.local File

```bash
# Run in frontend directory:
cat .env.local

# Should show REAL values, not "your_api_key_here"
```

### Check 2: Firebase Project

- ✅ Authentication enabled
- ✅ Email/Password provider enabled
- ✅ Firestore database created
- ✅ Web app registered

### Check 3: Frontend Running

```bash
# Terminal should show:
▲ Next.js 15.5.6
- Local: http://localhost:3000
✓ Ready in 2.1s
```

---

## 🐛 Still Getting Errors?

### Error: "API key not valid"

**Cause:** .env.local has placeholder values or wrong API key
**Fix:** Double-check you copied the EXACT apiKey from Firebase Console

### Error: "Firebase: Error (auth/configuration-not-found)"

**Cause:** Firebase project not properly configured
**Fix:**

1. Delete the web app from Firebase Console
2. Create new web app
3. Copy new credentials

### Error: "Network request failed"

**Cause:** Frontend server not restarted after .env change
**Fix:**

```bash
# Stop server (Ctrl+C)
npm run dev
# Wait for "Ready"
```

### Error: "Invalid origin"

**Cause:** Domain not authorized in Firebase
**Fix:**

1. Firebase Console → Authentication → Settings
2. Authorized domains → Add `localhost`

---

## 📝 Quick Reference

### Where to Find Things:

**Firebase Console:**

- URL: https://console.firebase.google.com/
- Project Settings: ⚙️ icon (top left)
- Web App Config: Project Settings → Scroll down → "Your apps"

**Your Files:**

- Frontend Config: `frontend/.env.local`
- Backend Config: `backend/.env`
- Firebase Config: `frontend/lib/firebase/config.ts`

**Commands:**

```bash
# Restart frontend
cd frontend
npm run dev

# Restart backend
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

---

## 🎯 Next Steps After Firebase Setup

Once you have valid credentials:

1. ✅ Register a test user
2. ✅ Login with that user
3. ✅ Add a funding source
4. ✅ Record a payment
5. ✅ View analytics

---

## 📞 Need Help?

If you're still stuck:

1. **Check browser console:** Press F12 → Console tab
2. **Check server logs:** Look at terminal running `npm run dev`
3. **Verify credentials:** Make sure no quotes or extra spaces
4. **Try incognito:** Sometimes browser cache causes issues

---

**🔥 Once you complete these steps, your authentication will work perfectly!**
