const express = require('express');
const router = express.Router();
const {
  updateVehicleSpeed,
  getAllVehicleSpeeds,
  getVehicleById,
  getVehicleSpeedHistory,
  getVehicleSpeedsInArea,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleSpeedController.js');

// POST /api/vehicles - Create/Update vehicle speed
router.post('/', updateVehicleSpeed);

// GET /api/vehicles - Get all vehicles
router.get('/', getAllVehicleSpeeds);

// GET /api/vehicles/:vehicleId - Get vehicle by ID
router.get('/:vehicleId', getVehicleById);

// GET /api/vehicles/:vehicleId/history - Get vehicle speed history
router.get('/:vehicleId/history', getVehicleSpeedHistory);

// GET /api/vehicles/area?minLat=...&maxLat=...&minLng=...&maxLng=...&vehicleType=... - Get vehicles in area
router.get('/area', getVehicleSpeedsInArea);

// PUT /api/vehicles/:vehicleId - Update vehicle info
router.put('/:vehicleId', updateVehicle);

// DELETE /api/vehicles/:vehicleId - Delete vehicle and history
router.delete('/:vehicleId', deleteVehicle);

module.exports = router;