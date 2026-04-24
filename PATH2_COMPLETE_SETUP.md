# 🚀 Path 2: Production Setup Guide (MongoDB + Firebase + Vercel)

## Overview
This setup enables:
- ✅ **Auto-save** writings, games, models to MongoDB
- ✅ **File uploads** stored in Firebase Cloud Storage
- ✅ **Zero manual copying** - forms auto-save instantly
- ✅ **Scalable** - ready for production

---

## 📋 Pre-requisites

Before starting, you need:
- GitHub account (for Vercel deployment)
- Credit card (for Firebase, but free tier covers your needs)
- 30 minutes of setup time

---

## Step 1: Setup MongoDB Atlas (Free Tier)

### 1.1 Create MongoDB Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Sign Up"** → Create account with email
3. Verify email

### 1.2 Create Database Cluster
1. Click **"Create a Deployment"**
2. Choose **"FREE"** tier
3. Cloud Provider: **AWS**
4. Region: Choose closest to you
5. Cluster Name: `gameserver`
6. Click **"Create"** (takes 2-3 minutes)

### 1.3 Create Database User
1. Go to **"Security"** → **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `gameserver_admin`
4. Password: Create strong password (save it!)
5. Database Permissions: **"Atlas Administrator"**
6. Click **"Add User"**

### 1.4 Get Connection String
1. Go to **"Database"** → **"Connect"**
2. Click **"Drivers"**
3. Choose **Node.js** version **4.0 or later**
4. Copy connection string (looks like):
   ```
   mongodb+srv://gameserver_admin:PASSWORD@cluster0.mongodb.net/gameserver?retryWrites=true&w=majority
   ```
5. Replace `PASSWORD` with your password from Step 1.3
6. Replace `gameserver` at the end with your database name
7. **Save this for later!**

---

## Step 2: Setup Firebase (Free Tier)

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Project name: `gameserver`
4. Click **"Continue"**
5. Analytics: Can disable (not needed)
6. Click **"Create project"** (takes 1-2 minutes)

### 2.2 Enable Cloud Storage
1. In Firebase console, go to **"Storage"**
2. Click **"Get Started"**
3. Security rules: Choose **"Start in test mode"** (easier for development)
4. Location: Choose closest region
5. Click **"Done"**

### 2.3 Create Service Account Key
1. Go to **"Settings"** (gear icon) → **"Project Settings"**
2. Go to **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. A JSON file downloads - **SAVE THIS SAFELY** (contains credentials)
5. Open JSON file and copy these values:

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "KEY_ID",
  "private_key": "LONG_KEY_STRING",
  "client_email": "firebase-adminsdk@...",
  "client_id": "CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```

---

## Step 3: Setup Local Backend Server

### 3.1 Install Backend
```bash
cd GameServer/backend
npm install
```

### 3.2 Create .env File
In `GameServer/backend/`, create `.env`:

```env
# MongoDB Connection (from Step 1.4)
MONGODB_URI=mongodb+srv://gameserver_admin:YOUR_PASSWORD@cluster0.mongodb.net/gameserver?retryWrites=true&w=majority

# Firebase (from Step 2.3)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_LONG_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/certificates/...

# Frontend URLs
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

**⚠️ IMPORTANT NOTES:**
- Private key contains newlines - when copying from JSON, replace actual newlines with `\n`
- Never commit `.env` to GitHub
- Different `.env` files needed for development vs. production

### 3.3 Test Backend Locally
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 3001
```

### 3.4 Test API Endpoint
Open terminal and test:
```bash
curl -X GET http://localhost:3001/api/health
```

Should return: `{"status":"OK","timestamp":"2025-04-20T..."}`

---

## Step 4: Setup Frontend to Call API

The frontend files are already updated! Just update the API URL:

### 4.1 Update API URL in Admin Panel
In `src/pages/admin.js`, find this line:
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://your-backend-url.vercel.app'
```

For local testing, keep as is. ✅

### 4.2 Update API URL in Writings Page
Same location in `src/pages/writings.js`. ✅

### 4.3 Test Forms
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev` (in root folder)
3. Go to http://localhost:5173
4. Navigate to Admin Panel
5. Write a post and submit
6. Should see: **"✅ Post saved automatically!"**

---

## Step 5: Deploy Backend to Vercel

### 5.1 Prepare for Deployment
1. Go to `GameServer/backend/` folder
2. Create `vercel.json` - **already done!** ✅

### 5.2 Push to GitHub
```bash
cd GameServer
git init
git add .
git commit -m "Add backend API with MongoDB and Firebase"
git push origin main
```

If git remote not set:
```bash
git remote add origin https://github.com/YOUR_USERNAME/gameserver.git
git branch -M main
git push -u origin main
```

### 5.3 Deploy Backend to Vercel
```bash
npm install -g vercel
cd backend
vercel
```

Follow prompts:
- Link to GitHub repo? **Yes**
- Use existing project? **No** (unless you have Vercel project)
- Project name: `gameserver-backend`
- Framework: **Other**

### 5.4 Add Environment Variables to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your **`gameserver-backend`** project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from your local `.env`:
   - `MONGODB_URI`
   - `FIREBASE_TYPE`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - etc.

### 5.5 Deploy
```bash
vercel --prod
```

You'll get a URL like: `https://gameserver-backend-xyz.vercel.app`

---

## Step 6: Update Frontend URLs for Production

### 6.1 Update API URLs
In `src/pages/admin.js` and `src/pages/writings.js`:

```javascript
// OLD:
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://your-backend-url.vercel.app'

// NEW: Update with your Vercel URL
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://gameserver-backend-xyz.vercel.app'  // Your actual Vercel URL
```

### 6.2 Deploy Frontend
If using Vercel for frontend:
```bash
vercel --prod
```

---

## 🧪 Testing the Complete System

### Test 1: Local Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Browser: http://localhost:5173 → Admin Panel → Write Post → Submit
```

Expected: "✅ Post saved automatically!"

### Test 2: Production (Both Deployed)
1. Go to your frontend URL (e.g., `https://gameserver.vercel.app`)
2. Admin Panel → Write Post → Submit
3. Check MongoDB Atlas:
   - **Database** → **gameserver** → **Collections** → **writings**
   - Your post should appear!

### Test 3: Upload 3D Model
1. Admin Panel → Upload Model tab
2. Select a `.glb` file from your computer
3. Fill in details
4. Submit
5. Check MongoDB and Firebase Storage

---

## 📊 Monitoring & Debugging

### Check MongoDB Data
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Database** → **Browse Collections**
3. See all your posts, models, games stored

### Check Firebase Files
1. Go to [Firebase Console](https://console.firebase.google.com)
2. **Storage** tab
3. See all uploaded model files organized in folders

### Check Backend Logs
```bash
vercel logs gameserver-backend
```

Shows all API requests and errors

---

## 🔒 Security Best Practices

✅ **DO:**
- Store `.env` in `.gitignore` (never commit)
- Use strong database passwords
- Regularly rotate Firebase keys
- Use HTTPS in production (Vercel handles this)
- Validate all inputs on backend

❌ **DON'T:**
- Commit `.env` to GitHub
- Share Firebase credentials
- Use admin rights for normal operations
- Store passwords in code
- Allow public deletes without authentication

---

## 🐛 Troubleshooting

### Issue: "MongoDB connection error"
**Solution:**
- Check connection string in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
  - Go to **Security** → **Network Access**
  - Add your IP or **0.0.0.0/0** (allows all IPs - not recommended for production)
- Verify username/password

### Issue: "Firebase auth error"
**Solution:**
- Check all Firebase env variables are correct
- Verify `private_key` has correct `\n` characters
- Test with `curl -X GET http://localhost:3001/api/health`

### Issue: "File upload fails"
**Solution:**
- Check Firebase Storage bucket exists and is writable
- File size under 100MB
- Ensure Firebase credentials in `.env` are correct

### Issue: "CORS error when calling API"
**Solution:**
- Update `FRONTEND_URL` in backend `.env`
- Ensure frontend is calling correct API URL
- Check `Origin` header matches allowed origins

---

## 📈 Next Steps

### After Setup Works:
1. **Add Authentication** - Only you can upload/edit
2. **Add Caching** - Faster loading
3. **Add Analytics** - Track visitors
4. **Setup Domain** - Custom domain instead of `.vercel.app`
5. **Database Backups** - Automatic backups

### Growth Considerations:
- Current setup scales to ~500 posts/year
- Free Firebase storage: 1GB
- Free MongoDB: 512MB storage
- Upgrade when needed (minimal cost)

---

## 🎉 You're Done!

Your system now has:
- ✅ Automatic content saving
- ✅ File uploads to cloud storage
- ✅ Scalable backend
- ✅ Global CDN deployment
- ✅ Production-ready architecture

**No more copy/paste!** Your forms now auto-save to the cloud. 🚀
