const express = require('express')
const router = express.Router()
const Writing = require('../../models/Writing')
const auth = require('../middleware/auth')

// Create/Save writing
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, excerpt, content, mood, readTime } = req.body

    if (!title || !category || !excerpt || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const id = title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    const writing = new Writing({
      id: id + '-' + Date.now().toString().slice(-4),
      category,
      title,
      excerpt,
      content,
      mood: mood || '🌙',
      readTime: readTime || '4 min read',
      date
    })

    await writing.save()

    res.status(201).json({
      success: true,
      message: '✅ Writing saved automatically!',
      data: writing
    })
  } catch (err) {
    console.error('Error saving writing:', err)
    res.status(500).json({ error: err.message })
  }
})

// Get all writings
router.get('/', async (req, res) => {
  try {
    const writings = await Writing.find().sort({ createdAt: -1 })
    res.json(writings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get writing by ID
router.get('/:id', async (req, res) => {
  try {
    const writing = await Writing.findOne({ id: req.params.id })
    if (!writing) {
      return res.status(404).json({ error: 'Writing not found' })
    }
    res.json(writing)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete writing
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Writing.deleteOne({ id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Writing not found' })
    }
    res.json({ success: true, message: 'Writing deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
