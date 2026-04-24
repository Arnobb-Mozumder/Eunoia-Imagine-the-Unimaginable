const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.VERCEL_FRONTEND_URL || ''
  ],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Connect MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message))
}

// Routes
const writingsRouter = require('./routes/writings')
const modelsRouter = require('./routes/models')
const animationsRouter = require('./routes/animations')
const gamesRouter = require('./routes/games')
const contentRouter = require('./routes/content')
const messagesRouter = require('./routes/messages')

app.use('/api/writings', writingsRouter)
app.use('/api/models', modelsRouter)
app.use('/api/animations', animationsRouter)
app.use('/api/games', gamesRouter)
app.use('/api/content', contentRouter)
app.use('/api/messages', messagesRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  })
})

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📍 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  })
}

module.exports = app
