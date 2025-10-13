const { fetchAccidentData } = require('../services/tomtomService');
const AccidentData = require('../models/AccidentData');

const getAccidentData = async (req, res) => {
  try {
    const accidentData = await fetchAccidentData();
    if (accidentData.length === 0) {
      console.warn('दुर्घटना डेटा: TomTom API से कोई डेटा नहीं मिला');
    }
    res.json({ success: true, data: accidentData });
  } catch (err) {
    console.error('दुर्घटना डेटा प्राप्त करने में त्रुटि:', err.message);
    res.status(500).json({ error: `दुर्घटना डेटा प्राप्त करने में विफल: ${err.message}`, success: false });
  }
};

const createAccidentData = async (req, res) => {
  try {
    const accidentData = new AccidentData(req.body);
    const savedData = await accidentData.save();
    console.log(`दुर्घटना डेटा सहेजा गया: ${savedData._id}`);
    res.status(201).json({ success: true, data: savedData });
  } catch (err) {
    console.error('दुर्घटना डेटा सहेजने में त्रुटि:', err.message);
    res.status(400).json({ error: `दुर्घटना डेटा सहेजने में विफल: ${err.message}`, success: false });
  }
};

const getAccidentDataById = async (req, res) => {
  try {
    const accidentData = await AccidentData.findById(req.params.id);
    if (!accidentData) {
      console.warn(`दुर्घटना डेटा ID ${req.params.id} नहीं मिला`);
      return res.status(404).json({ error: 'दुर्घटना डेटा नहीं मिला', success: false });
    }
    console.log(`दुर्घटना डेटा प्राप्त: ${req.params.id}`);
    res.json({ success: true, data: accidentData });
  } catch (err) {
    console.error('दुर्घटना डेटा ID से प्राप्त करने में त्रुटि:', err.message);
    res.status(500).json({ error: `दुर्घटना डेटा प्राप्त करने में विफल: ${err.message}`, success: false });
  }
};

const updateAccidentData = async (req, res) => {
  try {
    const updatedData = await AccidentData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedData) {
      console.warn(`दुर्घटना डेटा ID ${req.params.id} नहीं मिला`);
      return res.status(404).json({ error: 'दुर्घटना डेटा नहीं मिला', success: false });
    }
    console.log(`दुर्घटना डेटा अपडेट: ${req.params.id}`);
    res.json({ success: true, data: updatedData });
  } catch (err) {
    console.error('दुर्घटना डेटा अपडेट करने में त्रुटि:', err.message);
    res.status(400).json({ error: `दुर्घटना डेटा अपडेट करने में विफल: ${err.message}`, success: false });
  }
};

const deleteAccidentData = async (req, res) => {
  try {
    const deletedData = await AccidentData.findByIdAndDelete(req.params.id);
    if (!deletedData) {
      console.warn(`दुर्घटना डेटा ID ${req.params.id} नहीं मिला`);
      return res.status(404).json({ error: 'दुर्घटना डेटा नहीं मिला', success: false });
    }
    console.log(`दुर्घटना डेटा हटाया गया: ${req.params.id}`);
    res.json({ success: true, message: 'दुर्घटना डेटा हटाया गया' });
  } catch (err) {
    console.error('दुर्घटना डेटा हटाने में त्रुटि:', err.message);
    res.status(500).json({ error: `दुर्घटना डेटा हटाने में विफल: ${err.message}`, success: false });
  }
};

module.exports = {
  getAccidentData,
  createAccidentData,
  getAccidentDataById,
  updateAccidentData,
  deleteAccidentData
};