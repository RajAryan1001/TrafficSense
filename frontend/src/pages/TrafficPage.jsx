// import { useContext, useState } from 'react'
// import TrafficContext from '../context/TrafficContext'
// import { motion } from 'framer-motion'

// const TrafficPage = () => {
//   const { trafficData } = useContext(TrafficContext)
//   const [filter, setFilter] = useState('all')

//   const filteredData = trafficData.filter(item => filter === 'all' || item.congestionLevel === filter)

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }} 
//       animate={{ opacity: 1 }} 
//       exit={{ opacity: 0 }}
//     >
//       <h1 className="text-3xl font-bold mb-8">Traffic Congestion</h1>
//       <div className="mb-4">
//         <select onChange={(e) => setFilter(e.target.value)} className="p-2 bg-gray-800 rounded">
//           <option value="all">All Levels</option>
//           <option value="high">High</option>
//           <option value="medium">Medium</option>
//           <option value="low">Low</option>
//         </select>
//       </div>
//       <div className="space-y-4">
//         {filteredData.map((item, i) => (
//           <div key={i} className="p-4 bg-gray-800 rounded-xl">
//             <h3 className="font-bold">{item.location}</h3>
//             <p>Congestion: {item.congestionLevel}</p>
//             <p>Avg Speed: {item.averageSpeed} km/h</p>
//             <p>Vehicles: {item.vehiclesCount}</p>
//           </div>
//         ))}
//       </div>
//     </motion.div>
//   )
// }

// export default TrafficPage


import { useContext, useState } from 'react'
import TrafficContext from '../context/TrafficContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrafficLight, FaCar, FaClock, FaMapMarkerAlt, FaExclamationTriangle, FaChartLine, FaFilter, FaRoad, FaSearchLocation, FaTachometerAlt } from 'react-icons/fa'

const TrafficPage = () => {
  const { trafficData } = useContext(TrafficContext)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = trafficData.filter(item => 
    (filter === 'all' || item.congestionLevel === filter) &&
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Statistics calculation
  const stats = {
    total: trafficData.length,
    high: trafficData.filter(item => item.congestionLevel === 'high').length,
    medium: trafficData.filter(item => item.congestionLevel === 'medium').length,
    low: trafficData.filter(item => item.congestionLevel === 'low').length,
    avgSpeed: Math.round(trafficData.reduce((acc, item) => acc + item.averageSpeed, 0) / trafficData.length) || 0,
    totalVehicles: trafficData.reduce((acc, item) => acc + item.vehiclesCount, 0)
  }

  const getCongestionColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-300'
    }
  }

  const getCongestionBgColor = (level) => {
    switch (level) {
      case 'high': return 'bg-gradient-to-br from-red-900/40 to-red-700/40 border-red-500/50'
      case 'medium': return 'bg-gradient-to-br from-yellow-900/40 to-yellow-700/40 border-yellow-500/50'
      case 'low': return 'bg-gradient-to-br from-green-900/40 to-green-700/40 border-green-500/50'
      default: return 'bg-gray-800/50 border-gray-600/50'
    }
  }

  const getCongestionIcon = (level) => {
    switch (level) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚫'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-2xl"
          >
            <FaTrafficLight className="text-3xl text-white" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🚦 Live Traffic Intelligence
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time traffic monitoring across <span className="text-blue-300 font-semibold">Bhopal's smart city network</span>. 
            Get instant insights into congestion patterns, vehicle flow, and optimal routes for smarter commuting.
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
        >
          <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-600/30 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-blue-300">{stats.total}</div>
            <div className="text-blue-200">Active Locations</div>
            <div className="text-sm text-blue-400 mt-1">📊 Monitoring</div>
          </div>
          <div className="bg-red-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-red-300">{stats.high}</div>
            <div className="text-red-200">High Congestion</div>
            <div className="text-sm text-red-400 mt-1">🚨 Critical</div>
          </div>
          <div className="bg-yellow-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-600/30 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-yellow-300">{stats.medium}</div>
            <div className="text-yellow-200">Medium Flow</div>
            <div className="text-sm text-yellow-400 mt-1">⚠️ Moderate</div>
          </div>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-600/30 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-green-300">{stats.low}</div>
            <div className="text-green-200">Smooth Traffic</div>
            <div className="text-sm text-green-400 mt-1">✅ Clear</div>
          </div>
          <div className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 text-center hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-purple-300">{stats.avgSpeed}</div>
            <div className="text-purple-200">Avg Speed</div>
            <div className="text-sm text-purple-400 mt-1">💨 km/h</div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <FaSearchLocation className="text-purple-400" />
                Traffic Data Explorer
              </h2>
              <p className="text-gray-400">
                Filter and search through real-time traffic conditions. {stats.total > 0 ? 
                `Currently monitoring ${stats.total} locations across the city.` : 
                'Awaiting traffic data feed...'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search locations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full lg:w-64"
                />
                <FaSearchLocation className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-3 bg-gray-700/30 px-4 rounded-xl border border-gray-600/50">
                <FaFilter className="text-purple-400" />
                <select 
                  onChange={(e) => setFilter(e.target.value)} 
                  className="p-2 bg-transparent border-none text-white focus:outline-none focus:ring-0"
                  value={filter}
                >
                  <option value="all">🌐 All Levels</option>
                  <option value="high">🔴 High Only</option>
                  <option value="medium">🟡 Medium Only</option>
                  <option value="low">🟢 Low Only</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Traffic Data Grid */}
        <AnimatePresence>
          {filteredData.length > 0 ? (
            <motion.div 
              key="traffic-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredData.map((item, index) => (
                <motion.div 
                  key={item._id || index}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${getCongestionBgColor(item.congestionLevel)}`}
                >
                  {/* Location Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getCongestionIcon(item.congestionLevel)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white truncate max-w-[150px]">
                          {item.location}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-red-400" />
                          {item.coordinates?.lat?.toFixed(4)}, {item.coordinates?.lng?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCongestionColor(item.congestionLevel)} bg-black/30 backdrop-blur-sm`}>
                      {item.congestionLevel.toUpperCase()}
                    </span>
                  </div>

                  {/* Traffic Metrics */}
                  <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-300 flex items-center gap-2">
                        <FaTachometerAlt className="text-blue-400" />
                        Average Speed
                      </span>
                      <span className="font-bold text-white">{item.averageSpeed} km/h</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-300 flex items-center gap-2">
                        <FaCar className="text-green-400" />
                        Vehicle Count
                      </span>
                      <span className="font-bold text-white">{item.vehiclesCount}</span>
                    </div>
                  </div>

                  {/* Congestion Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Traffic Flow:</span>
                      <span className={getCongestionColor(item.congestionLevel)}>
                        {item.congestionLevel === 'high' ? 'Heavy Congestion' : 
                         item.congestionLevel === 'medium' ? 'Moderate Flow' : 'Smooth Sailing'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          item.congestionLevel === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                          item.congestionLevel === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                          'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{
                          width: item.congestionLevel === 'high' ? '95%' : 
                                 item.congestionLevel === 'medium' ? '65%' : '35%'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Message */}
                  {item.congestionLevel === 'high' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg border border-red-500/30"
                    >
                      <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-200">
                        🚨 Expect significant delays. Consider alternative routes.
                      </span>
                    </motion.div>
                  )}
                  
                  {item.congestionLevel === 'medium' && (
                    <div className="text-center p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <span className="text-sm text-yellow-300">
                        ⚠️ Moderate traffic flow. Plan some extra time.
                      </span>
                    </div>
                  )}
                  
                  {item.congestionLevel === 'low' && (
                    <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-sm text-green-300">
                        ✅ Clear roads ahead! Perfect driving conditions.
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/30"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4"
              >
                🚦
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">No Traffic Data Available</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchTerm || filter !== 'all' 
                  ? "No locations match your current filters. Try adjusting your search or filter criteria."
                  : "The traffic monitoring system is currently initializing. Live data will appear here shortly."
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSearchTerm(''); setFilter('all'); }}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time Info Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
            <p className="flex items-center justify-center gap-2">
              <FaClock className="text-purple-400" />
              <span>Live data updates every 30 seconds • Last refresh: {new Date().toLocaleTimeString()}</span>
            </p>
            <p className="mt-1 text-xs">
              🟢 Smooth (0-30% congestion) • 🟡 Moderate (31-70% congestion) • 🔴 Heavy (71-100% congestion)
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TrafficPage