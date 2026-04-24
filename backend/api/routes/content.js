const express = require('express')
const router = express.Router()
const Writing = require('../../models/Writing')
const Model3D = require('../../models/Model3D')
const Game = require('../../models/Game')

// Get all content (writings, models, games)
router.get('/', async (req, res) => {
  try {
    const [writings, models, games] = await Promise.all([
      Writing.find().sort({ createdAt: -1 }),
      Model3D.find().sort({ createdAt: -1 }),
      Game.find().sort({ createdAt: -1 })
    ])

    res.json({
      writings,
      models,
      games,
      count: {
        writings: writings.length,
        models: models.length,
        games: games.length
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
