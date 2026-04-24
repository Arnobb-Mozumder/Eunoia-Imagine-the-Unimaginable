# GameServer Backend API

Production-ready backend with MongoDB, Firebase Storage, and Vercel deployment.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string: `mongodb+srv://username:password@cluster0...`
4. Add to `.env` as `MONGODB_URI`

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project "GameServer"
3. Enable Storage (create bucket)
4. Create Service Account:
   - Settings → Service Accounts → Generate new key
   - Download JSON file
5. Copy values from JSON to `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY` (replace newlines with `\n`)
   - `FIREBASE_CLIENT_EMAIL`
   - etc.

### 5. Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## 📡 API Endpoints

### Writings
- `POST /api/writings` - Save writing
- `GET /api/writings` - Get all writings
- `GET /api/writings/:id` - Get writing by ID
- `DELETE /api/writings/:id` - Delete writing

### 3D Models
- `POST /api/models` - Upload 3D model (with file)
- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get model by ID
- `DELETE /api/models/:id` - Delete model

### Games
- `POST /api/games` - Save game
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get game by ID
- `DELETE /api/games/:id` - Delete game

### Content
- `GET /api/content` - Get all content (writings, models, games)

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial backend setup"
git push origin main
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### 3. Add Environment Variables in Vercel

Dashboard → Settings → Environment Variables

Add all variables from `.env`

### 4. Update Frontend API URLs

In `src/pages/writings.js`, `src/pages/admin.js`:

```javascript
const API_URL = 'https://your-backend.vercel.app'

// Before:
// await fetch('http://localhost:3001/api/writings', ...)

// After:
// await fetch(`${API_URL}/api/writings`, ...)
```

## 📝 Request Examples

### Save Writing

```bash
curl -X POST http://localhost:3001/api/writings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "category": "tech",
    "excerpt": "A brief excerpt",
    "content": "Full content here",
    "mood": "📝",
    "readTime": "5 min read"
  }'
```

### Upload 3D Model

```bash
curl -X POST http://localhost:3001/api/models \
  -F "title=My Model" \
  -F "description=Model description" \
  -F "file=@model.glb" \
  -F "software=Blender" \
  -F "polygons=12500" \
  -F "year=2025" \
  -F "tags=character,humanoid"
```

## 🔒 Security Notes

- Never commit `.env` file
- Keep Firebase private key secure
- Use HTTPS in production
- Add authentication for delete endpoints
- Validate all inputs on backend

## 📚 Database Structure

### Writing Document
```javascript
{
  id: "my-first-post-1234",
  category: "tech",
  title: "My First Post",
  excerpt: "Brief summary",
  content: "Full content",
  date: "April 20, 2025",
  readTime: "4 min read",
  mood: "🌙",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Model3D Document
```javascript
{
  id: "my-model-1234",
  title: "Character Model",
  description: "3D character",
  file: "https://firebase-url...",
  thumbnail: "https://...",
  tags: ["character", "humanoid"],
  software: "Blender",
  year: 2025,
  polygons: "12500",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Game Document
```javascript
{
  id: "my-game-1234",
  title: "My Game",
  type: "web",
  platform: "Browser",
  genre: "Puzzle",
  description: "Game description",
  embedUrl: "https://...",
  downloadUrl: "https://...",
  howToPlay: ["Step 1", "Step 2"],
  tags: ["puzzle", "casual"],
  year: 2025,
  featured: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check connection string in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username/password

### Firebase Upload Error
- Check Firebase credentials in `.env`
- Ensure Storage bucket exists
- Check file size limits (100MB max)

### CORS Error
- Add frontend URL to `CORS_ORIGIN` in config
- Check `vercel.json` environment variables

## 📞 Support

Backend endpoints are fully documented. Each route returns:
- `{ success: true, message: "...", data: {...} }` on success
- `{ error: "..." }` on error
