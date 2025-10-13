import { useContext, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useVehicle } from '../context/VehicleContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaCar, FaTachometerAlt, FaMapMarkerAlt, FaClock, FaHistory, FaChartLine, FaRoute, FaExclamationTriangle } from 'react-icons/fa'

const VehicleHistoryPage = () => {
 const { vehicleHistory, getVehicleHistory, error, clearError, isLoading } = useVehicle();
  const { vehicleId } = useParams()
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    console.log('🔍 VehicleHistoryPage Debug:')
    console.log('vehicleId:', vehicleId)
    console.log('vehicleHistory:', vehicleHistory)
    console.log('vehicleHistory length:', vehicleHistory?.length)
    console.log('getVehicleHistory function:', typeof getVehicleHistory)

    setDebugInfo(`Vehicle: ${vehicleId}, Records: ${vehicleHistory?.length || 0}`)

    if (vehicleId && getVehicleHistory && typeof getVehicleHistory === 'function') {
      console.log('🚀 Calling getVehicleHistory...')
      getVehicleHistory(vehicleId)
        .then(result => {
          console.log('✅ getVehicleHistory result:', result)
          console.log('✅ Number of records:', result?.length)
        })
        .catch(err => {
          console.error('❌ getVehicleHistory error:', err)
        })
    }
  }, [vehicleId, getVehicleHistory, vehicleHistory])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-bold mb-2">Loading Vehicle History</h2>
          <p className="text-gray-400">Fetching data for vehicle #{vehicleId}</p>
        </motion.div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/traffic" 
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-6"
          >
            <FaArrowLeft />
            Back to Traffic Overview
          </Link>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-800/50 backdrop-blur-sm rounded-2xl p-8 border border-red-600/30 text-center"
          >
            <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Error Loading Vehicle History</h1>
            <p className="text-red-200 mb-4">{error}</p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Check if we have data to display
  const hasData = vehicleHistory && vehicleHistory.length > 0
  const displayData = hasData ? vehicleHistory : []

  const chartData = displayData.map((hist) => ({
    time: new Date(hist.timestamp).toLocaleTimeString(),
    speed: hist.speed,
    timestamp: hist.timestamp,
    location: hist.location
  }))

  // Calculate statistics
  const stats = {
    totalRecords: displayData.length,
    avgSpeed: displayData.length > 0 
      ? Math.round(displayData.reduce((acc, hist) => acc + hist.speed, 0) / displayData.length)
      : 0,
    maxSpeed: displayData.length > 0 
      ? Math.max(...displayData.map(hist => hist.speed))
      : 0,
    minSpeed: displayData.length > 0 
      ? Math.min(...displayData.map(hist => hist.speed))
      : 0
  }

  // Get speed status color
  const getSpeedColor = (speed) => {
    if (speed >= 80) return 'text-green-400'
    if (speed >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get speed status label
  const getSpeedStatus = (speed) => {
    if (speed >= 80) return 'Optimal'
    if (speed >= 50) return 'Moderate'
    return 'Slow'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Debug Info - Remove in production */}
        <div className="bg-yellow-900/50 p-3 rounded-lg mb-4 text-xs">
          <strong>Debug Info:</strong> {debugInfo}
          {!hasData && (
            <span className="text-yellow-300 ml-2">• No data found for this vehicle</span>
          )}
        </div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <Link 
            to="/traffic" 
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-4 transition-colors text-sm md:text-base"
          >
            <FaArrowLeft />
            Back to Traffic Overview
          </Link>
          
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="p-3 md:p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl"
            >
              <FaCar className="text-2xl md:text-3xl" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Vehicle History Analysis
              </h1>
              <p className="text-gray-300 mt-1 md:mt-2 text-sm md:text-base">
                Tracking vehicle <span className="font-semibold text-blue-300">#{vehicleId}</span>
                {hasData && (
                  <span className="text-green-400 ml-2">• {displayData.length} records found</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Show message if no data */}
        {!hasData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-600/30 mb-6 text-center"
          >
            <FaHistory className="text-4xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Historical Data Available</h2>
            <p className="text-yellow-200 mb-4">
              No tracking records found for vehicle <strong>#{vehicleId}</strong>
            </p>
            <div className="text-sm text-gray-300 space-y-1">
              <p>This could be because:</p>
              <ul className="text-left max-w-md mx-auto">
                <li>• The vehicle is new and has no history yet</li>
                <li>• No speed data has been recorded for this vehicle</li>
                <li>• The vehicle ID doesn't exist in the database</li>
              </ul>
            </div>
            <div className="mt-4">
              <Link 
                to="/area-vehicles"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaArrowLeft />
                Back to Area Search
              </Link>
            </div>
          </motion.div>
        )}

        {/* Only show content if we have data */}
        {hasData && (
          <>
            {/* Statistics Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8"
            >
              <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-blue-600/30 text-center">
                <div className="text-xl md:text-3xl font-bold text-blue-300">{stats.totalRecords}</div>
                <div className="text-blue-200 text-xs md:text-base">Total Records</div>
                <div className="text-xs md:text-sm text-blue-400 mt-1">📊 Data Points</div>
              </div>
              <div className="bg-green-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-green-600/30 text-center">
                <div className="text-xl md:text-3xl font-bold text-green-300">{stats.avgSpeed}</div>
                <div className="text-green-200 text-xs md:text-base">Average Speed</div>
                <div className="text-xs md:text-sm text-green-400 mt-1">💨 km/h</div>
              </div>
              <div className="bg-purple-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-purple-600/30 text-center">
                <div className="text-xl md:text-3xl font-bold text-purple-300">{stats.maxSpeed}</div>
                <div className="text-purple-200 text-xs md:text-base">Max Speed</div>
                <div className="text-xs md:text-sm text-purple-400 mt-1">🚀 Peak</div>
              </div>
              <div className="bg-yellow-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-yellow-600/30 text-center">
                <div className="text-xl md:text-3xl font-bold text-yellow-300">{stats.minSpeed}</div>
                <div className="text-yellow-200 text-xs md:text-base">Min Speed</div>
                <div className="text-xs md:text-sm text-yellow-400 mt-1">🐢 Lowest</div>
              </div>
            </motion.div>

            {/* Speed Chart Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/30 mb-6 md:mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FaTachometerAlt className="text-blue-400" />
                  Speed History Chart
                </h2>
                <div className="text-xs md:text-sm text-gray-400">
                  Last updated: {new Date(displayData[0].timestamp).toLocaleString()}
                </div>
              </div>
              
              <div className="h-64 md:h-80 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(55, 65, 81, 0.5)',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#60A5FA' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Detailed History Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <FaRoute className="text-purple-400" />
                Detailed Travel History
              </h2>

              <div className="space-y-3 md:space-y-4">
                {displayData.map((hist, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                          <div className={`text-lg md:text-2xl font-bold ${getSpeedColor(hist.speed)}`}>
                            {hist.speed} km/h
                          </div>
                          <span className="px-2 md:px-3 py-1 bg-gray-700/50 rounded-full text-xs md:text-sm">
                            {getSpeedStatus(hist.speed)}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FaClock className="text-blue-400" />
                            <span>{new Date(hist.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <FaMapMarkerAlt className="text-green-400" />
                            <span>{hist.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 bg-black/30 px-2 md:px-3 py-1 md:py-2 rounded-lg mt-2 lg:mt-0">
                        Record #{i + 1}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default VehicleHistoryPage