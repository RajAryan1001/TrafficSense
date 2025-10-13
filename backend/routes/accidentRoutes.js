const express = require('express');
const router = express.Router();
const {
  getAccidentData,
  createAccidentData,
  getAccidentDataById,
  updateAccidentData,
  deleteAccidentData
} = require('../controllers/accidentController');

router.get('/', getAccidentData);
router.post('/', createAccidentData);
router.get('/:id', getAccidentDataById);
router.put('/:id', updateAccidentData);
router.delete('/:id', deleteAccidentData);

module.exports = router;