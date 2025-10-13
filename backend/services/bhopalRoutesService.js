const { getRouteWithTraffic } = require('./googleMapsService');

const getBhopalRoute = async (origin, destination) => {
  try {
    console.log('रूट रिक्वेस्ट प्रोसेस हो रही है:', origin, '->', destination);
    
    const result = await getRouteWithTraffic({ origin, destination });
    if (!result || !result.success) {
      console.warn('Google Maps ने रूट डेटा नहीं दिया:', result && result.error);
      return { data: [], origin, destination };
    }

    return { data: result.data, origin, destination, timestamp: result.timestamp };
  } catch (error) {
    console.error('भोपाल रूट प्राप्त करने में त्रुटि:', error.message);
    return { data: [], origin, destination };
  }
};

module.exports = { getBhopalRoute };