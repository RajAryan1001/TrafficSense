import { useContext, useState } from 'react'
import { useVehicle } from '../context/VehicleContext';
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearchLocation, FaCar, FaMapMarkerAlt, FaCompass, FaRulerCombined, FaSatellite, FaTrafficLight, FaCrosshairs, FaHistory, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const AreaVehiclesPage = () => {
  const { getVehiclesInArea, areaVehicles, error, clearError, getVehicleHistory } = useVehicle();
  const [minLat, setMinLat] = useState(23.20)
  const [maxLat, setMaxLat] = useState(23.30)
  const [minLng, setMinLng] = useState(77.35)
  const [maxLng, setMaxLng] = useState(77.50)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const navigate = useNavigate();
  
  // Toast notifications state
  const [toasts, setToasts] = useState([])

  // Safe data access with defaults
  const safeAreaVehicles = areaVehicles || []

  // Toast notification functions
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    const toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getToastBgColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/90 border-green-400'
      case 'error': return 'bg-red-500/90 border-red-400'
      case 'info': return 'bg-blue-500/90 border-blue-400'
      case 'warning': return 'bg-yellow-500/90 border-yellow-400'
      default: return 'bg-gray-500/90 border-gray-400'
    }
  }

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      case 'warning': return '⚠️'
      default: return '💡'
    }
  }

  // Handle viewing vehicle history with proper error handling
  const handleViewHistory = async (vehicleId) => {
    if (!vehicleId) {
      showToast('Vehicle ID is required', 'error');
      return;
    }

    try {
      showToast(`Loading history for ${vehicleId}...`, 'info');
      
      // Try to get vehicle history first
      const history = await getVehicleHistory(vehicleId);
      
      if (history && history.length > 0) {
        // If history exists, navigate to history page
        navigate(`/vehicle-history/${vehicleId}`);
        showToast(`History loaded for ${vehicleId}`, 'success');
      } else {
        // If no history, show message
        showToast(`No history available for ${vehicleId}`, 'warning');
      }
    } catch (err) {
      console.error('Error viewing history:', err);
      showToast(`Cannot load history for ${vehicleId}`, 'error');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSearching(true)
    setSearchError(null)
    clearError()
    
    try {
      console.log('📍 Starting area search with coordinates:', {
        minLat: parseFloat(minLat),
        maxLat: parseFloat(maxLat),
        minLng: parseFloat(minLng),
        maxLng: parseFloat(maxLng)
      })
      
      await getVehiclesInArea(
        parseFloat(minLat), 
        parseFloat(maxLat), 
        parseFloat(minLng), 
        parseFloat(maxLng)
      )
      
      console.log('✅ Area search completed successfully')
      showToast(`Found ${safeAreaVehicles.length} vehicles in the area!`, 'success')
    } catch (err) {
      console.error('❌ Area search failed:', err.message)
      setSearchError(err.message)
      showToast(`Search failed: ${err.message}`, 'error')
    } finally {
      setIsSearching(false)
    }
  }

  // Calculate area statistics with safe access
  const areaStats = {
    totalVehicles: safeAreaVehicles.length,
    avgSpeed: safeAreaVehicles.length > 0 
      ? Math.round(safeAreaVehicles.reduce((acc, veh) => acc + (veh?.currentSpeed || 0), 0) / safeAreaVehicles.length)
      : 0,
    areaSize: ((maxLat - minLat) * (maxLng - minLng) * 111 * 111).toFixed(2) // Approximate area in sq km
  }

  // Get speed color
  const getSpeedColor = (speed) => {
    const safeSpeed = speed || 0
    if (safeSpeed >= 60) return 'text-green-400'
    if (safeSpeed >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get speed status
  const getSpeedStatus = (speed) => {
    const safeSpeed = speed || 0
    if (safeSpeed >= 60) return 'Fast'
    if (safeSpeed >= 30) return 'Moderate'
    return 'Slow'
  }

  // Reset search
  const handleReset = () => {
    setMinLat(23.20)
    setMaxLat(23.30)
    setMinLng(77.35)
    setMaxLng(77.50)
    setSearchError(null)
    clearError()
    showToast('Search area reset to default', 'info')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 text-white p-4 md:p-6 relative"
    >
      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring" }}
              className={`${getToastBgColor(toast.type)} backdrop-blur-sm text-white p-4 rounded-xl border shadow-lg flex items-center gap-3`}
            >
              <span className="text-lg">{getToastIcon(toast.type)}</span>
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-4 shadow-2xl"
          >
            <FaSatellite className="text-2xl md:text-3xl text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            🗺️ Area Vehicle Tracker
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Explore real-time vehicle density and movement patterns across specific geographical areas of{' '}
            <span className="text-green-300 font-semibold">Bhopal Smart City</span>. 
            Monitor traffic flow, identify congestion hotspots, and analyze mobility patterns.
          </p>
        </motion.div>

        {/* Error Display */}
        {(error || searchError) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-600/30 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-300">Search Error</h3>
                  <p className="text-red-200 text-sm">{error || searchError}</p>
                </div>
              </div>
              <button 
                onClick={() => { clearError(); setSearchError(null); }}
                className="text-red-300 hover:text-red-100 text-lg"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/30 mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaSearchLocation className="text-2xl text-green-400" />
            <h2 className="text-2xl font-bold">Define Search Area</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-300">
                <FaCompass className="text-blue-400" />
                How It Works
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Enter geographical coordinates to define a rectangular search area. Our system will scan and display 
                all active vehicles within the specified boundaries. Perfect for traffic analysis, event monitoring, 
                and urban planning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-300">
                <FaRulerCombined className="text-purple-400" />
                Area Specifications
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Current area covers approximately <strong>{areaStats.areaSize} km²</strong>. 
                Coordinates should be within Bhopal's metropolitan area (Lat: 23.10-23.40, Lng: 77.25-77.55).
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  Min Latitude
                </label>
                <input 
                  type="number" 
                  value={minLat} 
                  onChange={(e) => setMinLat(e.target.value)} 
                  step="0.0001"
                  min="23.10"
                  max="23.40"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  Max Latitude
                </label>
                <input 
                  type="number" 
                  value={maxLat} 
                  onChange={(e) => setMaxLat(e.target.value)} 
                  step="0.0001"
                  min="23.10"
                  max="23.40"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-400" />
                  Min Longitude
                </label>
                <input 
                  type="number" 
                  value={minLng} 
                  onChange={(e) => setMinLng(e.target.value)} 
                  step="0.0001"
                  min="77.25"
                  max="77.55"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-400" />
                  Max Longitude
                </label>
                <input 
                  type="number" 
                  value={maxLng} 
                  onChange={(e) => setMaxLng(e.target.value)} 
                  step="0.0001"
                  min="77.25"
                  max="77.55"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSearching}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSearching ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Scanning Area...
                  </>
                ) : (
                  <>
                    <FaCrosshairs className="text-lg" />
                    Search Defined Area
                  </>
                )}
              </motion.button>
              
              <motion.button 
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 bg-gray-700 text-white p-4 rounded-lg font-bold hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                🔄 Reset
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Statistics Cards */}
        {safeAreaVehicles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
          >
            <div className="bg-green-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-600/30 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-300">{areaStats.totalVehicles}</div>
              <div className="text-green-200 text-sm md:text-base">Vehicles Found</div>
              <div className="text-xs md:text-sm text-green-400 mt-1">🚗 Active in Area</div>
            </div>
            <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-600/30 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-300">{areaStats.avgSpeed}</div>
              <div className="text-blue-200 text-sm md:text-base">Average Speed</div>
              <div className="text-xs md:text-sm text-blue-400 mt-1">💨 km/h</div>
            </div>
            <div className="bg-purple-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-600/30 text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-300">{areaStats.areaSize}</div>
              <div className="text-purple-200 text-sm md:text-base">Area Size</div>
              <div className="text-xs md:text-sm text-purple-400 mt-1">📏 km²</div>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FaCar className="text-green-400" />
              Vehicles in Selected Area
            </h2>
            <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm">
              {safeAreaVehicles.length} vehicles
            </span>
          </div>

          {safeAreaVehicles.length > 0 ? (
            <>
              <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                Discovered <strong>{safeAreaVehicles.length} active vehicles</strong> within the specified coordinates. 
                Each vehicle is tracked in real-time with current speed and location data.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {safeAreaVehicles.map((veh, index) => (
                  <motion.div 
                    key={veh?.vehicleId || `vehicle-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/30 hover:border-green-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-white truncate">
                        {veh?.vehicleId || 'Unknown Vehicle'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSpeedColor(veh?.currentSpeed)} bg-black/30`}>
                        {getSpeedStatus(veh?.currentSpeed)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-2 text-sm">
                          <FaTrafficLight className="text-blue-400" />
                          Speed
                        </span>
                        <span className={`font-bold ${getSpeedColor(veh?.currentSpeed)}`}>
                          {veh?.currentSpeed || 0} km/h
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-2 text-sm">
                          <FaMapMarkerAlt className="text-red-400" />
                          Location
                        </span>
                        <span className="text-white text-sm text-right max-w-[120px] truncate">
                          {veh?.location || 'Tracking...'}
                        </span>
                      </div>

                      {/* View History Button */}
                      <div className="pt-2 border-t border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Last updated: {veh?.timestamp ? new Date(veh.timestamp).toLocaleTimeString() : 'Recent'}
                          </span>
                          <button
                            onClick={() => handleViewHistory(veh?.vehicleId)}
                            className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors duration-200"
                          >
                            <FaHistory className="text-xs" />
                            History
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 md:py-16 bg-gray-800/30 rounded-xl md:rounded-2xl border border-gray-700/30"
            >
              <FaSearchLocation className="text-5xl md:text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold mb-3">No Vehicles Found</h3>
              <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base mb-4">
                {isSearching 
                  ? "Scanning the specified area for active vehicles..."
                  : "Enter coordinates and click 'Search Defined Area' to discover vehicles in that region."
                }
              </p>
              <div className="text-xs text-gray-500">
                💡 Tip: Try expanding your search area or checking different coordinates
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer Information */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 md:mt-8 text-center text-gray-400 text-xs md:text-sm"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/30">
            <p className="flex items-center justify-center gap-2 mb-1 md:mb-2">
              <FaSatellite className="text-green-400" />
              <span>Real-time vehicle tracking powered by GPS and IoT sensors</span>
            </p>
            <p className="text-xs">
              Coverage: Bhopal Metropolitan Area • Update Frequency: 30 seconds • Accuracy: ±10 meters
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AreaVehiclesPage