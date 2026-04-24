const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('../../config/cloudinary')
const Animation = require('../../models/Animation')
const auth = require('../middleware/auth')

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

// Create/Upload Animation
router.post('/', auth, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnailFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, software, format, tags, duration, frameRate, resolution, year } = req.body
    const videoFile = req.files?.file?.[0]
    const thumbnailFile = req.files?.thumbnailFile?.[0]

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const animationId = title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)
    let fileUrl = ''
    let thumbnailUrl = ''

    // Upload video file to Cloudinary
    if (videoFile) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'gameserver/animations',
              resource_type: 'auto',
              public_id: `${animationId}-video-${Date.now()}`
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          uploadStream.end(videoFile.buffer)
        })

        fileUrl = result.secure_url
      } catch (cloudinaryErr) {
        console.error('Cloudinary video upload error:', cloudinaryErr)
        return res.status(500).json({ error: 'Video upload failed: ' + cloudinaryErr.message })
      }
    } else {
      return res.status(400).json({ error: 'Video file is required' })
    }

    // Upload thumbnail file to Cloudinary if provided
    if (thumbnailFile) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'gameserver/thumbnails',
              resource_type: 'auto',
              public_id: `${animationId}-thumb-${Date.now()}`
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

    const animation = new Animation({
      id: animationId + '-' + Date.now().toString().slice(-4),
      title,
      description,
      file: fileUrl,
      thumbnail: thumbnailUrl || '',
      format: format || 'mp4',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      software: software || 'Blender',
      duration: duration || '',
      frameRate: frameRate || '30fps',
      resolution: resolution || '1080p',
      year: parseInt(year) || new Date().getFullYear()
    })

    await animation.save()

    res.status(201).json({
      success: true,
      message: '✅ Animation uploaded successfully!',
      data: animation
    })
  } catch (err) {
    console.error('Error uploading animation:', err)
    res.status(500).json({ error: err.message })
  }
})

// Get all animations
router.get('/', async (req, res) => {
  try {
    const animations = await Animation.find().sort({ createdAt: -1 })
    res.json(animations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get animation by ID
router.get('/:id', async (req, res) => {
  try {
    const animation = await Animation.findOne({ id: req.params.id })
    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' })
    }
    res.json(animation)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete animation
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Animation.deleteOne({ id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Animation not found' })
    }
    res.json({ success: true, message: 'Animation deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
