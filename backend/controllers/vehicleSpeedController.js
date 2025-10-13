const { VehicleSpeed, SpeedHistory } = require('../models/VehicleSpeed');

// CREATE or UPDATE vehicle speed
const updateVehicleSpeed = async (req, res) => {
  try {
    const { vehicleId, vehicleType, currentSpeed, coordinates, location, direction, source } = req.body;

    if (!vehicleId || !coordinates?.lat || !coordinates?.lng || !location) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const speedData = {
      vehicleType: vehicleType || 'unknown',
      currentSpeed: parseFloat(currentSpeed) || 0,
      maxSpeed: parseFloat(currentSpeed) || 0,
      averageSpeed: parseFloat(currentSpeed) || 0,
      coordinates: { lat: parseFloat(coordinates.lat), lng: parseFloat(coordinates.lng) },
      location: location.trim(),
      direction: parseFloat(direction) || 0,
      source: source || 'tomtom',
      isMoving: currentSpeed > 0,
      lastUpdate: new Date(),
      timestamp: new Date(),
    };

    let vehicle = await VehicleSpeed.findOne({ vehicleId: vehicleId.trim() });

    if (!vehicle) {
      vehicle = await VehicleSpeed.create({ vehicleId: vehicleId.trim(), ...speedData });
    } else {
      if (speedData.currentSpeed > vehicle.maxSpeed) speedData.maxSpeed = speedData.currentSpeed;
      speedData.averageSpeed = (vehicle.averageSpeed + speedData.currentSpeed) / 2;

      vehicle = await VehicleSpeed.findOneAndUpdate(
        { vehicleId: vehicleId.trim() },
        speedData,
        { new: true, runValidators: true }
      );
    }

    // Save history
    await SpeedHistory.create({ 
      vehicleId: vehicleId.trim(), 
      speed: speedData.currentSpeed, 
      coordinates: speedData.coordinates 
    });

    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    console.error('Error in updateVehicleSpeed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET all vehicles
const getAllVehicleSpeeds = async (req, res) => {
  try {
    const vehicles = await VehicleSpeed.find().sort({ lastUpdate: -1 }).lean();
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    console.error('Error in getAllVehicleSpeeds:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await VehicleSpeed.findOne({ vehicleId: vehicleId.trim() });
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    console.error('Error in getVehicleById:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET vehicle speed history
const getVehicleSpeedHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const history = await SpeedHistory.find({ vehicleId: vehicleId.trim() }).sort({ timestamp: -1 }).lean();
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (err) {
    console.error('Error in getVehicleSpeedHistory:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET vehicles in area
const getVehicleSpeedsInArea = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng, vehicleType } = req.query;
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({ success: false, error: "Missing coordinates" });
    }

    const filter = {
      'coordinates.lat': { $gte: parseFloat(minLat), $lte: parseFloat(maxLat) },
      'coordinates.lng': { $gte: parseFloat(minLng), $lte: parseFloat(maxLng) },
    };
    if (vehicleType) filter.vehicleType = vehicleType;

    const vehicles = await VehicleSpeed.find(filter).lean();
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    console.error('Error in getVehicleSpeedsInArea:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE vehicle info
const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const updates = { ...req.body, lastUpdate: new Date() };

    const vehicle = await VehicleSpeed.findOneAndUpdate(
      { vehicleId: vehicleId.trim() }, 
      updates, 
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    console.error('Error in updateVehicle:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await VehicleSpeed.findOneAndDelete({ vehicleId: vehicleId.trim() });
    await SpeedHistory.deleteMany({ vehicleId: vehicleId.trim() });
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.status(200).json({ success: true, message: "Vehicle and history deleted successfully" });
  } catch (err) {
    console.error('Error in deleteVehicle:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  updateVehicleSpeed,
  getAllVehicleSpeeds,
  getVehicleById,
  getVehicleSpeedHistory,
  getVehicleSpeedsInArea,
  updateVehicle,
  deleteVehicle
};