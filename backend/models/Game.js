const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true }, // web, unity, pc, mobile
    platform: { type: String, required: true },
    genre: { type: String, required: true },
    thumbnail: { type: String },
    embedUrl: { type: String },
    downloadUrl: { type: String },
    description: { type: String, required: true },
    howToPlay: [String],
    tags: [String],
    year: { type: Number },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Game', GameSchema)
