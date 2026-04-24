const mongoose = require('mongoose')

const Model3DSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String, required: true }, // Firebase Storage URL
    thumbnail: { type: String },
    tags: [String],
    software: { type: String },
    year: { type: Number },
    polygons: { type: String }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Model3D', Model3DSchema)
