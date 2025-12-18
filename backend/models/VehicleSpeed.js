const mongoose = require('mongoose');

const vehicleSpeedSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true, trim: true },
  vehicleType: { 
    type: String, 
    enum: ['car', 'bike', 'bus', 'truck', 'auto', 'unknown'], 
    default: 'unknown' 
  },
  currentSpeed: { type: Number, default: 0 },
  maxSpeed: { type: Number, default: 0 },
  averageSpeed: { type: Number, default: 0 },
  coordinates: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  location: { type: String, required: true, trim: true },
  direction: { type: Number, default: 0 }, // 0–360 degrees
  isMoving: { type: Boolean, default: true },
  source: { 
    type: String, 
    enum: ['google', 'tomtom', 'mapmyindia'], 
    default: 'tomtom' 
  },
  reliability: { type: Number, min: 0, max: 1, default: 1 },
  lastUpdate: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now }
});

// Indexes for performance
vehicleSpeedSchema.index({ vehicleId: 1 });
vehicleSpeedSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
vehicleSpeedSchema.index({ timestamp: -1, lastUpdate: -1 });

const VehicleSpeed = mongoose.model('VehicleSpeed', vehicleSpeedSchema);

// SpeedHistory Schema
const speedHistorySchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  speed: { type: Number, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});
speedHistorySchema.index({ vehicleId: 1, timestamp: -1 });
const SpeedHistory = mongoose.model('SpeedHistory', speedHistorySchema);

module.exports = { VehicleSpeed, SpeedHistory };
