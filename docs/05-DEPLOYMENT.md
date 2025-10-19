# Deployment Guide

Complete guide for deploying the Housing Management Platform to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Firebase Configuration](#firebase-configuration)
5. [SendGrid Setup](#sendgrid-setup)
6. [Domain & SSL](#domain--ssl)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All TypeScript/Python type errors resolved
- [ ] ESLint/Pylint warnings addressed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] No hardcoded credentials or API keys
- [ ] Environment variables documented

### Performance

- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Database indexes created
- [ ] API response caching enabled

### Security

- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (N/A for Firestore)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Security headers configured

### Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment notes documented
- [ ] Environment variables listed
- [ ] Troubleshooting guide created

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/housing-management.git
git push -u origin main
```

2. **Create `.vercelignore`**

```
# frontend/.vercelignore
node_modules
.env.local
.next
.DS_Store
*.log
```

3. **Update `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Step 2: Deploy to Vercel

1. **Via Vercel Dashboard**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Configure build settings:
     - Framework Preset: **Next.js**
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

2. **Configure Environment Variables**

   Add these in Vercel Dashboard → Project Settings → Environment Variables:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

### Step 3: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records:
   - Type: **A** or **CNAME**
   - Name: **@** or **www**
   - Value: Provided by Vercel
4. Wait for DNS propagation (up to 48 hours)

### Step 4: Production Optimization

**next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["storage.googleapis.com", "firebasestorage.googleapis.com"],
  },
  // Enable compression
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Backend Deployment (Render)

### Step 1: Prepare Backend

1. **Create `render.yaml`**

```yaml
# backend/render.yaml
services:
  - type: web
    name: housing-management-api
    env: python
    region: oregon
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: APP_NAME
        value: Housing Management Platform
      - key: DEBUG
        value: false
      - key: SECRET_KEY
        generateValue: true
      - key: ALGORITHM
        value: HS256
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: 10080
```

2. **Update `requirements.txt`**

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
gunicorn==21.2.0
```

3. **Update `main.py`**

```python
# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Housing Management API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("DEBUG") == "True" else None,
    redoc_url="/redoc" if os.getenv("DEBUG") == "True" else None,
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

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Import and include routers
# from api import auth, funding, payments, analytics
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# ... other routers

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
```

### Step 2: Deploy to Render

1. **Create Account**

   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory
   - Configure:
     - Name: `housing-management-api`
     - Environment: **Python 3**
     - Region: Choose closest to users
     - Branch: **main**
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**

   In Render Dashboard → Environment:

   ```env
   APP_NAME=Housing Management Platform
   DEBUG=False
   SECRET_KEY=generate-a-secure-64-char-random-string
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=Housing Management Platform
   REMINDER_CRON_HOUR=6
   REMINDER_CRON_MINUTE=0
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Upload Firebase Credentials**

   Option 1: Use Render Secret Files

   - Go to Environment → Secret Files
   - Add file: `firebase-adminsdk.json`
   - Paste your Firebase service account JSON
   - Update env: `FIREBASE_CREDENTIALS_PATH=/etc/secrets/firebase-adminsdk.json`

   Option 2: Use Environment Variable

   - Convert JSON to base64: `cat firebase-adminsdk.json | base64`
   - Add env: `FIREBASE_CREDENTIALS_BASE64=<base64_string>`
   - Update code to decode and use

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Your API will be at `https://housing-management-api.onrender.com`

### Step 3: Configure Auto-Deploy

1. Enable Auto-Deploy from GitHub:

   - Go to Settings → Build & Deploy
   - Enable "Auto-Deploy"
   - Select branch: **main**

2. Add deploy hook for manual triggers (optional)

---

## Firebase Configuration

### Production Security Rules

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId) && isValidEmail(request.resource.data.email);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);

      match /fundingSources/{fundingId} {
        allow read, write: if isOwner(userId);
      }

      match /incomingPayments/{paymentId} {
        allow read, write: if isOwner(userId);
      }

      match /outgoingPayments/{expenseId} {
        allow read, write: if isOwner(userId);
      }

      match /settings/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

### Create Indexes

In Firebase Console → Firestore → Indexes:

1. **Funding Sources by Status**

   - Collection: `users/{userId}/fundingSources`
   - Fields: `status` (Ascending), `fundingDate` (Descending)

2. **Payments by Status and Date**

   - Collection: `users/{userId}/incomingPayments`
   - Fields: `status` (Ascending), `scheduleDate` (Ascending)

3. **Outgoing Payments by Type**
   - Collection: `users/{userId}/outgoingPayments`
   - Fields: `paymentType` (Ascending), `paymentDate` (Descending)

### Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable **Email/Password**
3. Add authorized domains:
   - `your-domain.com`
   - `your-frontend.vercel.app`

---

## SendGrid Setup

### Step 1: Create Account

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your email
3. Complete sender authentication

### Step 2: Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: `housing-management-production`
4. Permissions: **Full Access** (or custom for email only)
5. Copy the API key (save it securely)

### Step 3: Verify Sender Identity

Option 1: Single Sender Verification

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in details:
   - From Name: `Housing Management Platform`
   - From Email: `noreply@yourdomain.com`
4. Verify email

Option 2: Domain Authentication (Recommended)

1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Add DNS records provided by SendGrid
4. Wait for verification

### Step 4: Create Email Templates

1. Go to Email API → Dynamic Templates
2. Create template: "EMI Reminder"
3. Add template content:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>EMI Payment Reminder</title>
  </head>
  <body
    style="font-family: Arial, sans-serif; background-color: #0F172A; color: #ffffff; padding: 20px;"
  >
    <div
      style="max-width: 600px; margin: 0 auto; background-color: #1E293B; border-radius: 8px; padding: 30px;"
    >
      <h1 style="color: #3B82F6;">Payment Reminder</h1>
      <p>Hello {{username}},</p>
      <p>This is a reminder that your EMI payment is due soon:</p>

      <div
        style="background-color: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;"
      >
        <p><strong>Lender:</strong> {{lenderName}}</p>
        <p><strong>Amount:</strong> ₹{{amount}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Days Until Due:</strong> {{daysUntilDue}}</p>
      </div>

      <p>Please ensure sufficient funds are available in your account.</p>

      <a
        href="{{dashboardUrl}}"
        style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;"
      >
        View Dashboard
      </a>

      <p style="margin-top: 30px; font-size: 12px; color: #94A3B8;">
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  </body>
</html>
```

4. Save template and copy Template ID

### Step 5: Update Backend Configuration

Add to backend `.env`:

```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Housing Management Platform
SENDGRID_TEMPLATE_ID_EMI_REMINDER=d-xxxxxxxxxxxx
```

---

## Domain & SSL

### Configure Custom Domain

1. **Purchase Domain** (from Namecheap, GoDaddy, etc.)

2. **Configure DNS for Frontend (Vercel)**

   Add these records in your domain provider:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Configure DNS for Backend (Render)**

   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```

4. **SSL Certificates**
   - Both Vercel and Render provide automatic SSL
   - Certificates are auto-renewed
   - Force HTTPS in both platforms

---

## Monitoring & Logging

### Vercel Analytics

1. Enable in Vercel Dashboard:
   - Go to Analytics tab
   - Enable Web Analytics
   - View real-time metrics

### Render Logs

1. View logs in Render Dashboard:
   - Go to Logs tab
   - Filter by service
   - Set up log retention

### Application Monitoring

**Backend Logging (Python)**

```python
# backend/utils/logger.py
import logging
import sys

def setup_logger():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('app.log')
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logger()
```

**Frontend Error Tracking**

```typescript
// lib/utils/errorTracking.ts
export function logError(error: Error, context?: any) {
  console.error("Error:", error);
  console.error("Context:", context);

  // Send to error tracking service (e.g., Sentry)
  // Sentry.captureException(error, { contexts: { custom: context } })
}
```

### Set Up Alerts

1. **Render Alerts**

   - Go to Notifications
   - Enable email alerts for:
     - Deploy failures
     - Service crashes
     - High memory usage

2. **Uptime Monitoring** (Optional)
   - Use UptimeRobot or Pingdom
   - Monitor: `https://your-api.onrender.com/health`
   - Alert on downtime

---

## Backup & Recovery

### Firestore Backups

1. **Automated Backups**

   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login
   firebase login

   # Export data
   firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)
   ```

2. **Schedule Backups** (using Cloud Scheduler)
   - Go to Google Cloud Console
   - Create Cloud Scheduler job
   - Schedule: Daily at 2 AM
   - Target: Firestore export function

### Database Recovery

```bash
# Restore from backup
firebase firestore:import gs://your-bucket/backup-20240115
```

### Code Backups

- GitHub repository (primary backup)
- Enable branch protection
- Require pull request reviews
- Tag releases: `v1.0.0`, `v1.1.0`, etc.

---

## Post-Deployment Tasks

### 1. Test Production Environment

- [ ] User registration works
- [ ] Login/logout works
- [ ] All API endpoints respond correctly
- [ ] Email reminders are sent
- [ ] File uploads work
- [ ] Charts render correctly
- [ ] Mobile responsiveness verified

### 2. Performance Testing

```bash
# Use Lighthouse for frontend
npx lighthouse https://your-domain.com --view

# Use Apache Bench for backend
ab -n 1000 -c 10 https://your-api.onrender.com/health
```

### 3. Security Scan

- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] No exposed API keys
- [ ] CORS configured correctly
- [ ] Rate limiting active

### 4. Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Set up on-call rotation (if team)

---

## Rollback Procedure

### Frontend (Vercel)

1. Go to Deployments
2. Find last working deployment
3. Click "Promote to Production"

### Backend (Render)

1. Go to Deploy tab
2. Find last successful deploy
3. Click "Redeploy"

Or use Git:

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## Cost Optimization

### Free Tier Limits

**Vercel Free Tier:**

- 100 GB bandwidth/month
- Unlimited deployments
- 6,000 build minutes/month

**Render Free Tier:**

- 750 hours/month (enough for 1 service)
- 512 MB RAM
- Sleeps after 15 min inactivity

**Firebase Free Tier (Spark Plan):**

- 1 GB storage
- 10 GB/month data transfer
- 50K reads/day, 20K writes/day

### Upgrade When Needed

Monitor usage and upgrade plans when approaching limits.

---

**Next:** [Features Documentation](./06-FEATURES.md)
