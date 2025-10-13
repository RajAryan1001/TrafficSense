const axios = require('axios');
require('dotenv').config();

async function fetchAccidentData() {
  try {
    const apiKey = process.env.TOMTOM_API_KEY;
    if (!apiKey) {
      throw new Error('TomTom API key missing');
    }

    const bbox = '77.35,23.20,77.50,23.30'; // Bhopal
    // Fixed: Changed delayInSeconds to delay
    const fields = '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers}}}';
    const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields=${encodeURIComponent(fields)}&language=en-GB&timeValidityFilter=present`;

    const response = await axios.get(url, { timeout: 10000 });

    if (response.status !== 200) {
      throw new Error(`TomTom API error: ${response.status} - ${response.statusText}`);
    }

    const incidents = response.data.incidents || [];
    console.log(`TomTom raw incidents response: ${JSON.stringify(response.data, null, 2)}`);

    const accidentData = incidents.map(inc => {
      const coordinatesArray = inc.geometry?.coordinates || [];
      const coordinates = Array.isArray(coordinatesArray[0])
        ? coordinatesArray[0]
        : coordinatesArray;
      if (!coordinates || coordinates.length < 2) {
        console.warn(`Invalid coordinates for incident ${inc.properties?.id}: ${JSON.stringify(coordinates)}`);
        return null;
      }

      let severity = 'medium';
      const category = inc.properties?.iconCategory || 0;
      if (category === 6) severity = 'high';
      else if (category === 0 || category === 11) severity = 'low';

      return {
        location: inc.properties?.from || inc.properties?.to || 'Unknown Location, Bhopal',
        description: inc.properties?.events?.[0]?.description || 'Incident',
        severity,
        coordinates: {
          lat: coordinates[1],
          lng: coordinates[0]
        },
        accidentCount: 1,
        timestamp: new Date(inc.properties?.startTime || Date.now())
      };
    }).filter(Boolean);

    console.log(`TomTom incidents fetched: ${accidentData.length}`);
    return accidentData;
  } catch (err) {
    console.error(`TomTom accident fetch error: ${err.message}`);
    if (err.response) {
      console.error(`Response details: Status ${err.response.status}, Data: ${JSON.stringify(err.response.data, null, 2)}`);
    }
    return [];
  }
}

module.exports = { fetchAccidentData };