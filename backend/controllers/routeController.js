
const googleMapsService = require('../services/googleMapsService');
const tomtomService = require('../services/tomtomService');
const mapmyindiaService = require('../services/mapmyindiaService');

const getRoute = async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin और destination आवश्यक हैं', success: false });
    }

    const decodedOrigin = decodeURIComponent(origin);
    const decodedDestination = decodeURIComponent(destination);

    const routeResponse = await googleMapsService.getRouteWithTraffic({ origin: decodedOrigin, destination: decodedDestination });

    if (!routeResponse.success) {
      return res.status(500).json({ error: routeResponse.error, success: false });
    }

    let accidentData = await tomtomService.fetchAccidentData();
    if (accidentData.length === 0) {
      console.warn('TomTom से कोई दुर्घटना डेटा नहीं, MapMyIndia की कोशिश');
      accidentData = await mapmyindiaService.fetchAccidentData();
    }

    const { data: routeData, accidentCount } = routeResponse;

    const routesWithCharacter = routeData.map(route => {
      let routeCharacter;
      switch (route.congestionLevel) {
        case 'high':
          routeCharacter = 'अनप्रेडिक्टेबल';
          break;
        case 'medium':
          routeCharacter = 'सामान्य';
          break;
        default:
          routeCharacter = 'स्मूथ';
      }
      return { ...route, routeCharacter };
    });

    const response = {
      success: true,
      data: routesWithCharacter,
      origin: decodedOrigin,
      destination: decodedDestination,
      timestamp: new Date(),
      accidentCount: accidentData.length,
      totalAccidentsInRoutes: routeData.reduce((sum, r) => sum + (r.accidentsInWay || 0), 0)
    };

    const io = req.app.get('io');
    io.emit('routeUpdate', response);

    res.json(response);
  } catch (err) {
    console.error('Route fetch error:', err.message);
    res.status(500).json({ error: `रूट डेटा प्राप्त करने में विफल: ${err.message}`, success: false });
  }
};

module.exports = { getRoute };