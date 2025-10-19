# 📋 Production Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## 🔧 Pre-Deployment Setup

### 1. Firebase Setup

- [ ] Firebase project created
- [ ] Firestore database enabled (production mode)
- [ ] Firebase Authentication enabled
- [ ] Email/Password authentication provider enabled
- [ ] Firebase configuration copied (Web app config)
- [ ] Service Account JSON downloaded
- [ ] Firestore security rules configured
- [ ] Firestore indexes created (if needed)

### 2. Email Setup (Gmail)

- [ ] Gmail account ready
- [ ] 2-Step Verification enabled
- [ ] App Password generated (16 characters)
- [ ] App Password saved securely

### 3. GitHub Setup

- [ ] Production branch exists
- [ ] Production branch is up to date
- [ ] All changes committed
- [ ] .gitignore excludes .env files
- [ ] No secrets in repository

### 4. Platform Accounts

- [ ] Vercel account created
- [ ] Render account created (or alternative)
- [ ] GitHub connected to Vercel
- [ ] GitHub connected to Render

---

## 🚀 Backend Deployment (Render)

### Configuration

- [ ] Service name: `property-management-backend`
- [ ] Branch: `production`
- [ ] Root directory: `backend`
- [ ] Runtime: Python 3.11
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables

- [ ] `ENVIRONMENT=production`
- [ ] `PORT=10000`
- [ ] `JWT_SECRET_KEY` (32+ characters random string)
- [ ] `JWT_ALGORITHM=HS256`
- [ ] `JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30`
- [ ] `FIREBASE_ADMIN_SDK_JSON` (entire JSON as single line)
- [ ] `SMTP_SERVER=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USERNAME` (your Gmail)
- [ ] `SMTP_PASSWORD` (16-char App Password)
- [ ] `FROM_EMAIL` (your Gmail)
- [ ] `FROM_NAME=Property Purchase Management`
- [ ] `CORS_ORIGINS` (will update after frontend deployment)
- [ ] `DATABASE_TYPE=firestore`

### Deployment

- [ ] Deploy backend
- [ ] Wait for successful deployment (5-10 min)
- [ ] Copy backend URL: `https://__________.onrender.com`
- [ ] Test health endpoint: `/health`
- [ ] Test API docs: `/docs`

---

## 🎨 Frontend Deployment (Vercel)

### Configuration

- [ ] Framework: Next.js
- [ ] Branch: `production`
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build` (auto-detected)
- [ ] Output directory: `.next` (auto-detected)
- [ ] Install command: `npm install` (auto-detected)
- [ ] Node version: 18.x

### Environment Variables

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_API_URL` (backend URL from previous step)

### Deployment

- [ ] Deploy frontend
- [ ] Wait for successful deployment (2-5 min)
- [ ] Copy frontend URL: `https://__________.vercel.app`
- [ ] Test frontend loads
- [ ] Update backend `CORS_ORIGINS` with frontend URL
- [ ] Redeploy backend (auto or manual)

---

## 🔄 Post-Deployment Configuration

### Update CORS

- [ ] Go to Render backend environment variables
- [ ] Update `CORS_ORIGINS=https://your-app.vercel.app`
- [ ] Save and wait for auto-redeploy

### Test Integration

- [ ] Frontend loads successfully
- [ ] Register page works
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] Can add funding source
- [ ] Can add payment
- [ ] Can view analytics
- [ ] Email notifications work

---

## 🔒 Security Verification

### Environment Variables

- [ ] All `.env` files in `.gitignore`
- [ ] No secrets committed to GitHub
- [ ] JWT secret is random and secure
- [ ] Firebase Admin SDK JSON not in code
- [ ] Gmail App Password used (not regular password)

### Firebase Security

- [ ] Firestore security rules configured
- [ ] Authentication required for all operations
- [ ] Users can only access their own data
- [ ] No public write access

### CORS Configuration

- [ ] CORS origins match frontend URL exactly
- [ ] No wildcard `*` in production
- [ ] HTTPS only (no HTTP)

### Headers

- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy set
- [ ] HTTPS enforced

---

## 📊 Monitoring Setup

### Vercel

- [ ] Analytics enabled
- [ ] Deployment notifications configured
- [ ] Error tracking reviewed
- [ ] Performance metrics checked

### Render

- [ ] Logs accessible
- [ ] Metrics dashboard reviewed
- [ ] Alerting configured (optional)
- [ ] Health checks passing

### Firebase

- [ ] Usage dashboard reviewed
- [ ] Quotas checked
- [ ] Billing alerts set (if applicable)

---

## 🧪 Testing

### Manual Testing

- [ ] User registration
- [ ] User login
- [ ] Password reset flow
- [ ] Add property configuration
- [ ] Add funding source
- [ ] Record payment
- [ ] Add outgoing payment
- [ ] View analytics
- [ ] Generate reports
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Dark theme works

### API Testing

- [ ] `/health` endpoint responds
- [ ] `/docs` shows API documentation
- [ ] Authentication endpoints work
- [ ] Protected routes require auth
- [ ] CORS headers correct

---

## 🎯 Performance Optimization

### Frontend

- [ ] Build size optimized
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Lazy loading implemented
- [ ] Caching headers set

### Backend

- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] Connection pooling configured
- [ ] Rate limiting considered

---

## 📝 Documentation

### Update README

- [ ] Production URLs added
- [ ] Deployment instructions updated
- [ ] Environment variables documented
- [ ] API endpoints documented

### Create Documentation

- [ ] User guide created (optional)
- [ ] API documentation published
- [ ] Troubleshooting guide available

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

- [ ] Workflow file created (`.github/workflows/deploy.yml`)
- [ ] Secrets configured in GitHub
- [ ] Build tests pass
- [ ] Deployment automation works

---

## 🚨 Backup & Recovery

### Firestore Backups

- [ ] Backup strategy defined
- [ ] Export scheduled (manual or automated)
- [ ] Restoration tested

### Code Backups

- [ ] GitHub repository backed up
- [ ] Multiple branches maintained
- [ ] Tags for releases created

---

## 📈 Post-Launch

### Week 1

- [ ] Monitor error logs daily
- [ ] Check email delivery
- [ ] Review user feedback
- [ ] Test all features
- [ ] Monitor performance

### Month 1

- [ ] Review usage metrics
- [ ] Check database usage
- [ ] Analyze user behavior
- [ ] Plan improvements
- [ ] Update documentation

---

## ✅ Final Verification

### Production URLs

```
Frontend: https://__________.vercel.app
Backend:  https://__________.onrender.com
API Docs: https://__________.onrender.com/docs
```

### Credentials Secure

- [ ] All secrets stored in platform environments only
- [ ] No secrets in code repository
- [ ] Access restricted appropriately

### Features Working

- [ ] All core features functional
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Email sending works

### Ready to Launch

- [ ] All checklist items completed
- [ ] Testing successful
- [ ] Documentation complete
- [ ] Team notified

---

## 📞 Support Contacts

### Platform Support

- **Vercel**: https://vercel.com/support
- **Render**: https://render.com/docs/support
- **Firebase**: https://firebase.google.com/support

### Documentation

- **Deployment Guide**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **Quick Deploy**: [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
- **README**: [README.md](./README.md)

---

**✨ Deployment Complete!**

Date: ******\_\_\_******
Deployed by: ******\_\_\_******
Frontend URL: ******\_\_\_******
Backend URL: ******\_\_\_******
