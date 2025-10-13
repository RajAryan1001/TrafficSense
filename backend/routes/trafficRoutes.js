const express = require('express');
const router = express.Router();
const {
  getTrafficData,
  createTrafficData,
  getTrafficDataById,
  updateTrafficData,
  deleteTrafficData,
  getDebugStatus
} = require('../controllers/trafficController');

// Main CRUD routes
router.get('/', getTrafficData);
router.post('/', createTrafficData);
router.get('/:id', getTrafficDataById);
router.put('/:id', updateTrafficData);
router.delete('/:id', deleteTrafficData);

// Debug route
router.get('/debug/status', getDebugStatus);

module.exports = router;