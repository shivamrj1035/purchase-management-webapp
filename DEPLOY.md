# 🚀 MASTER DEPLOYMENT GUIDE

**Choose your deployment path:**

## 📖 Documentation Files

| File                                                     | Purpose                | Time      | Audience       |
| -------------------------------------------------------- | ---------------------- | --------- | -------------- |
| **[QUICK-DEPLOY.md](./QUICK-DEPLOY.md)**                 | Fast deployment guide  | 30 min    | Quick setup    |
| **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)**         | Comprehensive guide    | 1-2 hours | Detailed setup |
| **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** | Step-by-step checklist | -         | All users      |
| **[PRODUCTION-README.md](./PRODUCTION-README.md)**       | Production reference   | -         | Maintenance    |

---

## ⚡ Quick Deploy (30 Minutes)

**Best for:** First-time deployment, want to get up fast

**Follow:** [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)

**You'll deploy:**

- ✅ Frontend to Vercel
- ✅ Backend to Render
- ✅ Configure Firebase
- ✅ Setup email notifications

---

## 📚 Complete Guide (1-2 Hours)

**Best for:** Production deployment, want all details

**Follow:** [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

**Includes:**

- ✅ Complete setup instructions
- ✅ Security configuration
- ✅ CI/CD setup
- ✅ Monitoring and maintenance
- ✅ Troubleshooting guide

---

## ✅ Deployment Checklist

**Best for:** Making sure nothing is missed

**Follow:** [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

**Track:**

- ✅ Pre-deployment setup
- ✅ Environment variables
- ✅ Platform configuration
- ✅ Post-deployment testing
- ✅ Security verification

---

## 🔧 Production Maintenance

**Best for:** After deployment, ongoing maintenance

**Follow:** [PRODUCTION-README.md](./PRODUCTION-README.md)

**Reference for:**

- ✅ Environment variables
- ✅ Monitoring and logs
- ✅ Troubleshooting
- ✅ Scaling considerations
- ✅ Security best practices

---

## 🎯 Recommended Path

### First Time Deploying?

```
1. Read QUICK-DEPLOY.md (understand the process)
2. Use DEPLOYMENT-CHECKLIST.md (while deploying)
3. Keep PRODUCTION-README.md (for reference)
```

### Experienced with Deployments?

```
1. Use DEPLOYMENT-CHECKLIST.md (ensure completeness)
2. Reference DEPLOYMENT-GUIDE.md (if needed)
3. Keep PRODUCTION-README.md (for maintenance)
```

---

## 🚀 Automated Deployment

### Windows PowerShell

```powershell
.\scripts\deploy-production.ps1
```

### Linux/Mac Bash

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

**This script will:**

- ✅ Check your branch
- ✅ Verify environment files
- ✅ Test dependencies
- ✅ Build frontend
- ✅ Push to production
- ✅ Trigger auto-deployment

---

## 📊 Deployment Platforms

### Frontend: Vercel

- **URL:** https://vercel.com
- **Plan:** Free (Hobby)
- **Features:** Auto HTTPS, CDN, Analytics
- **Deploy Time:** 2-5 minutes

### Backend: Render

- **URL:** https://render.com
- **Plan:** Free (with sleep)
- **Features:** Auto HTTPS, Logs, Metrics
- **Deploy Time:** 5-10 minutes

### Database: Firebase Firestore

- **URL:** https://firebase.google.com
- **Plan:** Spark (Free)
- **Features:** Real-time, Scalable, Secure
- **Setup Time:** 5 minutes

### Email: Gmail SMTP

- **Requirements:** Gmail account, App Password
- **Limit:** 500 emails/day
- **Setup Time:** 3 minutes

---

## 🎯 Quick Reference

### Production Branch

```bash
git checkout production
git pull origin production
# make changes
git add .
git commit -m "Update"
git push origin production
# ✅ Auto-deploys to Vercel + Render
```

### Environment Variables

**Backend (13 variables):**

```
ENVIRONMENT, PORT, JWT_SECRET_KEY, JWT_ALGORITHM,
JWT_ACCESS_TOKEN_EXPIRE_MINUTES, FIREBASE_ADMIN_SDK_JSON,
SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
FROM_EMAIL, FROM_NAME, CORS_ORIGINS, DATABASE_TYPE
```

**Frontend (7 variables):**

```
NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID,
NEXT_PUBLIC_API_URL
```

### Health Checks

```bash
# Backend
https://your-backend.onrender.com/health

# API Docs
https://your-backend.onrender.com/docs

# Frontend
https://your-app.vercel.app
```

---

## 🆘 Need Help?

### Common Issues

1. **CORS Error** → Check `CORS_ORIGINS` matches frontend URL
2. **Build Failed** → Check logs in Vercel/Render
3. **Email Not Working** → Use Gmail App Password
4. **Firebase Error** → Verify all config variables
5. **Auth Issues** → Check JWT_SECRET_KEY is set

### Documentation

- Read the relevant guide above
- Check troubleshooting sections
- Review platform documentation

---

## ✅ Deployment Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at Vercel URL
- ✅ Backend health check responds
- ✅ Can register new user
- ✅ Can login successfully
- ✅ Can add property/funding/payment
- ✅ Email notifications work
- ✅ All features functional
- ✅ No console errors

---

## 🎉 Ready to Deploy?

**Choose your path and start deploying!**

1. **Quick Start:** [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
2. **Full Guide:** [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
3. **Checklist:** [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
4. **Reference:** [PRODUCTION-README.md](./PRODUCTION-README.md)

---

**Good luck with your deployment! 🚀**
