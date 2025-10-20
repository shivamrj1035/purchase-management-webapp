# 📧 Email Service Setup Guide - Production Fix

## ✅ Issue Fixed

**Problem:** Email notifications failing in production (Render) with error:

```
Error sending notification: Unexpected error sending email: [Errno 101] Network is unreachable
```

**Root Cause:** Render's free tier blocks outbound SMTP connections (ports 587/465) for security reasons. Gmail SMTP cannot connect.

**Solution:** Implemented SendGrid API as the primary email service with Gmail SMTP as fallback for local development.

---

## 🚀 Quick Setup (Production - SendGrid)

### **Step 1: Create SendGrid Account**

1. Go to https://sendgrid.com/
2. Click "Start Free" (100 emails/day free forever)
3. Sign up with your email
4. Verify your email address

### **Step 2: Create API Key**

1. Log in to SendGrid Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `Property-Management-Production`
5. Select **Full Access** (or **Restricted Access** with Mail Send permission)
6. Click **Create & View**
7. **Copy the API key immediately** (you won't see it again!)

### **Step 3: Verify Sender Email**

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: `Property Purchase Management`
   - From Email Address: Your email (e.g., `noreply@yourdomain.com` or `your-email@gmail.com`)
   - Reply To: Same email or support email
   - Company Address: Your address
4. Click **Create**
5. **Check your email** and click the verification link
6. Wait for verification (usually instant)

### **Step 4: Configure Render Environment Variables**

Go to your Render backend service dashboard:

1. Click on your service → **Environment**
2. Add these variables:

```bash
# SendGrid Configuration (REQUIRED for production)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=your-verified-email@example.com
FROM_NAME=Property Purchase Management

# Remove or comment out Gmail variables (not needed if using SendGrid)
# GMAIL_EMAIL=
# GMAIL_APP_PASSWORD=
```

3. Click **Save Changes**
4. Your service will automatically redeploy

### **Step 5: Test Email**

1. Go to your app: `/dashboard/notifications`
2. Click **Settings** tab
3. Configure your primary email
4. Click **Send Test Email**
5. Check your inbox! ✅

---

## 🔧 Implementation Details

### **What Changed:**

The `email_service.py` now supports two methods:

1. **SendGrid API** (Primary - Production)

   - Works on all hosting platforms
   - No SMTP port blocking issues
   - More reliable delivery
   - Better deliverability rates
   - 100 emails/day free tier

2. **Gmail SMTP** (Fallback - Local Development)
   - Only works locally or on paid hosting
   - Blocked on Render free tier
   - Good for development testing

### **Automatic Selection:**

The service automatically chooses the best method:

```python
if SENDGRID_API_KEY exists and sendgrid is installed:
    → Use SendGrid API ✅
else if GMAIL_EMAIL and GMAIL_APP_PASSWORD exist:
    → Use Gmail SMTP (may fail on Render free tier)
else:
    → Raise error
```

---

## 📋 Environment Variables Reference

### **Production (Render) - Use SendGrid:**

```bash
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Property Purchase Management
```

### **Local Development - Option 1 (SendGrid):**

```bash
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Property Purchase Management
```

### **Local Development - Option 2 (Gmail SMTP):**

```bash
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
FROM_NAME=Property Purchase Management
```

---

## 🧪 Testing Checklist

### **Local Testing:**

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Configure environment variables in `backend/.env`
- [ ] Start backend: `python main.py`
- [ ] Send test email from notifications page
- [ ] Check console logs for service used (SendGrid/Gmail)
- [ ] Verify email received

### **Production Testing:**

- [ ] Add SendGrid API key to Render
- [ ] Verify sender email in SendGrid
- [ ] Wait for Render redeploy
- [ ] Check Render logs for "SendGrid configured"
- [ ] Send test email from production app
- [ ] Verify email received
- [ ] Check SendGrid dashboard for activity

---

## 🚨 Troubleshooting

### **Error: "SendGrid API key is invalid"**

**Solution:**

- Verify API key is copied correctly (starts with `SG.`)
- Check API key has Mail Send permission
- Regenerate API key if needed

### **Error: "Sender email not verified"**

**Solution:**

1. Go to SendGrid → Settings → Sender Authentication
2. Verify your sender email
3. Check verification email in your inbox
4. Click verification link
5. Use verified email as `FROM_EMAIL`

### **Error: "Network is unreachable" (still happening)**

**Solution:**

- SendGrid is not configured correctly
- Check `SENDGRID_API_KEY` is set in Render
- Verify backend is using SendGrid (check logs)
- Ensure `sendgrid` is in requirements.txt

### **Emails not being received:**

**Check:**

1. Spam/Junk folder
2. SendGrid Activity dashboard (shows all sent emails)
3. Sender email is verified in SendGrid
4. FROM_EMAIL matches verified sender

### **Want to use Gmail instead:**

**Note:** Gmail SMTP **will not work** on Render free tier due to port blocking.

**Options:**

1. Use SendGrid (recommended)
2. Upgrade Render to paid plan
3. Use different hosting (Heroku, Railway, etc.)

---

## 📊 SendGrid Free Tier Limits

- **100 emails/day** - Free forever
- **No credit card required**
- Perfect for this application (notifications are infrequent)
- Upgrade available if you need more

### **Usage Estimation:**

Assuming 10 users with 5 EMI payments each:

- Manual reminders: ~50 emails/month
- Auto-reminders: ~150 emails/month
- Well within free tier! ✅

---

## 🔐 Security Best Practices

### **API Keys:**

- ✅ Never commit API keys to git
- ✅ Use environment variables
- ✅ Rotate keys periodically
- ✅ Use restricted access (Mail Send only)
- ✅ Keep backup of keys in secure location

### **Sender Verification:**

- ✅ Verify all sender emails
- ✅ Use domain authentication for better deliverability
- ✅ Set up SPF, DKIM records (optional but recommended)

---

## 📝 Migration from Gmail to SendGrid

If you were using Gmail before:

### **Backend Changes:**

1. Add `SENDGRID_API_KEY` to environment
2. Add `FROM_EMAIL` (your verified SendGrid email)
3. Keep `FROM_NAME` (optional, defaults to "Housing Management System")
4. Remove `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` (no longer needed)

### **No Code Changes Required:**

The email service automatically switches to SendGrid when API key is detected.

### **Verify Migration:**

Check backend logs on startup:

- Before: `⚠️ Using Gmail SMTP...`
- After: `✅ SendGrid configured - Using SendGrid API for email delivery`

---

## 🎉 Success Criteria

After setup, you should see:

### **In Render Logs:**

```
✅ SendGrid configured - Using SendGrid API for email delivery
📧 Sender: your-email@example.com
```

### **When Sending Email:**

```
📧 Sending email via SendGrid to recipient@example.com...
✅ Email sent successfully via SendGrid (Status: 202)
```

### **In Your Inbox:**

- Email from your verified sender
- Professional HTML formatting
- All EMI details displayed
- CC recipients receive copy

---

## 🆘 Support

### **SendGrid Issues:**

- Documentation: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
- Status: https://status.sendgrid.com/

### **Application Issues:**

Check:

1. Render logs for error messages
2. SendGrid Activity dashboard
3. Environment variables are set correctly
4. Sender email is verified

---

## 🔄 Rollback Plan

If SendGrid doesn't work (unlikely):

1. Remove `SENDGRID_API_KEY` from Render
2. Add Gmail credentials (only works on paid hosting)
3. Or upgrade to Render paid plan
4. Redeploy backend

---

**✅ Email service is now production-ready with SendGrid!**

No more "Network unreachable" errors! 🎉
