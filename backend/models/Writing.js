const mongoose = require('mongoose')

const WritingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    readTime: { type: String, default: '4 min read' },
    mood: { type: String, default: '🌙' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Writing', WritingSchema)
