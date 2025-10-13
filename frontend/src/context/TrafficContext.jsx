// import React, { createContext, useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';

// const TrafficContext = createContext();

// export const TrafficProvider = ({ children }) => {
//   const [trafficData, setTrafficData] = useState([]);
//   const [accidentData, setAccidentData] = useState([]);
//   const [vehicleSpeeds, setVehicleSpeeds] = useState([]); // ADDED: Vehicle speeds data
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [areaVehicles, setAreaVehicles] = useState([]);

//   // Base configuration
//   const BASE_URL = 'http://localhost:5000';
//   const API_BASE_URL = `${BASE_URL}/api`;

//   // Axios instance
//   const axiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     timeout: 10000,
//   });

//   // Enhanced logging
//   axiosInstance.interceptors.request.use(
//     (config) => {
//       console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
//       return config;
//     },
//     (error) => {
//       console.error('❌ Request error:', error);
//       return Promise.reject(error);
//     }
//   );

//   axiosInstance.interceptors.response.use(
//     (response) => {
//       console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} success`);
//       return response;
//     },
//     (error) => {
//       console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} error:`, {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message
//       });
//       return Promise.reject(error);
//     }
//   );

//   useEffect(() => {
//     // Initialize WebSocket
//     const newSocket = io(BASE_URL);
//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//       console.log('✅ Connected to WebSocket server');
//     });

//     newSocket.on('trafficUpdate', (data) => {
//       console.log('📊 WebSocket traffic update received');
//       if (Array.isArray(data.traffic)) {
//         setTrafficData(data.traffic);
//       }
//     });

//     // ADDED: Listen for vehicle speed updates
//     newSocket.on('vehicleSpeedUpdate', (data) => {
//       console.log('🚗 WebSocket vehicle speed update received');
//       if (Array.isArray(data.vehicleSpeeds)) {
//         setVehicleSpeeds(data.vehicleSpeeds);
//       }
//     });

//     newSocket.on('error', (err) => {
//       console.error('❌ WebSocket error:', err);
//     });

//     // Fetch initial data
//     fetchInitialData();
//     fetchAccidentData();
//     fetchVehicleSpeeds(); // ADDED: Fetch vehicle speeds

//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   // ADDED: Fetch vehicle speeds data
//   const fetchVehicleSpeeds = async () => {
//     setIsLoading(true);
//     try {
//       console.log('🔄 fetchVehicleSpeeds: Starting...');
//       setError(null);

//       const response = await axiosInstance.get('/vehicle-speeds');
      
//       if (response.data.success) {
//         const data = response.data.data || [];
//         console.log(`✅ fetchVehicleSpeeds: Loaded ${data.length} vehicle records`);
//         setVehicleSpeeds(data);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch vehicle speeds data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
//       console.error('❌ fetchVehicleSpeeds error:', errorMessage);
//       setError(`Failed to load vehicle speeds: ${errorMessage}`);
//       setVehicleSpeeds([]); // Set empty array on error
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch all traffic data
//   const fetchInitialData = async () => {
//     setIsLoading(true);
//     try {
//       console.log('🔄 fetchInitialData: Starting...');
//       setError(null);

//       const response = await axiosInstance.get('/traffic');
      
//       if (response.data.success) {
//         const data = response.data.data || [];
//         console.log(`✅ fetchInitialData: Loaded ${data.length} records`);
//         setTrafficData(data);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
//       console.error('❌ fetchInitialData error:', errorMessage);
//       setError(`Failed to load data: ${errorMessage}`);
//       setTrafficData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch accident data
//   const fetchAccidentData = async () => {
//     setIsLoading(true);
//     try {
//       console.log('🔄 Fetching accident data...');
//       setError(null);

//       const response = await axiosInstance.get('/accidents');
      
//       if (response.data.success) {
//         const data = response.data.data || [];
//         console.log(`✅ Loaded ${data.length} accident records`);
//         setAccidentData(data);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch accident data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
//       console.error('❌ fetchAccidentData error:', errorMessage);
//       setError(`Failed to load accident data: ${errorMessage}`);
//       setAccidentData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // CREATE traffic data
//   const createTrafficData = async (data) => {
//     setIsLoading(true);
//     try {
//       console.log('🚀 createTrafficData:', data);
//       setError(null);

//       // Validate
//       if (!data.location?.trim()) {
//         throw new Error('Location is required');
//       }
//       if (!data.coordinates?.lat || !data.coordinates?.lng) {
//         throw new Error('Both latitude and longitude are required');
//       }

//       const requestData = {
//         location: data.location.trim(),
//         coordinates: {
//           lat: parseFloat(data.coordinates.lat),
//           lng: parseFloat(data.coordinates.lng)
//         },
//         congestionLevel: data.congestionLevel || 'unknown',
//         vehiclesCount: parseInt(data.vehiclesCount) || 0,
//         averageSpeed: parseFloat(data.averageSpeed) || 0
//       };

//       console.log('📤 Sending to API:', requestData);

//       const response = await axiosInstance.post('/traffic', requestData);
      
//       if (response.data.success) {
//         console.log('✅ Traffic data created successfully');
        
//         // Refresh data and notify via socket
//         await fetchInitialData();
//         if (socket) {
//           socket.emit('trafficDataUpdated', trafficData);
//         }
        
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to create traffic data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
//       console.error('❌ createTrafficData error:', errorMessage);
//       setError(`Failed to create: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // UPDATE traffic data
//   const updateTrafficData = async (id, data) => {
//     setIsLoading(true);
//     try {
//       console.log(`🔄 updateTrafficData ID: ${id}`, data);
//       setError(null);

//       if (!id) throw new Error('No ID provided');

//       const requestData = {
//         location: data.location?.trim(),
//         coordinates: data.coordinates ? {
//           lat: parseFloat(data.coordinates.lat),
//           lng: parseFloat(data.coordinates.lng)
//         } : undefined,
//         congestionLevel: data.congestionLevel,
//         vehiclesCount: data.vehiclesCount !== undefined ? parseInt(data.vehiclesCount) : undefined,
//         averageSpeed: data.averageSpeed !== undefined ? parseFloat(data.averageSpeed) : undefined,
//       };

//       // Clean undefined fields
//       Object.keys(requestData).forEach(key => {
//         if (requestData[key] === undefined) {
//           delete requestData[key];
//         }
//       });

//       const response = await axiosInstance.put(`/traffic/${id}`, requestData);
      
//       if (response.data.success) {
//         console.log('✅ Traffic data updated successfully');
//         await fetchInitialData();
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to update traffic data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.error('❌ updateTrafficData error:', errorMessage);
//       setError(`Failed to update: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // DELETE traffic data
//   const deleteTrafficData = async (id) => {
//     setIsLoading(true);
//     try {
//       console.log(`🗑️ deleteTrafficData ID: ${id}`);
//       setError(null);

//       if (!id) throw new Error('No ID provided');

//       const response = await axiosInstance.delete(`/traffic/${id}`);
      
//       if (response.data.success) {
//         console.log('✅ Traffic data deleted successfully');
//         await fetchInitialData();
//         return response.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to delete traffic data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.error('❌ deleteTrafficData error:', errorMessage);
//       setError(`Failed to delete: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ADDED: Create vehicle speed data
//   const createVehicleSpeed = async (data) => {
//     setIsLoading(true);
//     try {
//       console.log('🚀 createVehicleSpeed:', data);
//       setError(null);

//       const requestData = {
//         vehicleId: data.vehicleId?.trim(),
//         vehicleType: data.vehicleType || 'car',
//         currentSpeed: parseFloat(data.currentSpeed) || 0,
//         averageSpeed: parseFloat(data.averageSpeed) || 0,
//         maxSpeed: parseFloat(data.maxSpeed) || 0,
//         location: data.location?.trim() || 'Unknown Location',
//         coordinates: data.coordinates || { lat: 0, lng: 0 }
//       };

//       const response = await axiosInstance.post('/vehicle-speeds', requestData);
      
//       if (response.data.success) {
//         console.log('✅ Vehicle speed data created successfully');
//         await fetchVehicleSpeeds();
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to create vehicle speed data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.error('❌ createVehicleSpeed error:', errorMessage);
//       setError(`Failed to create vehicle speed: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Get Vehicles in Area
//   const getVehiclesInArea = async (minLat, maxLat, minLng, maxLng) => {
//     setIsLoading(true);
//     try {
//       console.log('🔍 Searching vehicles in area:', { minLat, maxLat, minLng, maxLng });
//       setError(null);

//       const response = await axiosInstance.get(
//         `/vehicle-speeds/area?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`
//       );
      
//       if (response.data.success) {
//         const vehicles = Array.isArray(response.data.data) ? response.data.data : [];
//         console.log(`✅ Found ${vehicles.length} vehicles in area`);
//         setAreaVehicles(vehicles);
//         return vehicles;
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch area vehicles');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
//       console.error('❌ Get vehicles in area error:', errorMessage);
//       setError(`Failed to search area: ${errorMessage}`);
//       setAreaVehicles([]);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Refresh all data
//   const refreshTrafficData = async () => {
//     await fetchInitialData();
//   };

//   // ADDED: Refresh vehicle speeds
//   const refreshVehicleSpeeds = async () => {
//     await fetchVehicleSpeeds();
//   };

//   // Clear errors
//   const clearError = () => setError(null);

//   const contextValue = {
//     // Data states
//     trafficData,
//     accidentData,
//     vehicleSpeeds, // ADDED: Vehicle speeds data
//     error,
//     isLoading,
//     areaVehicles,
    
//     // CRUD operations
//     createTrafficData,
//     updateTrafficData,
//     deleteTrafficData,
//     createVehicleSpeed, // ADDED: Create vehicle speed
//     refreshTrafficData,
//     refreshVehicleSpeeds, // ADDED: Refresh vehicle speeds
//     clearError,
//     getVehiclesInArea,
    
//     // Socket
//     socket,
//   };

//   return (
//     <TrafficContext.Provider value={contextValue}>
//       {children}
//     </TrafficContext.Provider>
//   );
// };

// export default TrafficContext;


// import React, { createContext, useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';

// const TrafficContext = createContext();

// export const TrafficProvider = ({ children }) => {
//   const [trafficData, setTrafficData] = useState([]);
//   const [accidentData, setAccidentData] = useState([]);
//   const [vehicleSpeeds, setVehicleSpeeds] = useState([]); // ADDED: Vehicle speeds data
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [areaVehicles, setAreaVehicles] = useState([]);
//   const [vehicleHistory, setVehicleHistory] = useState([]); // ADDED: Vehicle history state

//   // Base configuration
//   const BASE_URL = 'http://localhost:5000';
//   const API_BASE_URL = `${BASE_URL}/api`;

//   // Axios instance
//   const axiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     timeout: 10000,
//   });

//   // Enhanced logging
//   axiosInstance.interceptors.request.use(
//     (config) => {
//       console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
//       return config;
//     },
//     (error) => {
//       console.error('❌ Request error:', error);
//       return Promise.reject(error);
//     }
//   );

//   axiosInstance.interceptors.response.use(
//     (response) => {
//       console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} success`);
//       return response;
//     },
//     (error) => {
//       console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} error:`, {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message
//       });
//       return Promise.reject(error);
//     }
//   );

//   useEffect(() => {
//     // Initialize WebSocket
//     const newSocket = io(BASE_URL);
//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//       console.log('✅ Connected to WebSocket server');
//     });

//     newSocket.on('trafficUpdate', (data) => {
//       console.log('📊 WebSocket traffic update received');
//       if (Array.isArray(data.traffic)) {
//         setTrafficData(data.traffic);
//       }
//     });

//     // ADDED: Listen for vehicle speed updates
//     newSocket.on('vehicleSpeedUpdate', (data) => {
//       console.log('🚗 WebSocket vehicle speed update received');
//       if (Array.isArray(data.vehicleSpeeds)) {
//         setVehicleSpeeds(data.vehicleSpeeds);
//       }
//     });

//     newSocket.on('error', (err) => {
//       console.error('❌ WebSocket error:', err);
//     });

//     // Fetch initial data
//     fetchInitialData();
//     fetchAccidentData();
//     fetchVehicleSpeeds(); // ADDED: Fetch vehicle speeds

//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   // ADDED: Fetch vehicle speeds data
//   const fetchVehicleSpeeds = async () => {
//     setIsLoading(true);
//     try {
//       console.log('🔄 fetchVehicleSpeeds: Starting...');
//       setError(null);

//       const response = await axiosInstance.get('/vehicle-speeds');
      
//       if (response.data.success) {
//         const data = response.data.data || [];
//         console.log(`✅ fetchVehicleSpeeds: Loaded ${data.length} vehicle records`);
//         setVehicleSpeeds(data);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch vehicle speeds data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
//       console.error('❌ fetchVehicleSpeeds error:', errorMessage);
//       setError(`Failed to load vehicle speeds: ${errorMessage}`);
//       setVehicleSpeeds([]); // Set empty array on error
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch all traffic data
//   const fetchInitialData = async () => {
//     setIsLoading(true);
//     try {
//       console.log('🔄 fetchInitialData: Starting...');
//       setError(null);

//       const response = await axiosInstance.get('/traffic');
      
//       if (response.data.success) {
//         const data = response.data.data || [];
//         console.log(`✅ fetchInitialData: Loaded ${data.length} records`);
//         setTrafficData(data);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
//       console.error('❌ fetchInitialData error:', errorMessage);
//       setError(`Failed to load data: ${errorMessage}`);
//       setTrafficData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch accident data
//   const fetchAccidentData = async () => {
//     setIsLoading(true);
//     try {
//       console.log('🔄 Fetching accident data...');
//       setError(null);

//       const response = await axiosInstance.get('/accidents');
      
//       if (response.data.success) {
//         const data = response.data.data || [];
//         console.log(`✅ Loaded ${data.length} accident records`);
//         setAccidentData(data);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch accident data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
//       console.error('❌ fetchAccidentData error:', errorMessage);
//       setError(`Failed to load accident data: ${errorMessage}`);
//       setAccidentData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // CREATE traffic data
//   const createTrafficData = async (data) => {
//     setIsLoading(true);
//     try {
//       console.log('🚀 createTrafficData:', data);
//       setError(null);

//       // Validate
//       if (!data.location?.trim()) {
//         throw new Error('Location is required');
//       }
//       if (!data.coordinates?.lat || !data.coordinates?.lng) {
//         throw new Error('Both latitude and longitude are required');
//       }

//       const requestData = {
//         location: data.location.trim(),
//         coordinates: {
//           lat: parseFloat(data.coordinates.lat),
//           lng: parseFloat(data.coordinates.lng)
//         },
//         congestionLevel: data.congestionLevel || 'unknown',
//         vehiclesCount: parseInt(data.vehiclesCount) || 0,
//         averageSpeed: parseFloat(data.averageSpeed) || 0
//       };

//       console.log('📤 Sending to API:', requestData);

//       const response = await axiosInstance.post('/traffic', requestData);
      
//       if (response.data.success) {
//         console.log('✅ Traffic data created successfully');
        
//         // Refresh data and notify via socket
//         await fetchInitialData();
//         if (socket) {
//           socket.emit('trafficDataUpdated', trafficData);
//         }
        
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to create traffic data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
//       console.error('❌ createTrafficData error:', errorMessage);
//       setError(`Failed to create: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // UPDATE traffic data
//   const updateTrafficData = async (id, data) => {
//     setIsLoading(true);
//     try {
//       console.log(`🔄 updateTrafficData ID: ${id}`, data);
//       setError(null);

//       if (!id) throw new Error('No ID provided');

//       const requestData = {
//         location: data.location?.trim(),
//         coordinates: data.coordinates ? {
//           lat: parseFloat(data.coordinates.lat),
//           lng: parseFloat(data.coordinates.lng)
//         } : undefined,
//         congestionLevel: data.congestionLevel,
//         vehiclesCount: data.vehiclesCount !== undefined ? parseInt(data.vehiclesCount) : undefined,
//         averageSpeed: data.averageSpeed !== undefined ? parseFloat(data.averageSpeed) : undefined,
//       };

//       // Clean undefined fields
//       Object.keys(requestData).forEach(key => {
//         if (requestData[key] === undefined) {
//           delete requestData[key];
//         }
//       });

//       const response = await axiosInstance.put(`/traffic/${id}`, requestData);
      
//       if (response.data.success) {
//         console.log('✅ Traffic data updated successfully');
//         await fetchInitialData();
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to update traffic data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.error('❌ updateTrafficData error:', errorMessage);
//       setError(`Failed to update: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // DELETE traffic data
//   const deleteTrafficData = async (id) => {
//     setIsLoading(true);
//     try {
//       console.log(`🗑️ deleteTrafficData ID: ${id}`);
//       setError(null);

//       if (!id) throw new Error('No ID provided');

//       const response = await axiosInstance.delete(`/traffic/${id}`);
      
//       if (response.data.success) {
//         console.log('✅ Traffic data deleted successfully');
//         await fetchInitialData();
//         return response.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to delete traffic data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.error('❌ deleteTrafficData error:', errorMessage);
//       setError(`Failed to delete: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ADDED: Create vehicle speed data
//   const createVehicleSpeed = async (data) => {
//     setIsLoading(true);
//     try {
//       console.log('🚀 createVehicleSpeed:', data);
//       setError(null);

//       const requestData = {
//         vehicleId: data.vehicleId?.trim(),
//         vehicleType: data.vehicleType || 'car',
//         currentSpeed: parseFloat(data.currentSpeed) || 0,
//         averageSpeed: parseFloat(data.averageSpeed) || 0,
//         maxSpeed: parseFloat(data.maxSpeed) || 0,
//         location: data.location?.trim() || 'Unknown Location',
//         coordinates: data.coordinates || { lat: 0, lng: 0 }
//       };

//       const response = await axiosInstance.post('/vehicle-speeds', requestData);
      
//       if (response.data.success) {
//         console.log('✅ Vehicle speed data created successfully');
//         await fetchVehicleSpeeds();
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to create vehicle speed data');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.error('❌ createVehicleSpeed error:', errorMessage);
//       setError(`Failed to create vehicle speed: ${errorMessage}`);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Get Vehicles in Area
//   const getVehiclesInArea = async (minLat, maxLat, minLng, maxLng) => {
//     setIsLoading(true);
//     try {
//       console.log('🔍 Searching vehicles in area:', { minLat, maxLat, minLng, maxLng });
//       setError(null);

//       const response = await axiosInstance.get(
//         `/vehicle-speeds/area?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`
//       );
      
//       if (response.data.success) {
//         const vehicles = Array.isArray(response.data.data) ? response.data.data : [];
//         console.log(`✅ Found ${vehicles.length} vehicles in area`);
//         setAreaVehicles(vehicles);
//         return vehicles;
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch area vehicles');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
//       console.error('❌ Get vehicles in area error:', errorMessage);
//       setError(`Failed to search area: ${errorMessage}`);
//       setAreaVehicles([]);
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ADDED: Get Vehicle History - The missing function
 
//   const getVehicleHistory = async (vehicleId, hours = 24) => {
//   setIsLoading(true);
//   try {
//     console.log(`🔄 getVehicleHistory: Fetching history for ${vehicleId}`);
//     setError(null);

//     if (!vehicleId) {
//       throw new Error('Vehicle ID is required');
//     }

//     const url = `/vehicle-speeds/${vehicleId}/history?hours=${hours}`;
//     console.log('📡 Making API call to:', url);

//     const response = await axiosInstance.get(url);

//     console.log('📊 API Response:', response.data);

//     if (response.data.success) {
//       const history = Array.isArray(response.data.data) ? response.data.data : [];
//       console.log(`✅ getVehicleHistory: Loaded ${history.length} history records for ${vehicleId}`);
//       setVehicleHistory(history);
//       return history;
//     } else {
//       throw new Error(response.data.message || 'Failed to fetch vehicle history');
//     }
//   } catch (err) {
//     const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
//     console.error('❌ getVehicleHistory error:', {
//       message: errorMessage,
//       status: err.response?.status,
//       url: err.config?.url,
//       data: err.response?.data
//     });
//     setError(`Failed to load vehicle history: ${errorMessage}`);
//     setVehicleHistory([]);
//     throw new Error(errorMessage);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // Refresh all data
//   const refreshTrafficData = async () => {
//     await fetchInitialData();
//   };

//   // ADDED: Refresh vehicle speeds
//   const refreshVehicleSpeeds = async () => {
//     await fetchVehicleSpeeds();
//   };

//   // Clear errors
//   const clearError = () => setError(null);

//   const contextValue = {
//     // Data states
//     trafficData,
//     accidentData,
//     vehicleSpeeds, // ADDED: Vehicle speeds data
//     vehicleHistory, // ADDED: Vehicle history data
//     error,
//     isLoading,
//     areaVehicles,
  
    
//     // CRUD operations
//     createTrafficData,
//     updateTrafficData,
//     deleteTrafficData,
//     createVehicleSpeed, // ADDED: Create vehicle speed
//     refreshTrafficData,
//     refreshVehicleSpeeds, // ADDED: Refresh vehicle speeds
//     clearError,
//     getVehiclesInArea,
//     getVehicleHistory, // ADDED: The missing function
    
    
//     // Socket
//     socket,
//   };

//   return (
//     <TrafficContext.Provider value={contextValue}>
//       {children}
//     </TrafficContext.Provider>
//   );
// };

// export default TrafficContext;


import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const TrafficContext = createContext();

export const TrafficProvider = ({ children }) => {
  const [trafficData, setTrafficData] = useState([]);
  const [accidentData, setAccidentData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Base configuration
  const BASE_URL = 'http://localhost:5000';
  const API_BASE_URL = `${BASE_URL}/api`;

  // Axios instance
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Enhanced logging
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} success`);
      return response;
    },
    (error) => {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} error:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    // Initialize WebSocket
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    newSocket.on('trafficUpdate', (data) => {
      console.log('📊 WebSocket traffic update received');
      if (Array.isArray(data.traffic)) {
        setTrafficData(data.traffic);
      }
    });

    newSocket.on('error', (err) => {
      console.error('❌ WebSocket error:', err);
    });

    // Fetch initial data
    fetchInitialData();
    fetchAccidentData();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch all traffic data
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 fetchInitialData: Starting...');
      setError(null);

      const response = await axiosInstance.get('/traffic');
      
      if (response.data.success) {
        const data = response.data.data || [];
        console.log(`✅ fetchInitialData: Loaded ${data.length} records`);
        setTrafficData(data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      console.error('❌ fetchInitialData error:', errorMessage);
      setError(`Failed to load data: ${errorMessage}`);
      setTrafficData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accident data
  const fetchAccidentData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching accident data...');
      setError(null);

      const response = await axiosInstance.get('/accidents');
      
      if (response.data.success) {
        const data = response.data.data || [];
        console.log(`✅ Loaded ${data.length} accident records`);
        setAccidentData(data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch accident data');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      console.error('❌ fetchAccidentData error:', errorMessage);
      setError(`Failed to load accident data: ${errorMessage}`);
      setAccidentData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // CREATE traffic data
  const createTrafficData = async (data) => {
    setIsLoading(true);
    try {
      console.log('🚀 createTrafficData:', data);
      setError(null);

      // Validate
      if (!data.location?.trim()) {
        throw new Error('Location is required');
      }
      if (!data.coordinates?.lat || !data.coordinates?.lng) {
        throw new Error('Both latitude and longitude are required');
      }

      const requestData = {
        location: data.location.trim(),
        coordinates: {
          lat: parseFloat(data.coordinates.lat),
          lng: parseFloat(data.coordinates.lng)
        },
        congestionLevel: data.congestionLevel || 'unknown',
        vehiclesCount: parseInt(data.vehiclesCount) || 0,
        averageSpeed: parseFloat(data.averageSpeed) || 0
      };

      console.log('📤 Sending to API:', requestData);

      const response = await axiosInstance.post('/traffic', requestData);
      
      if (response.data.success) {
        console.log('✅ Traffic data created successfully');
        
        // Refresh data and notify via socket
        await fetchInitialData();
        if (socket) {
          socket.emit('trafficDataUpdated', trafficData);
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create traffic data');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error('❌ createTrafficData error:', errorMessage);
      setError(`Failed to create: ${errorMessage}`);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATE traffic data
  const updateTrafficData = async (id, data) => {
    setIsLoading(true);
    try {
      console.log(`🔄 updateTrafficData ID: ${id}`, data);
      setError(null);

      if (!id) throw new Error('No ID provided');

      const requestData = {
        location: data.location?.trim(),
        coordinates: data.coordinates ? {
          lat: parseFloat(data.coordinates.lat),
          lng: parseFloat(data.coordinates.lng)
        } : undefined,
        congestionLevel: data.congestionLevel,
        vehiclesCount: data.vehiclesCount !== undefined ? parseInt(data.vehiclesCount) : undefined,
        averageSpeed: data.averageSpeed !== undefined ? parseFloat(data.averageSpeed) : undefined,
      };

      // Clean undefined fields
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined) {
          delete requestData[key];
        }
      });

      const response = await axiosInstance.put(`/traffic/${id}`, requestData);
      
      if (response.data.success) {
        console.log('✅ Traffic data updated successfully');
        await fetchInitialData();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update traffic data');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('❌ updateTrafficData error:', errorMessage);
      setError(`Failed to update: ${errorMessage}`);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE traffic data
  const deleteTrafficData = async (id) => {
    setIsLoading(true);
    try {
      console.log(`🗑️ deleteTrafficData ID: ${id}`);
      setError(null);

      if (!id) throw new Error('No ID provided');

      const response = await axiosInstance.delete(`/traffic/${id}`);
      
      if (response.data.success) {
        console.log('✅ Traffic data deleted successfully');
        await fetchInitialData();
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete traffic data');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('❌ deleteTrafficData error:', errorMessage);
      setError(`Failed to delete: ${errorMessage}`);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshTrafficData = async () => {
    await fetchInitialData();
  };

  // Clear errors
  const clearError = () => setError(null);

  const contextValue = {
    // Data states
    trafficData,
    accidentData,
    error,
    isLoading,
    
    // CRUD operations
    createTrafficData,
    updateTrafficData,
    deleteTrafficData,
    refreshTrafficData,
    clearError,
    
    // Socket
    socket,
  };

  return (
    <TrafficContext.Provider value={contextValue}>
      {children}
    </TrafficContext.Provider>
  );
};

export default TrafficContext;