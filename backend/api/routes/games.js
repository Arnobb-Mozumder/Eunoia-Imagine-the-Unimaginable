const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('../../config/cloudinary')
const Game = require('../../models/Game')
const auth = require('../middleware/auth')

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for thumbnails
})

// Create/Save game
router.post('/', auth, upload.fields([{ name: 'thumbnailFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, type, platform, genre, description, embedUrl, downloadUrl, howToPlay, tags, year, featured } = req.body
    const thumbnailFile = req.files?.thumbnailFile?.[0]

    if (!title || !type || !platform || !genre || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const gameId = title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)
    let thumbnailUrl = ''

    // Upload thumbnail file to Cloudinary if provided
    if (thumbnailFile) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'gameserver/thumbnails',
              resource_type: 'auto',
              public_id: `${gameId}-thumb-${Date.now()}`
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          uploadStream.end(thumbnailFile.buffer)
        })

        thumbnailUrl = result.secure_url
      } catch (cloudinaryErr) {
        console.error('Cloudinary thumbnail upload error:', cloudinaryErr)
        // Don't fail if thumbnail upload fails, just skip it
        console.warn('Thumbnail upload failed, continuing without it')
      }
    }

    const game = new Game({
      id: gameId + '-' + Date.now().toString().slice(-4),
      title,
      type,
      platform,
      genre,
      description,
      embedUrl: embedUrl || null,
      downloadUrl: downloadUrl || null,
      thumbnail: thumbnailUrl || '',
      howToPlay: howToPlay ? (typeof howToPlay === 'string' ? JSON.parse(howToPlay) : howToPlay) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      year: parseInt(year) || new Date().getFullYear(),
      featured: featured === 'true' || featured === true
    })

    await game.save()

    res.status(201).json({
      success: true,
      message: '✅ Game saved automatically!',
      data: game
    })
  } catch (err) {
    console.error('Error saving game:', err)
    res.status(500).json({ error: err.message })
  }
})

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 })
    res.json(games)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id })
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    res.json(game)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete game
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Game.deleteOne({ id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Game not found' })
    }
    res.json({ success: true, message: 'Game deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
