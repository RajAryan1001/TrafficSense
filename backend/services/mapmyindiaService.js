const axios = require('axios');

let _mapmyindiaToken = null;
let _mapmyindiaTokenExpiry = 0;

async function getMapmyIndiaAccessToken() {
  const explicitToken = process.env.MAPMYINDIA_ACCESS_TOKEN;
  if (explicitToken) return explicitToken;

  if (_mapmyindiaToken && Date.now() < _mapmyindiaTokenExpiry - 60000) {
    return _mapmyindiaToken;
  }

  const clientId = process.env.MAPMYINDIA_CLIENT_ID;
  const clientSecret = process.env.MAPMYINDIA_CLIENT_SECRET;
  if (clientId && clientSecret) {
    try {
      const tokenUrl = 'https://outpost.mappls.com/api/security/oauth/token';
      const resp = await axios.post(tokenUrl, null, {
        params: { grant_type: 'client_credentials' },
        auth: { username: clientId, password: clientSecret },
        timeout: 10000
      });
      if (resp && resp.data && resp.data.access_token) {
        _mapmyindiaToken = resp.data.access_token;
        const expiresIn = parseInt(resp.data.expires_in, 10) || 3600;
        _mapmyindiaTokenExpiry = Date.now() + expiresIn * 1000;
        console.info('MapmyIndia: fetched access token, expires in', expiresIn, 's');
        return _mapmyindiaToken;
      }
    } catch (err) {
      console.error('MapmyIndia token fetch error:', err.message);
      if (err && err.response) console.error('Token response:', err.response.status, err.response.data);
    }
  }

  return null;
}
async function fetchTrafficData() {
  const apiKey = process.env.MAPMYINDIA_API_KEY;
  const token = await getMapmyIndiaAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fixed endpoint for traffic flow
  const flowUrl = `https://apis.mapmyindia.com/advancedmaps/v1/traffic?bbox=77.35,23.20,77.50,23.30&key=${apiKey}`;
  try {
    const resp = await axios.get(flowUrl, { headers, timeout: 10000 });
    if (resp.status === 200 && resp.data.features) {
      return resp.data.features.map(item => ({
        location: item.properties.roadName || 'Unknown',
        coordinates: { lat: item.geometry.coordinates[1], lng: item.geometry.coordinates[0] },
        congestionLevel: item.properties.trafficLevel || 'unknown',
        averageSpeed: item.properties.speed || 0,
        vehiclesCount: item.properties.estimatedVehicles || 50,
        timestamp: new Date()
      }));
    }
  } catch (err) {
    console.error('MapMyIndia traffic flow error:', err.message);
  }

  return [];
}

async function fetchAccidentData() {
  const apiKey = process.env.MAPMYINDIA_API_KEY;
  const token = await getMapmyIndiaAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fixed endpoint for incidents
  const incidentsUrl = `https://apis.mapmyindia.com/advancedmaps/v1/traffic/incidents?bbox=77.35,23.20,77.50,23.30&key=${apiKey}`;
  try {
    const resp = await axios.get(incidentsUrl, { headers, timeout: 10000 });
    if (resp.status === 200 && resp.data.incidents) {
      return resp.data.incidents.map(item => ({
        location: item.location || 'Unknown',
        description: item.description || 'Incident',
        severity: item.severity || 'medium',
        coordinates: { lat: item.latitude, lng: item.longitude },
        timestamp: new Date(item.timestamp || Date.now())
      }));
    }
    console.warn('MapMyIndia: No incidents data returned');
    return [];
  } catch (err) {
    console.error('MapMyIndia incidents error:', err.message);
    if (err.response?.status === 404) {
      console.warn('MapMyIndia 404: Endpoint not available for your key - check permissions');
    }
    return [];
  }
}

module.exports = { fetchTrafficData, fetchAccidentData };
async function fetchAccidentData() {
  const apiKey = process.env.MAPMYINDIA_API_KEY;
  const token = await getMapmyIndiaAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Updated endpoint to v2/incidents
  const incidentsUrl = `https://atlas.mappls.com/api/traffic/v2/incidents?bbox=77.35,23.20,77.50,23.30&region=ind`;
  try {
    const resp = await axios.get(incidentsUrl, { headers, params: apiKey ? { key: apiKey } : {}, timeout: 10000 });
    if (resp.status === 200 && Array.isArray(resp.data.incidents)) {
      return resp.data.incidents.map(item => ({
        location: item.location || 'Unknown',
        description: item.description || 'Accident',
        severity: item.severity || 'medium',
        coordinates: { lat: item.latitude, lng: item.longitude },
        accidentCount: 1,
        timestamp: new Date(item.timestamp || Date.now())
      }));
    }
    console.warn('MapMyIndia: No incidents data returned');
    return [];
  } catch (err) {
    console.error('MapMyIndia incidents error:', err.message, err.response?.status || '');
    if (err.response?.status === 404) {
      console.warn('MapMyIndia incidents endpoint not found; check API key permissions or subscription');
    }
    return [];
  }
}

module.exports = { fetchTrafficData, fetchAccidentData };