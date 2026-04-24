# API Reference Card

## Base URLs
- **Local Development**: `http://localhost:3001`
- **Production**: `https://your-backend.vercel.app`

---

## Endpoints

### Writings
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/writings` | `{title, category, excerpt, content, mood?, readTime?}` | `{success, data}` |
| GET | `/api/writings` | - | `[{writings}]` |
| GET | `/api/writings/:id` | - | `{writing}` |
| DELETE | `/api/writings/:id` | - | `{success}` |

### 3D Models
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/models` | FormData: `title, description, file (binary), thumbnail?, software?, polygons?, year?, tags?` | `{success, data}` |
| GET | `/api/models` | - | `[{models}]` |
| GET | `/api/models/:id` | - | `{model}` |
| DELETE | `/api/models/:id` | - | `{success}` |

### Games
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/games` | `{title, type, platform, genre, description, embedUrl?, downloadUrl?, thumbnail?, howToPlay[], tags?, year?, featured?}` | `{success, data}` |
| GET | `/api/games` | - | `[{games}]` |
| GET | `/api/games/:id` | - | `{game}` |
| DELETE | `/api/games/:id` | - | `{success}` |

### Content (All)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/content` | - | `{writings, models, games, count}` |

### Health Check
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/health` | - | `{status, timestamp}` |

---

## Frontend Usage Examples

### Save Writing
```javascript
const response = await fetch('http://localhost:3001/api/writings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Post',
    category: 'tech',
    excerpt: 'Brief...',
    content: 'Full content...',
    mood: '📝',
    readTime: '5 min read'
  })
})
const data = await response.json()
// data.success === true
```

### Upload 3D Model
```javascript
const formData = new FormData()
formData.append('title', 'My Model')
formData.append('description', 'Description...')
formData.append('file', fileInput.files[0]) // Binary file
formData.append('software', 'Blender')
formData.append('year', 2025)

const response = await fetch('http://localhost:3001/api/models', {
  method: 'POST',
  body: formData // No Content-Type header!
})
const data = await response.json()
```

### Get All Content
```javascript
const response = await fetch('http://localhost:3001/api/content')
const { writings, models, games } = await response.json()
```

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Post saved automatically!",
  "data": {
    "id": "my-post-1234",
    "title": "My Post",
    "category": "tech",
    "date": "April 20, 2025",
    "createdAt": "2025-04-20T10:30:00Z",
    "updatedAt": "2025-04-20T10:30:00Z"
  }
}
```

### Error
```json
{
  "error": "Missing required fields",
  "status": 400
}
```

---

## Status Codes
- `201`: Created successfully
- `200`: OK
- `400`: Bad request (missing fields)
- `404`: Not found
- `500`: Server error

---

## Environment Variables

Required in `.env`:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# URLs
FRONTEND_URL=http://localhost:5173
```

---

## Local Testing with cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Get all writings
curl http://localhost:3001/api/writings

# Save writing
curl -X POST http://localhost:3001/api/writings \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Post",
    "category":"tech",
    "excerpt":"Test",
    "content":"Test content"
  }'

# Upload model
curl -X POST http://localhost:3001/api/models \
  -F "title=My Model" \
  -F "description=Test" \
  -F "file=@model.glb"
```
