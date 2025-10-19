# 🚀 Production Deployment Guide

Complete guide to deploy the Property Purchase Management System to production using GitHub.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts

- ✅ GitHub account (with production branch)
- ✅ Vercel account (for frontend)
- ✅ Render account (for backend) - Alternative: Railway, Heroku
- ✅ Firebase project (Firestore database)
- ✅ Gmail account with App Password (for email notifications)

### Required Credentials

1. **Firebase Configuration**

   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

2. **Firebase Admin SDK**

   - Service Account JSON file

3. **Email Configuration**
   - Gmail address
   - Gmail App Password (16-character)

---

## Frontend Deployment (Vercel)

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Select the **`production`** branch

### Step 2: Configure Build Settings

```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 18.x
```

### Step 3: Environment Variables

Add the following environment variables in Vercel:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL (will be updated after backend deployment)
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

---

## Backend Deployment (Render)

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the **`production`** branch

### Step 2: Configure Service

```
Name: property-management-backend
Region: Choose closest to your users
Branch: production
Root Directory: backend
Runtime: Python 3.11
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Environment Variables

Add the following environment variables in Render:

```bash
# Application
ENVIRONMENT=production
PORT=10000

# Firebase Admin SDK
FIREBASE_ADMIN_SDK_JSON={"type":"service_account","project_id":"..."}

# JWT Configuration
JWT_SECRET_KEY=your-super-secure-random-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Property Purchase Management

# CORS Origins (Frontend URL)
CORS_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com

# Database
DATABASE_TYPE=firestore
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://your-backend.onrender.com`

### Step 5: Update Frontend URL

1. Go back to Vercel
2. Update `NEXT_PUBLIC_API_URL` environment variable with your Render backend URL
3. Redeploy frontend

---

## Environment Variables

### Frontend (.env.local template)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Backend API
NEXT_PUBLIC_API_URL=
```

### Backend (.env template)

```bash
# Application
ENVIRONMENT=production
PORT=10000

# Firebase Admin SDK (entire JSON as one line)
FIREBASE_ADMIN_SDK_JSON=

# JWT
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
FROM_EMAIL=
FROM_NAME=Property Purchase Management

# CORS
CORS_ORIGINS=
```

---

## Database Setup

### Firebase Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **"Create Database"**
5. Select **Production Mode**
6. Choose a location (closest to your users)

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Property configurations
    match /properties/{propertyId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Funding sources
    match /funding_sources/{fundingId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Payments
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Outgoing payments
    match /outgoing_payments/{outgoingId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firestore Indexes

Create composite indexes for:

```
Collection: payments
Fields: userId (Ascending), dueDate (Ascending)

Collection: funding_sources
Fields: userId (Ascending), createdAt (Descending)

Collection: outgoing_payments
Fields: userId (Ascending), paymentDate (Ascending)
```

---

## Post-Deployment

### 1. Test Authentication

```bash
# Register a new user
curl -X POST https://your-backend.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@12345","full_name":"Test User"}'
```

### 2. Test Frontend Access

- Visit: `https://your-app.vercel.app`
- Test login/register
- Test all features

### 3. Configure Custom Domain (Optional)

**Vercel:**

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records

**Render:**

1. Go to Settings → Custom Domains
2. Add your custom domain
3. Update DNS records

### 4. Setup SSL Certificates

Both Vercel and Render provide automatic SSL certificates (Let's Encrypt).

---

## CI/CD Pipeline

### Automatic Deployments

**Vercel** and **Render** automatically deploy when you push to the `production` branch.

### Deployment Workflow

```bash
# 1. Develop on feature branch
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature

# 2. Create pull request to production branch
# Review and test

# 3. Merge to production
git checkout production
git merge feature/new-feature
git push origin production

# 4. Automatic deployment triggers
# Vercel: 2-5 minutes
# Render: 5-10 minutes
```

### GitHub Actions (Optional Enhanced CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [production]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: |
          pip install -r requirements.txt

      - name: Run Backend Tests
        working-directory: ./backend
        run: |
          # Add your test commands here
          echo "Tests passed"

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deployment
        run: echo "Vercel auto-deploys on push"

      - name: Trigger Render Deployment
        run: echo "Render auto-deploys on push"
```

---

## Monitoring & Maintenance

### 1. Application Monitoring

**Vercel Analytics:**

- Built-in analytics for frontend
- Real-time visitor tracking
- Performance metrics

**Render Monitoring:**

- CPU and memory usage
- Request metrics
- Error logs

### 2. Error Tracking (Optional)

Consider adding:

- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user tracking

### 3. Database Monitoring

- Firebase Console → Firestore → Usage
- Monitor read/write operations
- Check storage usage

### 4. Email Monitoring

- Monitor Gmail sending limits (500 emails/day)
- Check bounce rates
- Verify deliverability

### 5. Backup Strategy

**Firestore Backups:**

```bash
# Enable automated backups in Firebase Console
# Or use gcloud CLI
gcloud firestore export gs://your-bucket-name
```

### 6. Health Checks

**Backend Health Endpoint:**
Visit: `https://your-backend.onrender.com/health`

**Frontend:**
Visit: `https://your-app.vercel.app`

---

## Production Checklist

- [ ] GitHub production branch ready
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] All environment variables configured
- [ ] Firebase Firestore database created
- [ ] Firebase security rules updated
- [ ] Firestore indexes created
- [ ] Gmail App Password configured
- [ ] CORS origins configured correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Authentication tested
- [ ] All features tested
- [ ] Error monitoring setup (optional)
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

## Troubleshooting

### Frontend Issues

**Build Failures:**

- Check Node version (18.x)
- Verify all environment variables
- Check build logs in Vercel

**API Connection Errors:**

- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Verify backend is running

### Backend Issues

**Deployment Failures:**

- Check Python version (3.11)
- Verify requirements.txt
- Check build logs in Render

**Database Connection:**

- Verify FIREBASE_ADMIN_SDK_JSON is valid JSON
- Check Firebase project permissions
- Verify Firestore is enabled

**Email Issues:**

- Verify Gmail App Password (not regular password)
- Check 2-Step Verification is enabled
- Verify SMTP settings

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

**🎉 Your Property Purchase Management System is now live in production!**
