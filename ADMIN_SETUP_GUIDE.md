# 🔐 Admin Access Setup Guide

## Overview
This guide explains how to grant admin privileges to specific user accounts in your FUDORO application.

## Two Ways to Grant Admin Access

### Option 1: Manual Firestore Setup (Simple - Recommended)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your FUDORO project
   - Navigate to **Firestore Database**

2. **Create Users Collection** (if not exists)
   - Click "Start collection"
   - Collection ID: `users`
   - Click "Next"

3. **Add Admin User Document**
   - Document ID: Use the **User UID** from Authentication
   - Add fields:
     ```
     email: "munsh5518@gmail.com"  (string)
     isAdmin: true                  (boolean)
     role: "admin"                  (string)
     createdAt: (auto - timestamp)
     ```
   - Click "Save"

4. **How to Find User UID**
   - Go to **Authentication** → **Users**
   - Click on the user you want to make admin
   - Copy the **User UID** (looks like: AbC123XyZ456...)

### Option 2: Using Firebase Admin SDK (Advanced)

If you want to use custom claims and the scripts (grant-admin.js, revoke-admin.js):

1. **Download Service Account Key**
   - Firebase Console → Project Settings (⚙️)
   - Service Accounts tab
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

2. **Add to .gitignore** (IMPORTANT)
   ```
   serviceAccountKey.json
   ```

3. **Run Grant Admin Script**
   ```bash
   node grant-admin.js munsh5518@gmail.com
   ```

## How Admin Protection Works

1. **User Authentication**: User logs in with Firebase Auth
2. **Admin Check**: System checks if user has `isAdmin: true` in Firestore
3. **Access Control**: 
   - ✅ Admin users → See admin panel
   - ❌ Non-admin users → See "Access Denied" page

## Making Your First Admin

### Quick Steps (Manual Method):

1. Sign up/login to create your account
2. Go to Firebase Console → Authentication
3. Copy your User UID
4. Go to Firestore Database
5. Create collection `users` (if needed)
6. Add document with your UID:
   ```
   {
     email: "your@email.com",
     isAdmin: true,
     role: "admin"
   }
   ```
7. Refresh admin panel - you now have access! 🎉

## Granting Admin to Other Users

Repeat the manual setup process for each admin:
- Use their UID from Authentication
- Create a document in `users` collection
- Set `isAdmin: true`

## Revoking Admin Access

To remove admin privileges:
1. Go to Firestore → users collection
2. Find the user's document
3. Change `isAdmin: true` to `isAdmin: false`
4. User must log out and log back in

## Testing Admin Access

1. **As Admin**: Login → Should see admin dashboard
2. **As Non-Admin**: Login → Should see "Access Denied"
3. **Not Logged In**: Should see admin login page

## Current Admin Users

Keep track of who has admin access:
- [ ] munsh5518@gmail.com (your account)
- [ ] ___________ (marketing team)
- [ ] ___________ (operations team)

## Security Notes

⚠️ **Important**:
- Only give admin access to trusted team members
- Never share admin credentials
- Regularly review who has admin access
- Keep serviceAccountKey.json secret (never commit to git)

## Troubleshooting

**Problem**: "Access Denied" even after adding to Firestore
- **Solution**: Hard refresh the page (Ctrl+F5) or log out and log back in

**Problem**: Can't find my User UID
- **Solution**: Firebase Console → Authentication → Click on user email → UID is shown

**Problem**: Firestore document created but still no access
- **Solution**: Make sure:
  - Document ID = User UID (exact match)
  - Field name is `isAdmin` (case-sensitive)
  - Value is boolean `true` (not string "true")

## Need Help?

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify Firestore document structure
3. Confirm User UID matches document ID
4. Try logging out and logging back in
