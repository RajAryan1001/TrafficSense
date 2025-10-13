import { useContext, useState } from 'react'
import TrafficContext from '../context/TrafficContext'
import { motion, AnimatePresence } from 'framer-motion'

const AccidentsPage = () => {
  const { accidentData } = useContext(TrafficContext)
  const [filter, setFilter] = useState('all')

  // Safe data access with defaults
  const safeAccidentData = accidentData || []

  const filteredData = safeAccidentData.filter(item => 
    item && (filter === 'all' || item.severity === filter)
  )

  const severityStats = {
    high: safeAccidentData.filter(item => item && item.severity === 'high').length,
    medium: safeAccidentData.filter(item => item && item.severity === 'medium').length,
    low: safeAccidentData.filter(item => item && item.severity === 'low').length,
    total: safeAccidentData.length
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return 'Critical - Immediate attention required'
      case 'medium': return 'Moderate - Monitor closely'
      case 'low': return 'Minor - Routine response'
      default: return 'Unknown severity'
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
        {/* Header Section - Matching gradient */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🚨 Traffic Accident Reports
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time monitoring of traffic incidents across the city. Stay informed about road safety issues 
            and help us build safer communities together.
          </p>
        </motion.div>

        {/* Statistics Cards - Exact same styling */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-600/30 text-center">
            <div className="text-3xl font-bold">{severityStats.total}</div>
            <div className="text-blue-300">Total Incidents</div>
          </div>
          <div className="bg-red-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30 text-center">
            <div className="text-3xl font-bold">{severityStats.high}</div>
            <div className="text-red-300">High Severity</div>
          </div>
          <div className="bg-yellow-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-600/30 text-center">
            <div className="text-3xl font-bold">{severityStats.medium}</div>
            <div className="text-yellow-300">Medium Severity</div>
          </div>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-600/30 text-center">
            <div className="text-3xl font-bold">{severityStats.low}</div>
            <div className="text-green-300">Low Severity</div>
          </div>
        </motion.div>

        {/* Filter Section - Matching card style */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Filter Incidents</h2>
              <p className="text-gray-400">View incidents based on severity level to prioritize response efforts</p>
            </div>
            <select 
              onChange={(e) => setFilter(e.target.value)} 
              className="p-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
            >
              <option value="all">📊 All Severities</option>
              <option value="high">🔴 High Severity</option>
              <option value="medium">🟡 Medium Severity</option>
              <option value="low">🟢 Low Severity</option>
            </select>
          </div>
        </motion.div>

        {/* Incident Cards - Matching grid and card styling */}
        <AnimatePresence mode="wait">
          {filteredData.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/30"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold mb-2">No Incidents Found</h3>
              <p className="text-gray-400">
                {filter === 'all' ? 'No accident data available.' : 'No incidents match your current filter.'}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredData.map((acc, index) => (
                  <motion.div 
                    key={acc?._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`p-6 rounded-2xl backdrop-blur-sm border-2 ${
                      acc?.severity === 'high' 
                        ? 'bg-gradient-to-br from-red-900/60 to-red-700/60 border-red-500/50' 
                        : acc?.severity === 'medium' 
                        ? 'bg-gradient-to-br from-yellow-900/60 to-yellow-700/60 border-yellow-500/50' 
                        : 'bg-gradient-to-br from-green-900/60 to-green-700/60 border-green-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{acc?.location || 'Unknown Location'}</h3>
                      <span className="text-2xl">{getSeverityIcon(acc?.severity)}</span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-300">Description:</span>
                        <p className="text-white mt-1">{acc?.description || 'No description available'}</p>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Severity:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          acc?.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                          acc?.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {(acc?.severity || 'unknown').toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-300">Status:</span>
                        <p className="text-white mt-1">{getSeverityText(acc?.severity)}</p>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-600/30">
                        <span className="text-gray-300">Reported:</span>
                        <p className="text-white mt-1">
                          {acc?.timestamp ? new Date(acc.timestamp).toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Note - Matching style */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>🚨 For emergencies, please contact local authorities immediately</p>
          <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AccidentsPage