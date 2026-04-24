const mongoose = require('mongoose')

const AnimationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String }, // Cloudinary URL
    thumbnail: { type: String },
    format: { type: String, enum: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
    software: { type: String, default: 'Blender' },
    tags: [String],
    duration: { type: String }, // e.g., "5:30"
    year: { type: Number, default: new Date().getFullYear() },
    frameRate: { type: String }, // e.g., "30fps"
    resolution: { type: String }, // e.g., "1080p"
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: 'animations' }
)

module.exports = mongoose.model('Animation', AnimationSchema)
