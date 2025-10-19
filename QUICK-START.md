# Quick Start Guide

Get the Housing Management Platform up and running in under 30 minutes!

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Firebase account created
- [ ] SendGrid account created (optional for email features)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Clone and Setup Structure (2 minutes)

```bash
# Navigate to your projects folder
cd "d:\Personal Projects\Housing Management"

# The project structure is already created with documentation
# Let's create the actual code directories

# Create frontend
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Create backend structure
mkdir backend
cd backend
mkdir api models services utils middleware config tests templates scripts
```

---

### Step 2: Firebase Setup (5 minutes)

1. **Create Firebase Project**

   - Go to https://console.firebase.google.com/
   - Click "Add Project"
   - Name: `housing-management`
   - Click "Create Project"

2. **Enable Firestore**

   - Build → Firestore Database → "Create database"
   - Select "Start in test mode"
   - Choose your region
   - Click "Enable"

3. **Enable Authentication**

   - Build → Authentication → "Get started"
   - Enable "Email/Password"
   - Save

4. **Get Web Config**

   - Project Settings (gear icon) → General
   - Scroll to "Your apps" → Click Web icon (</>)
   - Register app: `housing-management-web`
   - Copy the config object (you'll need this later)

5. **Download Service Account Key**
   - Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `firebase-adminsdk.json` in backend folder

---

### Step 3: Frontend Setup (5 minutes)

```bash
cd frontend

# Install dependencies
npm install firebase zustand @tanstack/react-table recharts framer-motion date-fns react-hook-form zod @hookform/resolvers

# Initialize shadcn/ui
npx shadcn-ui@latest init
# Choose: Default style, Slate color, Yes to CSS variables

# Install shadcn components
npx shadcn-ui@latest add button card input label table dialog select dropdown-menu toast tabs badge avatar separator sheet form calendar
```

**Create `.env.local`:**

```bash
# Create environment file
touch .env.local  # On Windows: type nul > .env.local
```

Add this content (replace with your Firebase config):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Step 4: Backend Setup (5 minutes)

```bash
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Create requirements.txt
touch requirements.txt  # On Windows: type nul > requirements.txt
```

Add this to `requirements.txt`:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
firebase-admin==6.3.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
sendgrid==6.11.0
apscheduler==3.10.4
pydantic-email-validator==2.0.0
```

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env  # On Windows: type nul > .env
```

Add this to `.env`:

```env
APP_NAME=Housing Management Platform
DEBUG=True
SECRET_KEY=your-super-secret-key-min-32-chars-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

FIREBASE_CREDENTIALS_PATH=./firebase-adminsdk.json

SENDGRID_API_KEY=your_sendgrid_api_key_optional
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Housing Management Platform

REMINDER_CRON_HOUR=6
REMINDER_CRON_MINUTE=0

ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Generate a secure secret key:**

```bash
# In Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy the output and replace SECRET_KEY value
```

---

### Step 5: Create Minimal Working Files (10 minutes)

#### Backend: Create `main.py`

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Housing Management API",
    version="1.0.0",
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Housing Management API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

#### Frontend: Create Firebase config

```typescript
// frontend/lib/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Frontend: Update home page

```typescript
// frontend/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">
          Housing Management Platform
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          Track your home buying journey with ease
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-slate-700"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
```

---

## ✅ Run and Test

### Terminal 1: Start Backend

```bash
cd backend
venv\Scripts\activate  # On Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test it:** Open http://localhost:8000 in browser
You should see: `{"message": "Housing Management API", "status": "running"}`

**API Docs:** http://localhost:8000/docs

---

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

**Test it:** Open http://localhost:3000 in browser
You should see the landing page with Login/Register buttons.

---

## 🎯 Next Steps

Now that your basic setup is complete, follow these steps to build the full application:

### Phase 1: Authentication (Priority)

1. **Create auth pages** (Login, Register, Forgot Password)
2. **Implement Firebase authentication**
3. **Set up protected routes**
4. **Create auth store (Zustand)**

**Files to create:**

- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- `frontend/lib/store/authStore.ts`
- `backend/api/auth.py`
- `backend/services/auth_service.py`

### Phase 2: Dashboard Layout

1. **Create dashboard layout** with sidebar
2. **Build TopNav component**
3. **Implement mobile navigation**

**Files to create:**

- `frontend/app/(dashboard)/layout.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/layout/TopNav.tsx`

### Phase 3: Dashboard & Summary Cards

1. **Create dashboard page** with 3 summary cards
2. **Implement data fetching**
3. **Build recent activity section**

**Files to create:**

- `frontend/app/(dashboard)/page.tsx`
- `frontend/components/dashboard/SummaryCard.tsx`
- `backend/api/analytics.py`

### Phase 4: Funding Sources

1. **Create funding sources list page**
2. **Build add funding source modal**
3. **Implement detail page with amortization**

**Files to create:**

- `frontend/app/(dashboard)/funding-sources/page.tsx`
- `frontend/app/(dashboard)/funding-sources/[id]/page.tsx`
- `backend/api/funding.py`
- `backend/services/funding_service.py`

### Phase 5: Payments Management

1. **Create EMI payments tracking**
2. **Build outgoing payments pages**
3. **Implement payment marking functionality**

### Phase 6: Analytics & Reports

1. **Create analytics dashboard**
2. **Implement charts and visualizations**
3. **Build export functionality**

### Phase 7: Settings & Reminders

1. **Create settings page**
2. **Implement reminder configuration**
3. **Set up email service**
4. **Create cron job for reminders**

---

## 📚 Documentation Reference

As you develop each feature, refer to these documentation files:

- **Setup issues?** → `docs/01-SETUP-GUIDE.md`
- **Database questions?** → `docs/02-DATABASE-SCHEMA.md`
- **API reference?** → `docs/03-API-DOCUMENTATION.md`
- **Frontend components?** → `docs/04-FRONTEND-GUIDE.md`
- **Deployment?** → `docs/05-DEPLOYMENT.md`
- **Feature specifications?** → `docs/06-FEATURES.md`

---

## 🐛 Common Issues & Solutions

### Issue: Firebase connection error

**Solution:**

- Verify `.env.local` has correct Firebase config
- Check if Firestore is enabled in Firebase Console
- Restart dev server after changing env variables

### Issue: CORS error

**Solution:**

- Ensure backend `.env` has `ALLOWED_ORIGINS=http://localhost:3000`
- Check if backend is running
- Clear browser cache

### Issue: Module not found

**Solution:**

- Run `npm install` in frontend
- Run `pip install -r requirements.txt` in backend
- Check if virtual environment is activated

### Issue: Port already in use

**Solution:**

```bash
# Windows - Kill process on port 3000 or 8000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in npm run dev -- -p 3001
# Or change backend: uvicorn main:app --port 8001
```

---

## 🎨 Development Tips

1. **Use the documentation** - All features are fully documented
2. **Follow the structure** - Maintain the folder structure for consistency
3. **Component reusability** - Use shadcn/ui components as base
4. **Type safety** - Define TypeScript types for all data structures
5. **Error handling** - Always handle errors gracefully
6. **Mobile first** - Test on mobile viewport regularly
7. **Git commits** - Commit frequently with clear messages

---

## 🚢 When Ready to Deploy

Follow `docs/05-DEPLOYMENT.md` for complete deployment instructions to:

- **Frontend:** Vercel (free tier)
- **Backend:** Render (free tier)
- **Database:** Firebase (free tier)

---

## 💡 Pro Tips

1. **Hot Reload:** Both frontend and backend support hot reload - changes reflect immediately
2. **API Documentation:** Backend automatically generates API docs at `/docs`
3. **Type Safety:** Use TypeScript strictly - it prevents runtime errors
4. **Firestore Rules:** Update security rules before production
5. **Environment Variables:** Never commit `.env` or `.env.local` files

---

## 📞 Need Help?

- Review the detailed documentation in `docs/` folder
- Check `PROJECT-STRUCTURE.md` for file organization
- Look at `README.md` for project overview

---

**You're all set! Happy coding! 🎉**

Start with Phase 1 (Authentication) and work your way through each phase. The detailed documentation will guide you through each feature implementation.
