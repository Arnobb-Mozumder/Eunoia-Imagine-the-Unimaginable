const express = require('express')
const router = express.Router()
const Message = require('../../models/Message')

// POST: Save a new Chithi (Public)
router.post('/', async (req, res) => {
  try {
    const { name, message } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' })
    }

    const newMessage = new Message({
      name: name || 'Anonymous',
      message
    })

    await newMessage.save()
    res.json({ success: true, message: 'Chithi delivered successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET: Fetch all messages (Admin Only)
router.get('/', async (req, res) => {
  try {
    // Basic security check via query param for now
    const adminKey = req.query.key
    if (adminKey !== process.env.ADMIN_SECRET_KEY && adminKey !== 'arnob1812') {
      return res.status(401).json({ error: 'Unauthorized access' })
    }

    const messages = await Message.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH: Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const adminKey = req.query.key
    if (adminKey !== 'arnob1812') return res.status(401).json({ error: 'Unauthorized' })

    await Message.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE: Remove a message
router.delete('/:id', async (req, res) => {
  try {
    const adminKey = req.query.key
    if (adminKey !== 'arnob1812') return res.status(401).json({ error: 'Unauthorized' })

    await Message.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
