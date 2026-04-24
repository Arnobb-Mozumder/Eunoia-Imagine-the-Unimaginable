# Backend Setup Guide - Auto-Save Content + File Uploads

## 🎯 Architecture Overview

```
Frontend (Vite)
    ↓ (form submit)
    ↓
Express API (Vercel Serverless)
    ├→ MongoDB (metadata storage)
    ├→ Firebase Storage (file uploads)
    └→ Updates content.js
```

## Option 1: MongoDB + Firebase (Recommended for Vercel)

### Step 1: Create Node.js/Express Backend

```bash
mkdir GameServer-Backend
cd GameServer-Backend
npm init -y
npm install express cors dotenv mongoose firebase-admin multer
```

### Step 2: Project Structure

```
GameServer-Backend/
├── api/
│   ├── writings.js
│   ├── models.js
│   └── games.js
├── middleware/
│   └── upload.js
├── config/
│   └── firebase.js
├── .env
└── vercel.json
```

### Step 3: Environment Variables (.env)

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gameserver
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key
FIREBASE_CLIENT_EMAIL=your-firebase-email
VERCEL_FRONTEND_URL=https://your-site.com
```

### Step 4: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "GameServer"
3. Enable Storage (create storage bucket)
4. Create Service Account:
   - Settings → Service Accounts
   - Generate new private key
   - Copy credentials to .env

### Step 5: Express API Server

**api/index.js**
```javascript
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

app.use(cors({ origin: process.env.VERCEL_FRONTEND_URL }))
app.use(express.json({ limit: '50mb' }))

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)

// Routes
app.post('/api/writings', require('./writings'))
app.post('/api/models', require('./models'))
app.post('/api/games', require('./games'))

app.get('/api/content', async (req, res) => {
  // Return all content from MongoDB
})

module.exports = app
```

**api/writings.js**
```javascript
const Writing = require('../models/Writing')

module.exports = async (req, res) => {
  try {
    const { title, category, excerpt, content, mood, readTime } = req.body

    const writing = new Writing({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      category,
      title,
      excerpt,
      content,
      mood: mood || '🌙',
      readTime: readTime || '4 min read',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    })

    await writing.save()

    res.json({ 
      success: true, 
      message: 'Writing saved!',
      id: writing.id 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
```

**api/models.js**
```javascript
const admin = require('firebase-admin')
const Model = require('../models/Model')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

module.exports = upload.single('file'), async (req, res) => {
  try {
    const { title, description, thumbnail, software, polygons, year, tags } = req.body
    const file = req.file

    let fileUrl = thumbnail

    if (file) {
      const bucket = admin.storage().bucket()
      const fileName = `models/${title.toLowerCase().replace(/\s+/g, '-')}/${file.originalname}`
      
      await bucket.file(fileName).save(file.buffer, {
        metadata: { contentType: file.mimetype }
      })

      const [url] = await bucket.file(fileName).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365 // 1 year
      })

      fileUrl = url
    }

    const model = new Model({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      description,
      file: fileUrl,
      thumbnail,
      tags: tags?.split(',').map(t => t.trim()) || [],
      software,
      year,
      polygons
    })

    await model.save()

    res.json({ success: true, message: 'Model uploaded!', id: model.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
```

### Step 6: Update Frontend Forms

**src/pages/writings.js - Replace form submit handler**
```javascript
quickWriteForm.addEventListener('submit', async e => {
  e.preventDefault()
  
  const formData = {
    title: document.getElementById('quick-title').value,
    category: document.getElementById('quick-category').value,
    excerpt: document.getElementById('quick-excerpt').value,
    content: document.getElementById('quick-content').value,
    mood: document.getElementById('quick-mood').value || '🌙',
    readTime: document.getElementById('quick-readtime').value || '4 min read'
  }

  try {
    const response = await fetch('https://your-api.vercel.app/api/writings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()
    
    if (data.success) {
      document.getElementById('quick-status').textContent = '✅ Writing saved automatically!'
      document.getElementById('quick-write-form').reset()
    }
  } catch (err) {
    document.getElementById('quick-status').textContent = '❌ Error: ' + err.message
  }
})
```

### Step 7: Deploy to Vercel

1. Create `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

2. Deploy:
```bash
npm install -g vercel
vercel
```

---

## Option 2: Simple Local Backend (Development Only)

If you want to **start locally** before deploying:

```bash
npm install express cors multer
```

**server.js**
```javascript
const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.static('public'))

// Setup uploads folder
const uploadsDir = path.join(__dirname, 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({ dest: uploadsDir })

// Auto-save writings
app.post('/api/writings', (req, res) => {
  const writing = {
    id: req.body.title.toLowerCase().replace(/\s+/g, '-'),
    category: req.body.category,
    title: req.body.title,
    excerpt: req.body.excerpt,
    content: req.body.content,
    mood: req.body.mood || '🌙',
    readTime: req.body.readTime || '4 min read',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Read current content.js
  const contentPath = path.join(__dirname, 'src', 'data', 'content.js')
  let content = fs.readFileSync(contentPath, 'utf8')

  // Insert writing into writings array
  const insertPoint = content.indexOf('const writings = [') + 'const writings = ['.length
  const newContent = content.slice(0, insertPoint) + '\n  ' + JSON.stringify(writing, null, 2).split('\n').join('\n  ') + ',' + content.slice(insertPoint)

  fs.writeFileSync(contentPath, newContent)

  res.json({ success: true, message: 'Writing auto-saved to content.js!' })
})

// Upload 3D models
app.post('/api/models', upload.single('file'), (req, res) => {
  const modelDir = path.join(uploadsDir, 'models', req.body.title.toLowerCase().replace(/\s+/g, '-'))
  fs.mkdirSync(modelDir, { recursive: true })

  // Move file to model directory
  const oldPath = req.file.path
  const newPath = path.join(modelDir, req.file.originalname)
  fs.renameSync(oldPath, newPath)

  res.json({ 
    success: true, 
    fileUrl: `/uploads/models/${req.body.title.toLowerCase().replace(/\s+/g, '-')}/${req.file.originalname}` 
  })
})

app.listen(3001, () => console.log('Backend running on http://localhost:3001'))
```

**Start local server:**
```bash
node server.js
```

---

## Summary of Changes Needed

| Task | Frontend | Backend |
|------|----------|---------|
| **Auto-save writings** | Change form submit to POST request | Express endpoint that writes to MongoDB/content.js |
| **Upload 3D models** | Add file input, POST to /api/models | Firebase or local file storage |
| **Upload games** | Add file inputs | Same as models |
| **Serve files** | Fetch URLs from API | Firebase Storage signed URLs |

---

## Next Steps (Choose One)

1. **Want local development first?**
   - Implement Option 2 (Simple Local Backend)
   - Start with just writings, add models after

2. **Want production-ready now?**
   - Setup MongoDB Atlas (free tier)
   - Setup Firebase Storage
   - Deploy to Vercel

3. **Still want copy/paste?**
   - Skip backend, improve client-side forms with better UX

Let me know which path you want to take!
