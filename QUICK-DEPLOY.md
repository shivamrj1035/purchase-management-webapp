# 🚀 Quick Deploy Guide

Deploy your Property Purchase Management System in 30 minutes!

## 📝 Pre-Deployment Checklist

Before starting, ensure you have:

- [ ] GitHub repository with `production` branch
- [ ] Firebase project created
- [ ] Gmail account with App Password enabled
- [ ] Vercel account
- [ ] Render account (or Railway/Heroku)

---

## ⚡ Step 1: Prepare Production Branch (2 minutes)

```bash
# Make sure you're on the production branch
git checkout production

# Pull latest changes
git pull origin production

# Verify everything is committed
git status
```

---

## ⚡ Step 2: Setup Firebase (5 minutes)

### 2.1 Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ → **Project Settings**
4. Scroll to "Your apps" → Click **Web app** (</> icon)
5. Copy the configuration values

### 2.2 Enable Firestore

1. In Firebase Console → **Firestore Database**
2. Click **Create Database**
3. Select **Production mode**
4. Choose location
5. Click **Enable**

### 2.3 Get Admin SDK

1. Firebase Console → ⚙️ → **Project Settings**
2. Click **Service Accounts** tab
3. Click **Generate new private key**
4. Save the JSON file securely

---

## ⚡ Step 3: Setup Gmail App Password (3 minutes)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not enabled)
3. Go to **App Passwords**
4. Select **Mail** and **Other (Custom name)**
5. Name it: "Property Management"
6. Click **Generate**
7. **Copy the 16-character password** (no spaces)

---

## ⚡ Step 4: Deploy Backend to Render (10 minutes)

### 4.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `property-management-backend`
   - **Branch**: `production`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4.2 Add Environment Variables

Click **Environment** tab and add:

```bash
ENVIRONMENT=production
PORT=10000
JWT_SECRET_KEY=your-random-32-character-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
FIREBASE_ADMIN_SDK_JSON={"type":"service_account","project_id":"..."}
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Property Purchase Management
CORS_ORIGINS=https://your-app.vercel.app
DATABASE_TYPE=firestore
```

**Important Notes:**

- Generate JWT secret: `openssl rand -hex 32` (or use any 32+ character random string)
- Paste entire Admin SDK JSON as single line
- Use Gmail App Password (16 chars), NOT regular password

### 4.3 Deploy

1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Copy your backend URL: `https://your-backend.onrender.com`

---

## ⚡ Step 5: Deploy Frontend to Vercel (5 minutes)

### 5.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework**: `Next.js`
   - **Root Directory**: `frontend`
   - **Branch**: `production`

### 5.2 Add Environment Variables

Click **Environment Variables** and add:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Replace `https://your-backend.onrender.com` with your actual Render URL from Step 4.3**

### 5.3 Deploy

1. Click **Deploy**
2. Wait 2-5 minutes
3. Copy your frontend URL: `https://your-app.vercel.app`

---

## ⚡ Step 6: Update CORS Settings (2 minutes)

### 6.1 Update Backend CORS

1. Go back to Render Dashboard
2. Select your backend service
3. Click **Environment**
4. Update `CORS_ORIGINS` variable:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
5. Click **Save Changes**
6. Service will auto-redeploy

---

## ⚡ Step 7: Test Your Deployment (3 minutes)

### 7.1 Test Backend

Visit: `https://your-backend.onrender.com/docs`

You should see FastAPI documentation.

### 7.2 Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Click **Register**
3. Create a test account
4. Login and test features

### 7.3 Test Email

1. Add a payment with upcoming due date
2. Check if email notification works
3. Verify email arrives in inbox

---

## ✅ Post-Deployment Tasks

### Enable Automatic Deployments

✅ **Already Done!** Both Vercel and Render automatically deploy when you push to `production` branch.

### Workflow:

```bash
# Make changes on development branch
git checkout development
# ... make changes ...
git commit -m "Your changes"
git push origin development

# Merge to production when ready
git checkout production
git merge development
git push origin production

# 🎉 Automatic deployment triggers!
```

---

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] Firebase security rules are configured
- [ ] Gmail App Password is used (not regular password)
- [ ] JWT secret is random and secure (32+ characters)
- [ ] CORS origins match frontend URL exactly
- [ ] `.env` files are in `.gitignore`
- [ ] No secrets committed to GitHub

---

## 📊 Monitoring Your App

### Backend (Render)

- **Dashboard**: https://dashboard.render.com
- **Logs**: Click your service → Logs tab
- **Metrics**: View CPU, memory usage

### Frontend (Vercel)

- **Dashboard**: https://vercel.com/dashboard
- **Analytics**: Built-in visitor tracking
- **Deployments**: View deployment history

### Database (Firebase)

- **Console**: https://console.firebase.google.com
- **Usage**: Firestore → Usage tab
- **Data**: Browse collections

---

## 🐛 Common Issues & Fixes

### ❌ Backend: "CORS Error"

**Fix**: Update `CORS_ORIGINS` in Render with exact frontend URL

### ❌ Backend: "Firebase Error"

**Fix**: Verify `FIREBASE_ADMIN_SDK_JSON` is valid JSON (single line)

### ❌ Backend: "Email not sending"

**Fix**:

1. Use Gmail App Password (16 chars, no spaces)
2. Enable 2-Step Verification
3. Check SMTP settings

### ❌ Frontend: "API Connection Failed"

**Fix**: Verify `NEXT_PUBLIC_API_URL` matches Render backend URL

### ❌ Frontend: "Firebase Auth Error"

**Fix**: Check all `NEXT_PUBLIC_FIREBASE_*` variables are correct

---

## 🎯 Next Steps

### Optional Enhancements

1. **Custom Domain**

   - Vercel: Settings → Domains
   - Render: Settings → Custom Domains

2. **Error Tracking**

   - Add Sentry for error monitoring
   - Add LogRocket for session replay

3. **Analytics**

   - Google Analytics
   - Vercel Analytics (built-in)

4. **Performance**

   - Enable Vercel Edge Functions
   - Add caching strategies

5. **Backups**
   - Schedule Firestore exports
   - Backup strategy documentation

---

## 📞 Support

If you encounter issues:

1. Check [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for detailed docs
2. Review deployment logs in Vercel/Render
3. Check Firebase Console for database issues
4. Verify all environment variables

---

## 🎉 Congratulations!

Your Property Purchase Management System is now live in production!

**URLs:**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- API Docs: `https://your-backend.onrender.com/docs`

**Share with users and start managing properties!** 🏠💰
