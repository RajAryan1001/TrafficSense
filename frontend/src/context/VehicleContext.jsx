// import { createContext, useContext, useState, useCallback } from 'react';

// const VehicleContext = createContext();

// export const useVehicle = () => {
//   const context = useContext(VehicleContext);
//   if (!context) {
//     throw new Error('useVehicle must be used within a VehicleProvider');
//   }
//   return context;
// };

// export const VehicleProvider = ({ children }) => {
//   const [vehicleSpeeds, setVehicleSpeeds] = useState([]);
//   const [vehicleHistory, setVehicleHistory] = useState([]);
//   const [areaVehicles, setAreaVehicles] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

//   const apiCall = useCallback(async (url, options = {}) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const fullUrl = `${API_BASE}${url}`;
//       console.log(`🚀 API Call: ${options.method || 'GET'} ${fullUrl}`);
      
//       const response = await fetch(fullUrl, {
//         ...options,
//         headers: {
//           'Content-Type': 'application/json',
//           ...options.headers,
//         },
//       });

//       // Check if response is HTML (error page)
//       const contentType = response.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         const text = await response.text();
//         console.error('❌ API returned non-JSON response:', text.substring(0, 200));
//         throw new Error(`API endpoint not found: ${fullUrl}`);
//       }

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       if (data.success === false) {
//         throw new Error(data.error || 'API request failed');
//       }
      
//       return data;
//     } catch (err) {
//       const errorMessage = err.message || 'An unexpected error occurred';
//       console.error('❌ API Error:', errorMessage);
//       setError(errorMessage);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [API_BASE]);

//   // GET all vehicles
//   const getAllVehicleSpeeds = useCallback(async () => {
//     try {
//       const data = await apiCall('/vehicles');
//       setVehicleSpeeds(data.data || []);
//       return data.data || [];
//     } catch (err) {
//       setVehicleSpeeds([]);
//       return [];
//     }
//   }, [apiCall]);

//   // GET vehicle by ID
//   const getVehicleById = useCallback(async (vehicleId) => {
//     try {
//       const data = await apiCall(`/vehicles/${vehicleId}`);
//       return data.data;
//     } catch (err) {
//       console.log(`⚠️ Vehicle ${vehicleId} not found`);
//       return null;
//     }
//   }, [apiCall]);

//   // ✅ FIXED: GET vehicle history with PROPER error handling
//   const getVehicleHistory = useCallback(async (vehicleId, hours = 24) => {
//     if (!vehicleId || vehicleId.trim() === '') {
//       console.log('⚠️ Empty vehicle ID provided for history');
//       setVehicleHistory([]);
//       return [];
//     }

//     setIsLoading(true);
//     setError(null);
    
//     try {
//       console.log(`📋 Fetching history for vehicle: ${vehicleId}`);
//       const data = await apiCall(`/vehicles/${vehicleId}/history?hours=${hours}`);
      
//       // If no history found, return empty array
//       const history = data.data || [];
//       console.log(`✅ Found ${history.length} history records for ${vehicleId}`);
      
//       setVehicleHistory(history);
//       return history;
//     } catch (err) {
//       // ✅ FIXED: Handle "Vehicle not found" and other errors gracefully
//       if (err.message.includes('not found') || 
//           err.message.includes('Vehicle not found') ||
//           err.message.includes('404') ||
//           err.message.includes('No vehicle')) {
//         console.log(`ℹ️ No history found for vehicle: ${vehicleId}`);
//         setVehicleHistory([]);
//         return []; // Return empty array instead of throwing error
//       }
      
//       // For other errors, show the error but still return empty array
//       console.error('❌ Error fetching vehicle history:', err.message);
//       setVehicleHistory([]);
//       return []; // Always return empty array to prevent crashes
//     } finally {
//       setIsLoading(false);
//     }
//   }, [apiCall]);

//   // GET vehicles in area
//   const getVehiclesInArea = useCallback(async (minLat, maxLat, minLng, maxLng, vehicleType = '') => {
//     try {
//       let url = `/vehicles/area?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`;
//       if (vehicleType) url += `&vehicleType=${vehicleType}`;
//       const data = await apiCall(url);
//       setAreaVehicles(data.data || []);
//       return data.data || [];
//     } catch (err) {
//       setAreaVehicles([]);
//       return [];
//     }
//   }, [apiCall]);

//   // CREATE vehicle speed
//   const createVehicleSpeed = useCallback(async (vehicleData) => {
//     try {
//       const data = await apiCall('/vehicles', {
//         method: 'POST',
//         body: JSON.stringify(vehicleData)
//       });
      
//       // Update local state immediately
//       setVehicleSpeeds(prev => {
//         const newVehicle = data.data;
//         const exists = prev.find(v => v.vehicleId === newVehicle.vehicleId);
//         if (exists) {
//           return prev.map(v => v.vehicleId === newVehicle.vehicleId ? newVehicle : v);
//         }
//         return [...prev, newVehicle];
//       });
      
//       return data.data;
//     } catch (err) {
//       throw err;
//     }
//   }, [apiCall]);

//   // UPDATE vehicle
//   const updateVehicle = useCallback(async (vehicleId, updates) => {
//     try {
//       const data = await apiCall(`/vehicles/${vehicleId}`, {
//         method: 'PUT',
//         body: JSON.stringify(updates)
//       });
      
//       // Update local state
//       setVehicleSpeeds(prev => 
//         prev.map(vehicle => 
//           vehicle.vehicleId === vehicleId ? { ...vehicle, ...data.data } : vehicle
//         )
//       );
//       return data.data;
//     } catch (err) {
//       throw err;
//     }
//   }, [apiCall]);

//   // DELETE vehicle
//   const deleteVehicle = useCallback(async (vehicleId) => {
//     try {
//       await apiCall(`/vehicles/${vehicleId}`, {
//         method: 'DELETE'
//       });
      
//       // Update local state immediately
//       setVehicleSpeeds(prev => prev.filter(vehicle => vehicle.vehicleId !== vehicleId));
//       return { success: true, message: 'Vehicle deleted successfully' };
//     } catch (err) {
//       throw err;
//     }
//   }, [apiCall]);

//   const clearError = useCallback(() => {
//     setError(null);
//   }, []);

//   return (
//     <VehicleContext.Provider
//       value={{
//         vehicleSpeeds,
//         vehicleHistory,
//         areaVehicles,
//         isLoading,
//         error,
//         getAllVehicleSpeeds,
//         getVehicleById,
//         getVehicleHistory,
//         getVehiclesInArea,
//         createVehicleSpeed,
//         updateVehicle,
//         deleteVehicle,
//         clearError,
//       }}
//     >
//       {children}
//     </VehicleContext.Provider>
//   );
// };

// export default VehicleContext;


import { createContext, useContext, useState, useCallback } from 'react';

const VehicleContext = createContext();

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};

export const VehicleProvider = ({ children }) => {
  const [vehicleSpeeds, setVehicleSpeeds] = useState([]);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [areaVehicles, setAreaVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const apiCall = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const fullUrl = `${API_BASE}${url}`;
      console.log(`🚀 API Call: ${options.method || 'GET'} ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ API returned non-JSON response:', text.substring(0, 200));
        throw new Error(`API endpoint not found: ${fullUrl}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        // ✅ FIXED: Don't throw error for "Vehicle not found" - let calling function handle it
        if (data.error && data.error.includes('not found')) {
          return data; // Return the data even if it has error for specific handling
        }
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (data.success === false) {
        // ✅ FIXED: Don't throw error for "Vehicle not found" - let calling function handle it
        if (data.error && data.error.includes('not found')) {
          return data; // Return the data even if it has error for specific handling
        }
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      console.error('❌ API Error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  // GET all vehicles
  const getAllVehicleSpeeds = useCallback(async () => {
    try {
      const data = await apiCall('/vehicles');
      setVehicleSpeeds(data.data || []);
      return data.data || [];
    } catch (err) {
      setVehicleSpeeds([]);
      return [];
    }
  }, [apiCall]);

  // GET vehicle by ID
  const getVehicleById = useCallback(async (vehicleId) => {
    try {
      const data = await apiCall(`/vehicles/${vehicleId}`);
      return data.data;
    } catch (err) {
      console.log(`⚠️ Vehicle ${vehicleId} not found`);
      return null;
    }
  }, [apiCall]);

  // ✅ COMPLETELY FIXED: GET vehicle history - NO ERROR THROWING
  const getVehicleHistory = useCallback(async (vehicleId, hours = 24) => {
    if (!vehicleId || vehicleId.trim() === '') {
      console.log('⚠️ Empty vehicle ID provided for history');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`📋 Fetching history for vehicle: ${vehicleId}`);
      const data = await apiCall(`/vehicles/${vehicleId}/history?hours=${hours}`);
      
      // ✅ FIXED: Check if the response indicates "not found" but don't throw error
      if (data.success === false) {
        if (data.error && data.error.includes('not found')) {
          console.log(`ℹ️ No history found for vehicle: ${vehicleId}`);
          setVehicleHistory([]);
          return []; // Return empty array for "not found"
        }
      }
      
      // If we get here, we have valid data
      const history = data.data || [];
      console.log(`✅ Found ${history.length} history records for ${vehicleId}`);
      
      setVehicleHistory(history);
      return history;
    } catch (err) {
      // ✅ FIXED: Handle ALL errors gracefully - NEVER throw from here
      console.log(`ℹ️ No history available for vehicle: ${vehicleId}`);
      setVehicleHistory([]);
      return []; // Always return empty array, never throw
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  // GET vehicles in area
  const getVehiclesInArea = useCallback(async (minLat, maxLat, minLng, maxLng, vehicleType = '') => {
    try {
      let url = `/vehicles/area?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`;
      if (vehicleType) url += `&vehicleType=${vehicleType}`;
      const data = await apiCall(url);
      setAreaVehicles(data.data || []);
      return data.data || [];
    } catch (err) {
      setAreaVehicles([]);
      return [];
    }
  }, [apiCall]);

  // CREATE vehicle speed
  const createVehicleSpeed = useCallback(async (vehicleData) => {
    try {
      const data = await apiCall('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData)
      });
      
      // Update local state immediately
      setVehicleSpeeds(prev => {
        const newVehicle = data.data;
        const exists = prev.find(v => v.vehicleId === newVehicle.vehicleId);
        if (exists) {
          return prev.map(v => v.vehicleId === newVehicle.vehicleId ? newVehicle : v);
        }
        return [...prev, newVehicle];
      });
      
      return data.data;
    } catch (err) {
      throw err;
    }
  }, [apiCall]);

  // UPDATE vehicle
  const updateVehicle = useCallback(async (vehicleId, updates) => {
    try {
      const data = await apiCall(`/vehicles/${vehicleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      // Update local state
      setVehicleSpeeds(prev => 
        prev.map(vehicle => 
          vehicle.vehicleId === vehicleId ? { ...vehicle, ...data.data } : vehicle
        )
      );
      return data.data;
    } catch (err) {
      throw err;
    }
  }, [apiCall]);

  // DELETE vehicle
  const deleteVehicle = useCallback(async (vehicleId) => {
    try {
      await apiCall(`/vehicles/${vehicleId}`, {
        method: 'DELETE'
      });
      
      // Update local state immediately
      setVehicleSpeeds(prev => prev.filter(vehicle => vehicle.vehicleId !== vehicleId));
      return { success: true, message: 'Vehicle deleted successfully' };
    } catch (err) {
      throw err;
    }
  }, [apiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicleSpeeds,
        vehicleHistory,
        areaVehicles,
        isLoading,
        error,
        getAllVehicleSpeeds,
        getVehicleById,
        getVehicleHistory,
        getVehiclesInArea,
        createVehicleSpeed,
        updateVehicle,
        deleteVehicle,
        clearError,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleContext;