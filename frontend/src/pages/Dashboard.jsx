"use client"

import { useContext, useState } from "react"
import TrafficContext from "../context/TrafficContext"
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import axios from "axios"

const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"]

const Dashboard = () => {
  const { trafficData, accidentData, vehicleSpeeds, loading, error } = useContext(TrafficContext)
  const [timeRange, setTimeRange] = useState("24h")
  const [activeView, setActiveView] = useState("overview")

  // Safe data access with defaults
  const safeTrafficData = trafficData || []
  const safeAccidentData = accidentData || []
  const safeVehicleSpeeds = vehicleSpeeds || []

  // Enhanced data calculations with safe access
  const congestionLevels = {
    high: safeTrafficData.filter(item => item?.congestionLevel === "high").length,
    medium: safeTrafficData.filter(item => item?.congestionLevel === "medium").length,
    low: safeTrafficData.filter(item => item?.congestionLevel === "low").length,
  }

  const pieData = [
    { name: "High Congestion", value: congestionLevels.high, color: "#EF4444", level: "high" },
    { name: "Medium Congestion", value: congestionLevels.medium, color: "#F59E0B", level: "medium" },
    { name: "Low Congestion", value: congestionLevels.low, color: "#10B981", level: "low" },
  ]

  const accidentSeverity = {
    high: safeAccidentData.filter(item => item?.severity === "high").length,
    medium: safeAccidentData.filter(item => item?.severity === "medium").length,
    low: safeAccidentData.filter(item => item?.severity === "low").length,
  }

  const accidentPie = [
    { name: "High Severity", value: accidentSeverity.high, color: "#EF4444" },
    { name: "Medium Severity", value: accidentSeverity.medium, color: "#F59E0B" },
    { name: "Low Severity", value: accidentSeverity.low, color: "#10B981" },
  ]

  // Enhanced traffic trend data with realistic patterns
  const trafficTrendData = [
    { time: "00:00", congestion: 15, accidents: 1, speed: 65 },
    { time: "04:00", congestion: 10, accidents: 0, speed: 70 },
    { time: "08:00", congestion: 85, accidents: 8, speed: 25 },
    { time: "12:00", congestion: 70, accidents: 5, speed: 30 },
    { time: "16:00", congestion: 90, accidents: 9, speed: 20 },
    { time: "20:00", congestion: 50, accidents: 3, speed: 45 },
    { time: "24:00", congestion: 20, accidents: 1, speed: 60 },
  ]

  const averageSpeed = safeVehicleSpeeds.length > 0 
    ? (safeVehicleSpeeds.reduce((sum, item) => sum + (item?.speed || 0), 0) / safeVehicleSpeeds.length).toFixed(1)
    : 0

  const totalCongestion = safeTrafficData.length
  const congestionPercentage = totalCongestion > 0 ? {
    high: ((congestionLevels.high / totalCongestion) * 100).toFixed(1),
    medium: ((congestionLevels.medium / totalCongestion) * 100).toFixed(1),
    low: ((congestionLevels.low / totalCongestion) * 100).toFixed(1),
  } : { high: 0, medium: 0, low: 0 }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading traffic dashboard...</p>
      </motion.div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-800/50 backdrop-blur-sm border border-red-600/30 rounded-2xl p-8 max-w-md text-center"
      >
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Error</h2>
        <p className="text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105"
        >
          Retry Connection
        </button>
      </motion.div>
    </div>
  )

  if (safeTrafficData.length === 0 && safeAccidentData.length === 0 && safeVehicleSpeeds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-800/50 backdrop-blur-sm border border-yellow-600/30 rounded-2xl p-8 max-w-md text-center"
        >
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-yellow-300">
            Traffic data is currently being collected. Please check back shortly.
          </p>
        </motion.div>
      </div>
    )
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
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🚦 Bhopal Traffic Intelligence Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time monitoring and analytics for urban traffic management. 
            Track congestion patterns, accident reports, and vehicle movements.
          </p>
        </motion.div>

        {/* Time Range & View Selector */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/30 flex space-x-2">
            {["24h", "7d", "30d", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  timeRange === range 
                    ? "bg-purple-600 shadow-lg" 
                    : "hover:bg-gray-700/50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/30 flex space-x-2">
            {["overview", "analytics", "live"].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all capitalize ${
                  activeView === view 
                    ? "bg-blue-600 shadow-lg" 
                    : "hover:bg-gray-700/50"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Zones</p>
                <p className="text-3xl font-bold">{safeTrafficData.length}</p>
              </div>
              <div className="text-3xl">📍</div>
            </div>
            <div className="mt-2 text-green-400 text-sm">Active monitoring</div>
          </div>

          <div className="bg-red-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">High Congestion</p>
                <p className="text-3xl font-bold">{congestionLevels.high}</p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
            <div className="mt-2 text-red-300 text-sm">{congestionPercentage.high}% of total</div>
          </div>

          <div className="bg-yellow-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Accidents</p>
                <p className="text-3xl font-bold">{safeAccidentData.length}</p>
              </div>
              <div className="text-3xl">🚑</div>
            </div>
            <div className="mt-2 text-yellow-300 text-sm">Requiring attention</div>
          </div>

          <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Avg Speed</p>
                <p className="text-3xl font-bold">{averageSpeed} km/h</p>
              </div>
              <div className="text-3xl">🚗</div>
            </div>
            <div className="mt-2 text-green-300 text-sm">City-wide average</div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <AnimatePresence mode="wait">
          {activeView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            >
              {/* Congestion Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Congestion Distribution</h2>
                  <span className="text-gray-400 text-sm">Real-time</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Accident Severity */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Accident Severity</h2>
                  <span className="text-gray-400 text-sm">Last {timeRange}</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={accidentPie} 
                      dataKey="value" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {accidentPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Traffic Trends - Full Width */}
              <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">24-Hour Traffic Patterns</h2>
                  <span className="text-gray-400 text-sm">Live monitoring</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trafficTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                        border: '1px solid rgba(55, 65, 81, 0.5)',
                        borderRadius: '0.75rem',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="congestion" 
                      stroke="#8B5CF6" 
                      strokeWidth={3} 
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      name="Congestion Level %" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accidents" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      name="Accidents Reported" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Live Data View */}
          {activeView === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🚦 Live Traffic Monitoring</h2>
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600/30">
                      <th className="text-left p-4 text-gray-400 font-semibold">Location</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Congestion Level</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Vehicles</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeTrafficData.map((item, index) => (
                      <motion.tr 
                        key={item._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-600/20 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-4 font-medium">{item?.location || 'Unknown Location'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item?.congestionLevel === "high" 
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : item?.congestionLevel === "medium" 
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-300 border border-green-500/30"
                          }`}>
                            {(item?.congestionLevel || 'low').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              item?.congestionLevel === "high" ? "bg-red-500 animate-pulse" :
                              item?.congestionLevel === "medium" ? "bg-yellow-500" : "bg-green-500"
                            }`}></div>
                            {item?.congestionLevel === "high" ? "Critical" : 
                             item?.congestionLevel === "medium" ? "Moderate" : "Normal"}
                          </div>
                        </td>
                        <td className="p-4">{item?.vehiclesCount || 0}</td>
                        <td className="p-4 text-gray-400 text-sm">{new Date().toLocaleTimeString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          <div className="bg-gray-800/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-400">{safeVehicleSpeeds.length}</p>
            <p className="text-gray-400 text-sm">Vehicles Tracked</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">{congestionLevels.low}</p>
            <p className="text-gray-400 text-sm">Clear Routes</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">{accidentSeverity.medium}</p>
            <p className="text-gray-400 text-sm">Medium Alerts</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{accidentSeverity.high}</p>
            <p className="text-gray-400 text-sm">High Priority</p>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>📊 Real-time Analytics • Bhopal Traffic Management System</p>
          <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard