const TrafficData = require('../models/TrafficData');
const mongoose = require('mongoose');

// GET all traffic data
const getTrafficData = async (req, res) => {
  try {
    console.log('🔄 GET /traffic - Fetching all traffic data from database');
    
    const trafficData = await TrafficData.find().sort({ timestamp: -1 });
    
    console.log(`📊 Database query result: ${trafficData.length} records found`);
    
    res.json({ 
      success: true, 
      data: trafficData,
      count: trafficData.length,
      message: `Found ${trafficData.length} traffic records`
    });
  } catch (err) {
    console.error('❌ Error fetching traffic data:', err.stack);
    res.status(500).json({ 
      success: false,
      error: `Failed to fetch traffic data: ${err.message}`
    });
  }
};


// CREATE new traffic data
const createTrafficData = async (req, res) => {
  try {
    console.log('📥 CREATE /traffic - Request received');
    
    const { location, coordinates, congestionLevel, vehiclesCount, averageSpeed } = req.body;

    console.log('📥 Request Body:', req.body);

    // Validate only required fields
    if (!location || !coordinates?.lat || !coordinates?.lng) {
      console.error('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: location, coordinates.lat, coordinates.lng',
      });
    }

    // Prepare data with defaults
    const trafficData = {
      location: location.trim(),
      coordinates: {
        lat: parseFloat(coordinates.lat),
        lng: parseFloat(coordinates.lng)
      },
      congestionLevel: congestionLevel || 'unknown',
      vehiclesCount: parseInt(vehiclesCount) || 0,
      averageSpeed: parseFloat(averageSpeed) || 0,
      // Default values for optional fields
      distance: {
        text: 'उपलब्ध नहीं',
        value: 0
      },
      duration: {
        text: 'उपलब्ध नहीं',
        value: 0
      },
      duration_in_traffic: {
        text: 'उपलब्ध नहीं',
        value: 0
      }
    };

    console.log('📤 Processed data for saving:', trafficData);

    const newTraffic = await TrafficData.create(trafficData);

    console.log('✅ Traffic data created successfully with ID:', newTraffic._id);

    res.status(201).json({ 
      success: true, 
      data: newTraffic,
      message: 'Traffic data created successfully'
    });
  } catch (err) {
    console.error('❌ Error creating traffic data:', err.stack);
    res.status(500).json({ 
      success: false, 
      error: `Server error: ${err.message}` 
    });
  }
};

// GET single traffic record
const getTrafficDataById = async (req, res) => {
  try {
    console.log(`🔍 GET /traffic/${req.params.id}`);
    
    const trafficData = await TrafficData.findById(req.params.id);
    if (!trafficData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Traffic data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: trafficData 
    });
  } catch (err) {
    console.error('❌ Error fetching traffic data by ID:', err.stack);
    res.status(500).json({ 
      success: false,
      error: `Failed to fetch traffic data: ${err.message}`
    });
  }
};

// UPDATE traffic data
const updateTrafficData = async (req, res) => {
  try {
    console.log(`🔄 PUT /traffic/${req.params.id}`, req.body);
    
    const updatedData = await TrafficData.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Traffic data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedData,
      message: 'Traffic data updated successfully'
    });
  } catch (err) {
    console.error('❌ Error updating traffic data:', err.stack);
    res.status(500).json({ 
      success: false,
      error: `Failed to update traffic data: ${err.message}`
    });
  }
};

// DELETE traffic data
const deleteTrafficData = async (req, res) => {
  try {
    console.log(`🗑️ DELETE /traffic/${req.params.id}`);
    
    const deletedData = await TrafficData.findByIdAndDelete(req.params.id);
    if (!deletedData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Traffic data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Traffic data deleted successfully',
      data: deletedData
    });
  } catch (err) {
    console.error('❌ Error deleting traffic data:', err.stack);
    res.status(500).json({ 
      success: false,
      error: `Failed to delete traffic data: ${err.message}`
    });
  }
};

// Debug endpoint to check database status
const getDebugStatus = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbName = mongoose.connection.db?.databaseName;
    const collectionCount = await TrafficData.countDocuments();
    const allRecords = await TrafficData.find().sort({ timestamp: -1 });
    
    console.log('🔍 Debug - Database Status:', {
      readyState: dbStatus,
      dbName: dbName,
      collectionCount: collectionCount
    });

    res.json({
      success: true,
      database: {
        connected: dbStatus === 1,
        dbName: dbName,
        trafficRecordsCount: collectionCount,
        records: allRecords
      },
      message: `Database status: ${dbStatus === 1 ? 'Connected' : 'Disconnected'}`
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getTrafficData,
  createTrafficData,
  getTrafficDataById,
  updateTrafficData,
  deleteTrafficData,
  getDebugStatus
};