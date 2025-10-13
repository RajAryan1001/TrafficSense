const axios = require('axios');
const { fetchAccidentData } = require('./tomtomService');
require('dotenv').config();

async function fetchTrafficData() {
  try {
    console.log('TomTom API से ट्रैफिक डेटा fetch हो रहा है...');
    const tomtomApiKey = process.env.TOMTOM_API_KEY;

    if (!tomtomApiKey) {
      throw new Error('TomTom API key नहीं मिला');
    }

    const points = [
      { location: 'एमपी नगर, भोपाल', lat: 23.2331, lng: 77.4346 },
      { location: 'इंद्रपुरी, भोपाल', lat: 23.2600, lng: 77.4200 },
      { location: 'डीबी सिटी मॉल, भोपाल', lat: 23.2594, lng: 77.3963 },
      { location: 'लिली स्क्वायर, भोपाल', lat: 23.2400, lng: 77.4300 },
      { location: 'बिट्टन मार्केट, भोपाल', lat: 23.2528, lng: 77.4442 },
      { location: 'महू नाका, भोपाल', lat: 23.2540, lng: 77.4070 },
      { location: 'शहर बाजार, भोपाल', lat: 23.2670, lng: 77.4020 },
      { location: 'अयोध्या नगर, भोपाल', lat: 23.2720, lng: 77.4470 },
      { location: 'न्यू मार्केट, भोपाल', lat: 23.2406, lng: 77.4023 },
      { location: 'हबीबगंज रेलवे स्टेशन, भोपाल', lat: 23.2357, lng: 77.4496 },
      { location: 'भोपाल जंक्शन रेलवे स्टेशन', lat: 23.2684, lng: 77.4006 },
      { location: 'तालकटोरा, भोपाल', lat: 23.2599, lng: 77.4651 },
      { location: 'टीटी नगर, भोपाल', lat: 23.2472, lng: 77.3995 },
      { location: 'बैरागढ़, भोपाल', lat: 23.3012, lng: 77.3714 },
      { location: 'कोलार रोड, भोपाल', lat: 23.1850, lng: 77.4280 },
      { location: 'गोविंदपुरा, भोपाल', lat: 23.2595, lng: 77.4682 },
      { location: 'भदभदा रोड, भोपाल', lat: 23.2050, lng: 77.3860 },
      { location: 'लालघाटी, भोपाल', lat: 23.2907, lng: 77.3905 },
      { location: 'विद्यानगर, भोपाल', lat: 23.2350, lng: 77.4520 },
      { location: 'भोपाल एयरपोर्ट (राजाभोज)', lat: 23.2875, lng: 77.3375 },

    ];

    const data = [];
    for (const point of points) {
      try {
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${point.lat},${point.lng}&unit=kmph&key=${tomtomApiKey}`;
        const response = await axios.get(url, { timeout: 5000 });
        console.log(`TomTom traffic flow response for ${point.location}: ${JSON.stringify(response.data, null, 2)}`);
        const flow = response.data.flowSegmentData;
        if (flow) {
          const currentSpeed = flow.currentSpeed || 0;
          const freeFlowSpeed = flow.freeFlowSpeed || 60;
          const congestionRatio = freeFlowSpeed > 0 ? (freeFlowSpeed - currentSpeed) / freeFlowSpeed : 0;
          let congestionLevel = 'low';
          if (congestionRatio > 0.5) congestionLevel = 'high';
          else if (congestionRatio > 0.2) congestionLevel = 'medium';

          const vehiclesCount = Math.round(congestionRatio * 200 + 10);

          data.push({
            location: point.location,
            congestionLevel,
            vehiclesCount,
            averageSpeed: Math.round(currentSpeed),
            coordinates: { lat: point.lat, lng: point.lng },
            timestamp: new Date().toISOString(),
            source: 'TomTom Flow API'
          });
        }
      } catch (pointErr) {
        console.warn(`Point ${point.location} fetch error: ${pointErr.message}`);
        if (pointErr.response) {
          console.warn(`Response details: Status ${pointErr.response.status}, Data: ${JSON.stringify(pointErr.response.data, null, 2)}`);
        }
      }
    }

    console.log(`ट्रैफिक डेटा प्राप्त: ${data.length} पॉइंट्स`);
    return data;
  } catch (err) {
    console.error('ट्रैफिक fetch त्रुटि:', err.message);
    return [];
  }
}

async function getRouteWithTraffic({ origin, destination }) {
  try {
    console.log(`Google Maps API से रूट डेटा fetch हो रहा है: ${origin} से ${destination}`);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key नहीं मिला');
    }

    if (!origin || !destination || typeof origin !== 'string' || typeof destination !== 'string') {
      throw new Error('प्रारंभ और गंतव्य मान्य स्ट्रिंग्स होने चाहिए');
    }

    const normalizedOrigin = origin.trim();
    const normalizedDestination = destination.trim();

    if (!normalizedOrigin || !normalizedDestination) {
      throw new Error('प्रारंभ और गंतव्य खाली नहीं हो सकते');
    }

    const departureTime = 'now';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(normalizedOrigin)}&destination=${encodeURIComponent(normalizedDestination)}&mode=driving&traffic_model=best_guess&departure_time=${departureTime}&alternatives=true&language=hi&key=${apiKey}`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.status !== 200 || response.data.status !== 'OK') {
      throw new Error(`Google Maps API त्रुटि: ${response.data.error_message || response.status}`);
    }

    const accidentData = await fetchAccidentData();
    const accidentCount = accidentData.length;

    const routes = response.data.routes.map((route) => {
      const routePoints = route.legs[0].steps.map((step) => step.end_location);
      let accidentsInWay = 0;
      accidentData.forEach((accident) => {
        let nearRoute = false;
        routePoints.forEach((point) => {
          const distance = Math.sqrt(
            Math.pow(point.lat - accident.coordinates.lat, 2) +
            Math.pow(point.lng - accident.coordinates.lng, 2)
          );
          if (distance < 0.005) {
            nearRoute = true;
          }
        });
        if (nearRoute) accidentsInWay++;
      });

      const baseDuration = route.legs[0].duration.value || 0;
      const trafficDuration = route.legs[0].duration_in_traffic?.value || baseDuration;
      const ratio = trafficDuration / (baseDuration || 1);

      let congestionLevel = 'low';
      if (ratio > 1.5) congestionLevel = 'high';
      else if (ratio > 1.15) congestionLevel = 'medium';

      return {
        distance: {
          text: route.legs[0].distance.text,
          value: route.legs[0].distance.value
        },
        duration: {
          text: route.legs[0].duration.text,
          value: route.legs[0].duration.value
        },
        duration_in_traffic: {
          text: route.legs[0].duration_in_traffic?.text || route.legs[0].duration.text,
          value: trafficDuration
        },
        start_address: route.legs[0].start_address,
        end_address: route.legs[0].end_address,
        summary: route.summary || 'रूट विवरण',
        warnings: route.warnings || [],
        steps: route.legs[0].steps.map((step) => ({
          instruction: step.html_instructions ? step.html_instructions.replace(/<[^>]+>/g, '') : 'N/A',
          distance: {
            text: step.distance.text,
            value: step.distance.value
          },
          duration: {
            text: step.duration.text,
            value: step.duration.value
          },
          travel_mode: step.travel_mode,
          end_location: {
            lat: step.end_location.lat,
            lng: step.end_location.lng
          }
        })),
        congestionLevel,
        routeCharacter: congestionLevel === 'high' ? 'अनप्रेडिक्टेबल' : congestionLevel === 'medium' ? 'सामान्य' : 'स्मूथ',
        accidentsInWay
      };
    });

    return {
      success: true,
      data: routes,
      origin: normalizedOrigin,
      destination: normalizedDestination,
      timestamp: new Date().toISOString(),
      accidentCount
    };
  } catch (err) {
    console.error('Google Maps रूट त्रुटि:', err.message);
    return { success: false, error: `रूट डेटा प्राप्त करने में त्रुटि: ${err.message}` };
  }
}

async function getDistanceBetween(origin, destination) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Google Maps API key missing');
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&departure_time=now&key=${apiKey}`;
    const res = await axios.get(url, { timeout: 10000 });
    if (res.status !== 200 || res.data.status !== 'OK') {
      throw new Error(res.data.error_message || `Status ${res.status}`);
    }
    const element = res.data.rows[0].elements[0];
    return {
      distance: element.distance || null,
      duration: element.duration || null,
      duration_in_traffic: element.duration_in_traffic || null,
      status: element.status
    };
  } catch (err) {
    console.error('DistanceMatrix त्रुटि:', err.message);
    return null;
  }
}

module.exports = { fetchTrafficData, getRouteWithTraffic, getDistanceBetween };