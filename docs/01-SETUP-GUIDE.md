# Setup Guide - Home Buying & Finance Management Platform

This guide will walk you through setting up the complete development environment for both frontend and backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clerk & Google Sheets Setup](#clerk--google-sheets-setup)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **Python**: Version 3.9 or higher ([Download](https://python.org/))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Required Accounts

- **Clerk**: Create account at [clerk.com](https://clerk.com/) (for authentication)
- **Google Cloud**: Create account at [console.cloud.google.com](https://console.cloud.google.com/) (for Google Sheets API)
- **SendGrid**: Create account at [sendgrid.com](https://sendgrid.com/) (for email functionality)
- **Vercel**: Optional, for deployment ([vercel.com](https://vercel.com/))

### Verify Installations

```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check npm version
npm --version

# Check Python version
python --version  # Should be 3.9 or higher

# Check pip version
pip --version
```

---

## Clerk & Google Sheets Setup

### 1. Clerk Authentication
1. Go to Clerk dashboard
2. Create an application
3. Copy API keys

### 2. Google Sheets API
1. Go to Google Cloud Console
2. Enable Google Sheets API
3. Create Service Account and download JSON key
4. Share your target spreadsheet with the service account email

---

## Frontend Setup

### 1. Initialize Next.js Project

```bash
# Navigate to project root
cd "d:\Personal Projects\Housing Management"

# Create frontend directory and initialize Next.js
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

When prompted, choose:

- ✔ Would you like to use TypeScript? **Yes**
- ✔ Would you like to use ESLint? **Yes**
- ✔ Would you like to use Tailwind CSS? **Yes**
- ✔ Would you like to use `src/` directory? **No**
- ✔ Would you like to use App Router? **Yes**
- ✔ Would you like to customize the default import alias? **No**

### 2. Install Frontend Dependencies

```bash
cd frontend

# Core dependencies
npm install @clerk/nextjs googleapis
npm install zustand
npm install @tanstack/react-table
npm install recharts
npm install framer-motion
npm install date-fns
npm install react-hook-form
npm install zod
npm install @hookform/resolvers

# shadcn/ui setup
npx shadcn-ui@latest init
```

When initializing shadcn/ui, choose:

- ✔ Which style would you like to use? **Default**
- ✔ Which color would you like to use as base color? **Slate**
- ✔ Would you like to use CSS variables for colors? **Yes**

### 3. Install shadcn/ui Components

```bash
# Install commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
```

### 4. Create Frontend Environment File

```bash
# Create .env.local file
touch .env.local  # On Windows: type nul > .env.local
```

Add the following content (replace with your Clerk & Google Sheets config):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Sheets Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
"
GOOGLE_MASTER_SPREADSHEET_ID=your_spreadsheet_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Backend Setup

### 1. Create Backend Directory Structure

```bash
# From project root
mkdir backend
cd backend

# Create directory structure
mkdir api models services utils
touch main.py requirements.txt .env
```

### 2. Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Create requirements.txt

Create `backend/requirements.txt`:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.27.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
sendgrid==6.11.0
apscheduler==3.10.4
pydantic-email-validator==2.0.0
```

### 4. Install Backend Dependencies

```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

### 5. Create Backend Environment File

Create `backend/.env`:

```env
# Application Settings
APP_NAME=Housing Management Platform
DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Clerk Configuration
CLERK_JWKS_URL=https://clerk.your-domain.com/.well-known/jwks.json
CLERK_ISSUER=https://clerk.your-domain.com
CLERK_AUDIENCE=your-client-id

# Email Configuration (Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Housing Management Platform
```

### 6. Add Google Service Account Key

1. Copy the `service-account-key.json` file you downloaded earlier
2. Place it in the `backend/` directory
3. **Add to .gitignore** (very important!)

Create `backend/.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Environment variables
.env
.env.local

# Firebase credentials
service-account-key.json
*.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/

# Logs
*.log
```

---

## Environment Variables

### Frontend (.env.local)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
# App
APP_NAME=Housing Management Platform
DEBUG=True
SECRET_KEY=generate-a-secure-random-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Firebase
FIREBASE_CREDENTIALS_PATH=./service-account-key.json

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=Housing Management Platform

# Email Reminders
REMINDER_CRON_HOUR=6
REMINDER_CRON_MINUTE=0

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Running the Application

### Start Backend Server

```bash
# Navigate to backend folder
cd backend

# Activate virtual environment (if not already active)
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
# Open new terminal
# Navigate to frontend folder
cd frontend

# Run development server
npm run dev
```

Application will be available at: `http://localhost:3000`

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**

```bash
# Backend (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Frontend (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**2. Firebase Connection Issues**

- Verify Firebase config values are correct
- Check if Firestore is enabled
- Ensure authentication is enabled
- Check network/firewall settings

**3. Python Virtual Environment Issues**

```bash
# Delete and recreate venv
rm -rf venv  # or rmdir /s venv on Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**4. Node Modules Issues**

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**5. CORS Errors**

- Ensure backend `.env` has correct `ALLOWED_ORIGINS`
- Check if frontend is using correct `NEXT_PUBLIC_API_URL`
- Restart both servers after changing environment variables

---

## Next Steps

After successful setup:

1. Review [Database Schema](./02-DATABASE-SCHEMA.md)
2. Check [API Documentation](./03-API-DOCUMENTATION.md)
3. Explore [Frontend Guide](./04-FRONTEND-GUIDE.md)
4. Start developing features!

---

## Development Tools (Optional but Recommended)

### VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Python
- Pylance
- GitLens

### Browser Extensions

- React Developer Tools
- Redux DevTools (for Zustand)
- Firebase Tools

---

**Setup complete! 🎉 You're ready to start development.**
