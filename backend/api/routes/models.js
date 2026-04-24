const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('../../config/cloudinary')
const Model3D = require('../../models/Model3D')
const auth = require('../middleware/auth')

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

// Create/Upload 3D model
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, thumbnail, software, polygons, year, tags } = req.body
    const file = req.file

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const modelId = title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)
    let fileUrl = thumbnail || ''

    // Upload file to Cloudinary if provided
    if (file) {
      try {
        // Upload buffer to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'gameserver/models',
              resource_type: 'auto',
              public_id: `${modelId}-${Date.now()}`
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          uploadStream.end(file.buffer)
        })

        fileUrl = result.secure_url
      } catch (cloudinaryErr) {
        console.error('Cloudinary upload error:', cloudinaryErr)
        return res.status(500).json({ error: 'File upload failed: ' + cloudinaryErr.message })
      }
    }

    const model = new Model3D({
      id: modelId + '-' + Date.now().toString().slice(-4),
      title,
      description,
      file: fileUrl,
      thumbnail,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      software: software || 'Blender',
      year: parseInt(year) || new Date().getFullYear(),
      polygons
    })

    await model.save()

    res.status(201).json({
      success: true,
      message: '✅ 3D Model uploaded successfully!',
      data: model
    })
  } catch (err) {
    console.error('Error uploading model:', err)
    res.status(500).json({ error: err.message })
  }
})

// Get all models
router.get('/', async (req, res) => {
  try {
    const models = await Model3D.find().sort({ createdAt: -1 })
    res.json(models)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get model by ID
router.get('/:id', async (req, res) => {
  try {
    const model = await Model3D.findOne({ id: req.params.id })
    if (!model) {
      return res.status(404).json({ error: 'Model not found' })
    }
    res.json(model)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete model
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Model3D.deleteOne({ id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Model not found' })
    }
    res.json({ success: true, message: 'Model deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
