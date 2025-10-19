# ✅ Pre-Deployment Verification

Run through this checklist before deploying to ensure everything is ready.

## 📋 Quick Verification (5 minutes)

### 1. Git Repository Status

```bash
# Check current branch
git branch --show-current
# Expected: production

# Check for uncommitted changes
git status
# Expected: "nothing to commit, working tree clean"

# Check remote connection
git remote -v
# Expected: Your GitHub repository URL
```

**Status:** ⬜ Verified

---

### 2. Backend Files

```bash
# Navigate to backend
cd backend

# Check requirements.txt exists
ls requirements.txt

# Check main files exist
ls main.py auth.py

# Check routers exist
ls routers/users.py routers/notifications.py

# Check services exist
ls services/email_service.py
```

**Status:** ⬜ Verified

---

### 3. Frontend Files

```bash
# Navigate to frontend
cd frontend

# Check package.json exists
ls package.json

# Check Next.js config exists
ls next.config.ts

# Check key directories exist
ls -d app/ components/ lib/
```

**Status:** ⬜ Verified

---

### 4. Configuration Files

```bash
# From project root
ls .gitignore
ls frontend/.env.example
ls backend/.env.example
ls frontend/vercel.json
ls backend/render.yaml
ls .github/workflows/deploy.yml
```

**Status:** ⬜ Verified

---

### 5. Deployment Documentation

```bash
ls DEPLOY.md
ls QUICK-DEPLOY.md
ls DEPLOYMENT-GUIDE.md
ls DEPLOYMENT-CHECKLIST.md
ls PRODUCTION-README.md
ls DEPLOYMENT-SUMMARY.md
```

**Status:** ⬜ Verified

---

## 🔍 Detailed Verification

### Backend Verification

#### 1. Python Dependencies

```bash
cd backend
python --version
# Expected: Python 3.9+ (3.11 recommended)

# Check if requirements.txt is valid
cat requirements.txt | wc -l
# Expected: 13 lines (12 packages + blank)
```

**Required Packages:**

- ✅ fastapi
- ✅ uvicorn
- ✅ python-dotenv
- ✅ pydantic
- ✅ pydantic-settings
- ✅ firebase-admin
- ✅ python-jose
- ✅ passlib
- ✅ python-multipart
- ✅ sendgrid
- ✅ apscheduler
- ✅ email-validator

**Status:** ⬜ Verified

#### 2. Backend Code Structure

```bash
backend/
├── routers/
│   ├── __init__.py          ⬜
│   ├── users.py             ⬜
│   └── notifications.py     ⬜
├── services/
│   ├── __init__.py          ⬜
│   └── email_service.py     ⬜
├── main.py                  ⬜
├── auth.py                  ⬜
├── requirements.txt         ⬜
├── .env.example             ⬜
├── render.yaml              ⬜
├── Dockerfile               ⬜
└── .dockerignore            ⬜
```

**Status:** ⬜ All files present

---

### Frontend Verification

#### 1. Node.js & npm

```bash
cd frontend
node --version
# Expected: v18.x or v20.x

npm --version
# Expected: 9.x or 10.x
```

**Status:** ⬜ Verified

#### 2. Frontend Dependencies

```bash
# Check package.json
cat package.json | grep "next"
# Expected: "next": "15.5.6" or similar

cat package.json | grep "react"
# Expected: "react": "19.1.0" or similar

cat package.json | grep "firebase"
# Expected: "firebase": "^12.4.0" or similar
```

**Key Dependencies:**

- ✅ next (15.5.6)
- ✅ react (19.1.0)
- ✅ firebase (12.4.0+)
- ✅ zustand (5.0.8+)
- ✅ tailwindcss (4+)

**Status:** ⬜ Verified

#### 3. Frontend Code Structure

```bash
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx       ⬜
│   │   ├── register/page.tsx    ⬜
│   │   └── forgot-password/page.tsx ⬜
│   ├── dashboard/
│   │   ├── analytics/page.tsx   ⬜
│   │   ├── funding-sources/page.tsx ⬜
│   │   ├── incoming-payments/page.tsx ⬜
│   │   └── ... (more pages)
│   ├── layout.tsx               ⬜
│   └── page.tsx                 ⬜
├── components/                  ⬜
├── lib/                         ⬜
├── package.json                 ⬜
├── next.config.ts               ⬜
├── .env.example                 ⬜
├── vercel.json                  ⬜
├── Dockerfile                   ⬜
└── middleware.ts                ⬜
```

**Status:** ⬜ All files present

---

## 🔐 Security Verification

### 1. .gitignore Check

```bash
# Verify sensitive files are ignored
cat .gitignore | grep ".env"
# Expected: .env and .env.local patterns

cat .gitignore | grep "firebase-adminsdk"
# Expected: *firebase-adminsdk*.json
```

**Must be in .gitignore:**

- ✅ `.env`
- ✅ `.env.local`
- ✅ `.env.production.local`
- ✅ `firebase-adminsdk.json`
- ✅ `node_modules/`
- ✅ `venv/`
- ✅ `__pycache__/`

**Status:** ⬜ Verified

### 2. No Secrets in Code

```bash
# Search for potential secrets (should find none)
grep -r "AIza" frontend/app/ frontend/components/ frontend/lib/
# Expected: No results

grep -r "your-secret" backend/*.py backend/routers/ backend/services/
# Expected: No results
```

**Status:** ⬜ No secrets found

---

## 🧪 Local Testing

### Backend Local Test

```bash
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# OR (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and fill in)
# Then test run
uvicorn main:app --reload
```

**Expected Output:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process
✅ Auth routes loaded
✅ Notification routes loaded
```

**Test URLs:**

- http://localhost:8000 (should show API info)
- http://localhost:8000/health (should show "healthy")
- http://localhost:8000/docs (should show API documentation)

**Status:** ⬜ Backend runs locally

---

### Frontend Local Test

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file (copy from .env.example and fill in)
# Then test run
npm run dev
```

**Expected Output:**

```
  ▲ Next.js 15.5.6
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in Xms
```

**Test URLs:**

- http://localhost:3000 (should show app)
- http://localhost:3000/login (should show login page)
- http://localhost:3000/register (should show register page)

**Status:** ⬜ Frontend runs locally

---

### Build Test

```bash
cd frontend

# Test production build
npm run build
```

**Expected Output:**

```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**Status:** ⬜ Build succeeds

---

## 🌐 External Services Ready

### 1. Firebase Project

- ⬜ Project created
- ⬜ Firestore database enabled (Production mode)
- ⬜ Authentication enabled
- ⬜ Email/Password provider enabled
- ⬜ Web app configuration copied
- ⬜ Service Account JSON downloaded

**Firebase Console:** https://console.firebase.google.com

**Status:** ⬜ Ready

---

### 2. Gmail App Password

- ⬜ Gmail account ready
- ⬜ 2-Step Verification enabled
- ⬜ App Password generated (16 characters)
- ⬜ App Password saved securely

**Setup:** https://myaccount.google.com/security

**Status:** ⬜ Ready

---

### 3. GitHub Repository

- ⬜ Repository exists
- ⬜ Production branch exists
- ⬜ All code pushed to production branch
- ⬜ No uncommitted changes
- ⬜ Repository is accessible

**Status:** ⬜ Ready

---

### 4. Deployment Platforms

**Vercel:**

- ⬜ Account created
- ⬜ GitHub connected
- ⬜ Ready to import project

**Render:**

- ⬜ Account created
- ⬜ GitHub connected
- ⬜ Ready to create web service

**Status:** ⬜ Ready

---

## 📝 Credentials Checklist

### Have You Gathered These?

**Firebase (7 items):**

- ⬜ API Key
- ⬜ Auth Domain
- ⬜ Project ID
- ⬜ Storage Bucket
- ⬜ Messaging Sender ID
- ⬜ App ID
- ⬜ Admin SDK JSON (complete file)

**Gmail (2 items):**

- ⬜ Email address
- ⬜ App Password (16 characters, no spaces)

**Security (1 item):**

- ⬜ JWT Secret Key (32+ random characters)
  - Generate: `openssl rand -hex 32`
  - Or: Any random 32+ character string

**Status:** ⬜ All credentials ready

---

## 🎯 Final Pre-Deployment Check

### Code Quality

- ⬜ No syntax errors in backend
- ⬜ No syntax errors in frontend
- ⬜ No console errors in browser
- ⬜ No TypeScript errors
- ⬜ All imports resolve correctly

### Documentation

- ⬜ README.md is up to date
- ⬜ All deployment docs present
- ⬜ Environment variable examples provided
- ⬜ No sensitive data in documentation

### Repository

- ⬜ All changes committed
- ⬜ Production branch up to date
- ⬜ .gitignore properly configured
- ⬜ No large files committed
- ⬜ Repository is clean

---

## ✅ Ready to Deploy?

If all items above are checked ✅, you're ready to deploy!

### Next Steps:

1. **Choose Your Guide:**

   - Quick (30 min): [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
   - Detailed (1-2 hours): [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

2. **Use the Checklist:**

   - [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

3. **Deploy!**
   - Follow the guide step by step
   - Use the checklist to track progress
   - Reference PRODUCTION-README.md as needed

---

## 🚨 Common Pre-Deployment Issues

### Issue: Missing .env.example files

**Fix:** Created in this deployment package

### Issue: No production branch

**Fix:** `git checkout -b production && git push origin production`

### Issue: Large node_modules committed

**Fix:** Already in .gitignore, run `git rm -r --cached node_modules/`

### Issue: Secrets in repository

**Fix:** Remove and use environment variables only

### Issue: Build fails locally

**Fix:** Check dependencies, environment variables

---

## 📞 Need Help?

**Before deploying, make sure:**

1. All items in this checklist are ✅
2. You have all required credentials
3. Local testing passed
4. You've read at least the QUICK-DEPLOY.md

**If stuck:**

1. Review the documentation
2. Check the troubleshooting sections
3. Verify all environment variables
4. Test locally first

---

**🎉 You're ready! Go deploy your app!**

**Start here:** [DEPLOY.md](./DEPLOY.md)
