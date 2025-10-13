const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
  location: { type: String, required: true },
  coordinates: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  congestionLevel: { type: String, enum: ['high', 'medium', 'low', 'unknown'], default: 'unknown' },
  vehiclesCount: { type: Number, default: 0 },
  averageSpeed: { type: Number, default: 0 },
  distance: { 
    text: { type: String, default: 'उपलब्ध नहीं' },
    value: { type: Number, default: 0 }
  },
  duration: { 
    text: { type: String, default: 'उपलब्ध नहीं' },
    value: { type: Number, default: 0 }
  },
  duration_in_traffic: { 
    text: { type: String, default: 'उपलब्ध नहीं' },
    value: { type: Number, default: 0 }
  },
  timestamp: { type: Date, default: Date.now }
});

// Index for better performance
trafficSchema.index({ location: 1 });
trafficSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
trafficSchema.index({ timestamp: -1 });

const TrafficModel = mongoose.model('TrafficData', trafficSchema);
module.exports = TrafficModel;