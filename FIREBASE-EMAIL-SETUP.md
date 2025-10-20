# Firebase Email Configuration for Password Reset

## Issue: Forgot Password Not Working

If the forgot password feature is not sending emails, follow these steps to configure Firebase properly.

---

## ✅ Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Make sure **both toggles** are enabled:
   - ✅ Email/Password (enabled)
   - ✅ Email link (passwordless sign-in) - Optional but recommended

---

## ✅ Step 2: Configure Email Action URLs

Firebase needs to know where to redirect users after they click the password reset link.

### Option A: Using Firebase Console (Recommended)

1. Go to **Authentication** → **Templates**
2. Click on **Password reset**
3. Configure the following:

   - **From name**: `Property Purchase Manager` (or your app name)
   - **From email**: Use Firebase's default or configure a custom SMTP server
   - **Reply-to email**: Your support email
   - **Customize domain**: Add your production domain (e.g., `yourdomain.com`)

4. **Action URL Configuration**:

   - For development: `http://localhost:3000/login`
   - For production: `https://yourdomain.com/login`

5. Click **Save**

### Option B: Using Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add the following domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)

---

## ✅ Step 3: Customize Email Template (Optional)

1. Go to **Authentication** → **Templates** → **Password reset**
2. Click **Edit template**
3. Customize the email body:

```html
<p>Hello,</p>
<p>
  Follow this link to reset your password for your Property Purchase Manager
  account:
</p>
<p><a href="%LINK%">Reset Password</a></p>
<p>If you didn't request this, you can ignore this email.</p>
<p>Thanks,<br />Property Purchase Manager Team</p>
```

4. Click **Save**

---

## ✅ Step 4: Configure SMTP Server (For Custom Email)

If you want to use a custom email address (not Firebase's default):

1. Go to **Authentication** → **Templates** → **SMTP settings**
2. Choose one of the following:

### Option A: Using SendGrid

- **SMTP Host**: `smtp.sendgrid.net`
- **SMTP Port**: `587`
- **SMTP Username**: `apikey`
- **SMTP Password**: Your SendGrid API Key
- **Sender Email**: Your verified sender email
- **Sender Name**: `Property Purchase Manager`

### Option B: Using Gmail

- **SMTP Host**: `smtp.gmail.com`
- **SMTP Port**: `587`
- **SMTP Username**: Your Gmail address
- **SMTP Password**: Your Gmail App Password (not regular password!)
- **Sender Email**: Your Gmail address
- **Sender Name**: `Property Purchase Manager`

**⚠️ Gmail Note**: You must use an [App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password.

### Option C: Using Other SMTP Providers

- Mailgun, AWS SES, etc. - Configure according to their documentation

---

## ✅ Step 5: Test the Password Reset Flow

1. Go to your app: `http://localhost:3000/forgot-password`
2. Enter a registered email address
3. Click "Send Reset Link"
4. Check your email inbox (and spam folder!)
5. Click the reset link in the email
6. Should redirect to Firebase's password reset page
7. Enter new password and confirm
8. Should redirect to your login page

---

## 🔧 Troubleshooting

### Error: "auth/missing-continue-uri"

**Cause**: No action URL configured  
**Fix**: Configure action code settings in the code (already done) or add authorized domains

### Error: "auth/invalid-continue-uri"

**Cause**: The continue URL is malformed  
**Fix**: Ensure the URL includes protocol (http:// or https://)

### Error: "auth/unauthorized-continue-uri"

**Cause**: The domain is not authorized  
**Fix**: Add your domain to **Authentication** → **Settings** → **Authorized domains**

### Email Not Received

1. **Check Spam Folder** - Firebase emails often land in spam
2. **Verify Email Provider** - Check Firebase Console → Authentication → Templates
3. **Check User Exists** - The email must be registered in your app
4. **Check Firebase Logs** - Go to Firebase Console → Functions → Logs (if using custom email)
5. **Check Email Quotas** - Firebase has email sending limits on free tier

### Firebase Email Sending Limits

**Spark Plan (Free)**:

- 100 emails per day per project

**Blaze Plan (Pay-as-you-go)**:

- More generous limits, check Firebase documentation

---

## 🎯 Quick Test Checklist

- [ ] Email/Password authentication is enabled
- [ ] User with test email exists in Firebase Authentication
- [ ] Authorized domains include `localhost` and your production domain
- [ ] Email template is configured in Firebase Console
- [ ] SMTP settings are configured (if using custom email)
- [ ] Check browser console for errors
- [ ] Check email spam folder
- [ ] Test with different email providers (Gmail, Outlook, etc.)

---

## 🔐 Security Considerations

1. **Password Reset Link Expiration**: Firebase password reset links expire after 1 hour by default
2. **One-time Use**: Reset links can only be used once
3. **Email Verification**: Consider enabling email verification for new users
4. **Rate Limiting**: Firebase automatically rate-limits password reset requests

---

## 📝 Alternative: Manual Password Reset Page

If you want more control over the password reset flow, you can create a custom reset page:

### Create Reset Password Page

```typescript
// app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode"); // Firebase action code
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((emailAddress) => {
          setEmail(emailAddress);
        })
        .catch((error) => {
          console.error("Invalid reset code:", error);
        });
    }
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      alert("Password reset successful!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Password reset error:", error);
      alert("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Add your form UI here */}</form>;
}
```

### Update Firebase Action URL

Configure Firebase to redirect to your custom page:

- Action URL: `http://localhost:3000/reset-password`

---

## 📚 Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Password Reset Email Template](https://firebase.google.com/docs/auth/custom-email-handler)
- [SMTP Configuration](https://firebase.google.com/docs/auth/admin/email-enumeration-protection)
- [Firebase Email Sending Limits](https://firebase.google.com/docs/auth/limits)

---

## ✅ Final Verification

After completing all steps:

1. Clear your browser cache
2. Try the forgot password flow again
3. Check browser console for any errors
4. Check email inbox and spam folder
5. Verify the reset link works

If issues persist, check the browser console and Firebase Console logs for specific error messages.
