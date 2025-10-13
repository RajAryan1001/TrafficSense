const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  location: { type: String, required: true },
  description: { type: String, default: 'दुर्घटना' },
  severity: { type: String, enum: ['high', 'medium', 'low', 'unknown'], default: 'unknown' },
  coordinates: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  accidentCount: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccidentData', accidentSchema);