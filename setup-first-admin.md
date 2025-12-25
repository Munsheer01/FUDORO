# 🚀 Quick Setup: Create Your First Admin

## Step-by-Step (5 minutes)

### 1️⃣ Login to Your Account
- Go to: http://localhost:3000/admin
- Sign in with your email: **munsh5518@gmail.com** or **mu4n@gmail.com**

### 2️⃣ Get Your User UID
- Open Firebase Console: https://console.firebase.google.com
- Select **FUDORO project**
- Click **Authentication** (left menu)
- Click on **Users** tab
- Find your email in the list
- Click on it
- **Copy the User UID** (it looks like: `AbC123XyZ456defGHI789...`)

### 3️⃣ Create Users Collection in Firestore
- In Firebase Console, click **Firestore Database** (left menu)
- Click **"+ Start collection"** (if you don't have a `users` collection yet)
- Enter Collection ID: **users**
- Click **Next**

### 4️⃣ Add Your Admin Document
- **Document ID**: Paste your **User UID** from step 2
- Click **"Add field"** and add these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | your@email.com |
| `isAdmin` | boolean | **true** |
| `role` | string | admin |
| `createdAt` | timestamp | (click auto-timestamp) |

- Click **Save**

### 5️⃣ Test Admin Access
- Go back to: http://localhost:3000/admin
- **Hard refresh** the page (Ctrl+F5) or **log out and log back in**
- You should now see the admin dashboard! 🎉

## Example Screenshot of Firestore Document:

```
Collection: users
└── Document: AbC123XyZ456defGHI789... (your UID)
    ├── email: "munsh5518@gmail.com"
    ├── isAdmin: true
    ├── role: "admin"
    └── createdAt: January 20, 2025 at 10:30:00 AM UTC+5:30
```

## ⚠️ Important Notes:

- The **Document ID MUST be your User UID** (exact match)
- `isAdmin` must be **boolean true** (not string "true")
- You need to **refresh or re-login** to see changes

## 🎯 Next Steps:

After you have admin access:
1. Add other team members as admins (repeat steps 2-5 with their UIDs)
2. Start managing orders from the admin panel
3. Update payment statuses for bulk orders

## Need Help?

If it doesn't work:
- Check browser console (F12) for errors
- Verify the Document ID exactly matches your User UID
- Make sure `isAdmin` is a boolean, not a string
- Try incognito mode or different browser
