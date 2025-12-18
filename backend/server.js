// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// require('dotenv').config();

// const connectDB = require('./config/database');
// const trafficRoutes = require('./routes/trafficRoutes');
// const accidentRoutes = require('./routes/accidentRoutes');
// const vehicleSpeedRoutes = require('./routes/vehicleSpeedRoutes');
// const routeRoutes = require('./routes/routeRoutes');
// const { initSocket } = require('./socket');
// const { startCityPolling } = require('./services/vehicleDataPoller');
// const userRoute = require('./routes/userRoutes')

// const app = express();
// const server = http.createServer(app);

// connectDB();
// const io = initSocket(server);

// app.set('io', io);

// const corsOptions = {
//   origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URL
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
// app.use(cors(corsOptions));
// app.use(express.json());

// app.use('/api/user', userRoute);

// app.use('/api/traffic', trafficRoutes);

// app.use('/api/accidents', accidentRoutes);
// app.use('/api/vehicle-speeds', vehicleSpeedRoutes);
// app.use('/api/route', routeRoutes);



// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'भोपाल ट्रैफिक प्रबंधन सिस्टम API चल रहा है',
//     timestamp: new Date(),
//     version: '1.0.0',
//     features: ['traffic', 'accidents', 'vehicle-speeds', 'routes']
//   });
// });

// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'भोपाल ट्रैफिक प्रबंधन सिस्टम API',
//     endpoints: {
//       traffic: {
//         get: '/api/traffic',
//         post: '/api/traffic',
//         getById: '/api/traffic/:id',
//         put: '/api/traffic/:id',
//         delete: '/api/traffic/:id'
//       },
//       accidents: {
//         get: '/api/accidents',
//         post: '/api/accidents',
//         getById: '/api/accidents/:id',
//         put: '/api/accidents/:id',
//         delete: '/api/accidents/:id'
//       },
//       vehicle_speeds: {
//         update: 'POST /api/vehicle-speeds/update',
//         get_all: 'GET /api/vehicle-speeds',
//         get_history: 'GET /api/vehicle-speeds/history/:vehicleId',
//         get_area: 'GET /api/vehicle-speeds/area?minLat=xx&maxLat=xx&minLng=xx&maxLng=xx'
//       },
//       route: '/api/route?origin={origin}&destination={destination}',
//       health: '/api/health'
//     }
//   });
// });

// const POLLING_INTERVAL = 30000;
// startCityPolling(POLLING_INTERVAL);

// const PORT = process.env.PORT || 5000;

// const startServer = (startPort, maxTries = 10) => new Promise((resolve, reject) => {
//   let port = startPort;
//   let attempts = 0;

//   const tryListen = () => {
//     attempts++;
//     if (server.listening) {
//       console.log(`Server already listening on port ${port}`);
//       return resolve(port);
//     }

//     server.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//       console.log(`Health API: http://localhost:${port}/api/health`);
//       console.log(`Traffic API: http://localhost:${port}/api/traffic`);
//       console.log(`Accident API: http://localhost:${port}/api/accidents`);
//       console.log(`Vehicle Speed API: http://localhost:${port}/api/vehicle-speeds`);
//       console.log(`Route API Example: http://localhost:${port}/api/route?origin=MP%20Nagar,%20Bhopal&destination=Indrapuri,%20Bhopal`);
//       resolve(port);
//     }).on('error', (err) => {
//       if (err.code === 'EADDRINUSE' && attempts < maxTries) {
//         console.warn(`Port ${port} in use, trying ${port + 1}`);
//         port++;
//         setTimeout(tryListen, 200);
//       } else {
//         console.error('Server error:', err);
//         reject(err);
//       }
//     });
//   };

//   tryListen();
// });

// (async () => {
//   try {
//     await startServer(PORT, 50);
//   } catch (err) {
//     console.error('Failed to start server after retries:', err);
//     process.exit(1);
//   }
// })();

const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const trafficRoutes = require('./routes/trafficRoutes');
const accidentRoutes = require('./routes/accidentRoutes');
const vehicleSpeedRoutes = require('./routes/vehicleSpeedRoutes');
const routeRoutes = require('./routes/routeRoutes');
const { initSocket } = require('./socket');
const { startCityPolling } = require('./services/vehicleDataPoller');
const userRoute = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

connectDB();
const io = initSocket(server);

app.set('io', io);

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000','https://traffic-sense-gllcqcovl-rajpatil484950-gmailcoms-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// ✅ FIXED: Changed mounting from '/api/vehicle-speed' to '/api/vehicles' to match documentation and console logs
app.use('/api/user', userRoute);
app.use('/api/traffic', trafficRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/vehicles', vehicleSpeedRoutes); // Now matches docs/logs
app.use('/api/route', routeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'भोपाल ट्रैफिक प्रबंधन सिस्टम API चल रहा है',
    timestamp: new Date(),
    version: '1.0.0',
    features: ['traffic', 'accidents', 'vehicles', 'routes']
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'भोपाल ट्रैफिक प्रबंधन सिस्टम API',
    endpoints: {
      traffic: {
        get: '/api/traffic',
        post: '/api/traffic',
        getById: '/api/traffic/:id',
        put: '/api/traffic/:id',
        delete: '/api/traffic/:id'
      },
      accidents: {
        get: '/api/accidents',
        post: '/api/accidents',
        getById: '/api/accidents/:id',
        put: '/api/accidents/:id',
        delete: '/api/accidents/:id'
      },
      vehicles: {
        // ✅ FIXED: Updated paths to match actual routes (no '/update' suffix; POST '/' handles create/update)
        update_speed: 'POST /api/vehicles', // Creates or updates speed data
        get_all: 'GET /api/vehicles',
        get_single: 'GET /api/vehicles/:vehicleId',
        get_history: 'GET /api/vehicles/:vehicleId/history',
        get_area: 'GET /api/vehicles/area?minLat=xx&maxLat=xx&minLng=xx&maxLng=xx&vehicleType=xx', // Query params, not /area/vehicles
        update: 'PUT /api/vehicles/:vehicleId', // General update (e.g., location, type)
        delete: 'DELETE /api/vehicles/:vehicleId'
      },
      route: '/api/route?origin={origin}&destination={destination}',
      health: '/api/health'
    }
  });
});

const POLLING_INTERVAL = 30000;
startCityPolling(POLLING_INTERVAL);

const PORT = process.env.PORT || 5000;

const startServer = (startPort, maxTries = 10) => new Promise((resolve, reject) => {
  let port = startPort;
  let attempts = 0;

  const tryListen = () => {
    attempts++;
    if (server.listening) {
      console.log(`Server already listening on port ${port}`);
      return resolve(port);
    }

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🏥 Health API: http://localhost:${port}/api/health`);
      console.log(`🚦 Traffic API: http://localhost:${port}/api/traffic`);
      console.log(`🚨 Accident API: http://localhost:${port}/api/accidents`);
      console.log(`🚗 Vehicle API: http://localhost:${port}/api/vehicles`); // ✅ Already correct
      console.log(`🗺️ Route API: http://localhost:${port}/api/route`);
      console.log(`👤 User API: http://localhost:${port}/api/user`);
      resolve(port);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts < maxTries) {
        console.warn(`Port ${port} in use, trying ${port + 1}`);
        port++;
        setTimeout(tryListen, 200);
      } else {
        console.error('Server error:', err);
        reject(err);
      }
    });
  };

  tryListen();
});

(async () => {
  try {
    await startServer(PORT, 50);
  } catch (err) {
    console.error('Failed to start server after retries:', err);
    process.exit(1);
  }
})();