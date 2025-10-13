const { Server } = require('socket.io');
const { fetchTrafficData: fetchTomTomTraffic, getRouteWithTraffic } = require('./services/googleMapsService');
const { fetchAccidentData: fetchTomTomAccidents } = require('./services/tomtomService');
const { fetchTrafficData: fetchMapMyIndiaTraffic, fetchAccidentData: fetchMapMyIndiaAccidents } = require('./services/mapmyindiaService');
const { VehicleSpeed } = require('./models/VehicleSpeed');
require('dotenv').config();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const UPDATE_INTERVAL = 30000;
  const ROUTE_UPDATE_INTERVAL = 60000;

  io.on('error', (err) => {
    console.error('WebSocket सर्वर त्रुटि:', err.message);
  });

  io.on('connection', (socket) => {
    console.log('WebSocket क्लाइंट जुड़ा:', socket.id);

    const sendInitialData = async () => {
      try {
        let trafficData = await fetchTomTomTraffic();
        if (trafficData.length === 0) {
          trafficData = await fetchMapMyIndiaTraffic();
        }
        let accidentData = await fetchTomTomAccidents();
        if (accidentData.length === 0) {
          accidentData = await fetchMapMyIndiaAccidents();
        }
        const vehicles = await VehicleSpeed.find({}).limit(50);
        socket.emit('trafficUpdate', { traffic: trafficData, accidents: accidentData });
        socket.emit('vehicleSpeedsUpdate', vehicles);
        console.log('प्रारंभिक डेटा भेजा गया:', socket.id);
      } catch (err) {
        console.error('प्रारंभिक डेटा भेजने में त्रुटि:', err.message);
        socket.emit('error', { message: 'प्रारंभिक डेटा प्राप्त करने में त्रुटि' });
      }
    };

    sendInitialData();

    socket.on('requestVehicleSpeeds', async () => {
      try {
        const vehicles = await VehicleSpeed.find({}).limit(50);
        socket.emit('vehicleSpeedsUpdate', vehicles);
      } catch (err) {
        console.error('वाहन गति डेटा त्रुटि:', err.message);
        socket.emit('error', { message: 'वाहन गति डेटा प्राप्त करने में त्रुटि' });
      }
    });

    socket.on('requestRouteUpdate', async (data) => {
      try {
        const { origin, destination } = data;
        if (!origin || !destination || typeof origin !== 'string' || typeof destination !== 'string') {
          socket.emit('error', { message: 'प्रारंभ और गंतव्य मान्य स्ट्रिंग्स होने चाहिए' });
          return;
        }
        const routeData = await getRouteWithTraffic({ origin, destination });
        socket.emit('routeUpdate', routeData);
      } catch (err) {
        console.error('रूट अपडेट त्रुटि:', err.message);
        socket.emit('error', { message: `रूट डेटा प्राप्त करने में त्रुटि: ${err.message}` });
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket क्लाइंट डिस्कनेक्ट:', socket.id);
    });
  });

  setInterval(async () => {
    try {
      let trafficData = await fetchTomTomTraffic();
      if (trafficData.length === 0) {
        trafficData = await fetchMapMyIndiaTraffic();
      }
      let accidentData = await fetchTomTomAccidents();
      if (accidentData.length === 0) {
        accidentData = await fetchMapMyIndiaAccidents();
      }
      io.emit('trafficUpdate', { traffic: trafficData, accidents: accidentData });
      console.log('Global traffic/accident update emitted');
    } catch (err) {
      console.error('Global traffic update error:', err.message);
    }
  }, UPDATE_INTERVAL);

  setInterval(async () => {
    try {
      const vehicles = await VehicleSpeed.find({}).limit(50);
      io.emit('vehicleSpeedsUpdate', vehicles);
    } catch (err) {
      console.error('Global vehicle update error:', err.message);
    }
  }, UPDATE_INTERVAL);

  setInterval(async () => {
    try {
      const defaultRoute = {
        origin: 'MP Nagar, Bhopal',
        destination: 'Indrapuri, Bhopal'
      };
      const routeData = await getRouteWithTraffic(defaultRoute);
      io.emit('routeUpdate', routeData);
    } catch (err) {
      console.error('Global route update error:', err.message);
    }
  }, ROUTE_UPDATE_INTERVAL);

  return io;
};

module.exports = { initSocket };