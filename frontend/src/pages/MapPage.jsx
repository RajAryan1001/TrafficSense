import { useContext, useState } from 'react'
import TrafficContext from '../context/TrafficContext'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { motion, AnimatePresence } from 'framer-motion'

const containerStyle = { 
  width: '100%', 
  height: '600px',
  borderRadius: '16px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
}

const center = { lat: 23.2599, lng: 77.4126 }

const MapPage = () => {
  const { trafficData, accidentData, vehicleSpeeds, loading, error, refetch } = useContext(TrafficContext)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [showTraffic, setShowTraffic] = useState(true)
  const [showAccidents, setShowAccidents] = useState(true)
  const [showVehicles, setShowVehicles] = useState(true)
  const [mapStyle, setMapStyle] = useState('standard')

  // Safe data access with defaults
  const safeTrafficData = trafficData || []
  const safeAccidentData = accidentData || []
  const safeVehicleSpeeds = vehicleSpeeds || []

  console.log('Map - trafficData:', safeTrafficData.length, 'accidents:', safeAccidentData.length, 'vehicles:', safeVehicleSpeeds.length)

  const getTrafficIcon = (level) => {
    const l = level?.toLowerCase()
    if (l === 'high') return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    if (l === 'medium') return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    if (l === 'low') return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  }

  const getAccidentIcon = (severity) => {
    if (severity === 'high') return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    if (severity === 'medium') return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
  }

  const mapStyles = {
    standard: 'roadmap',
    dark: 'dark',
    satellite: 'satellite',
    light: 'light'
  }

  // Safe filtering with null checks
  const validTraffic = safeTrafficData.filter(item => 
    item && 
    item.coordinates && 
    typeof item.coordinates.lat === 'number' && 
    typeof item.coordinates.lng === 'number'
  )
  
  const validAccidents = safeAccidentData.filter(item => 
    item && 
    item.coordinates && 
    typeof item.coordinates.lat === 'number' && 
    typeof item.coordinates.lng === 'number'
  )
  
  const validVehicles = safeVehicleSpeeds.filter(item => 
    item && 
    item.coordinates && 
    typeof item.coordinates.lat === 'number' && 
    typeof item.coordinates.lng === 'number'
  )

  const totalMarkers = validTraffic.length + validAccidents.length + validVehicles.length

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white">Loading Live Traffic Data...</h2>
        <p className="text-gray-400 mt-2">Gathering real-time information from across the city</p>
      </div>
    </motion.div>
  )

  if (error) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-red-900 flex items-center justify-center p-8"
    >
      <div className="text-center bg-red-800/50 backdrop-blur-sm rounded-2xl p-8 border border-red-600/30">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
        <p className="text-red-200 mb-6">{error}</p>
        <button 
          onClick={refetch} 
          className="bg-white text-red-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
        >
          🔄 Retry Connection
        </button>
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            🗺️ Live Traffic Intelligence Map
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Real-time monitoring of traffic flow, incidents, and vehicle movements across the city. 
            Make informed decisions with our comprehensive traffic analytics platform.
          </p>
        </motion.div>

        {/* Statistics Bar */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-blue-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-600/30 text-center">
            <div className="text-2xl font-bold">{totalMarkers}</div>
            <div className="text-blue-300 text-sm">Total Live Markers</div>
          </div>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-600/30 text-center">
            <div className="text-2xl font-bold">{validTraffic.length}</div>
            <div className="text-green-300 text-sm">Traffic Points</div>
          </div>
          <div className="bg-red-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-600/30 text-center">
            <div className="text-2xl font-bold">{validAccidents.length}</div>
            <div className="text-red-300 text-sm">Active Incidents</div>
          </div>
          <div className="bg-purple-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-600/30 text-center">
            <div className="text-2xl font-bold">{validVehicles.length}</div>
            <div className="text-purple-300 text-sm">Tracked Vehicles</div>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Map Controls</h2>
              <p className="text-gray-400">Toggle layers and customize your view</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-lg">
                  <input type="checkbox" checked={showTraffic} onChange={e => setShowTraffic(e.target.checked)} className="w-4 h-4" />
                  <span>🚦 Traffic Flow</span>
                </label>
                
                <label className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-lg">
                  <input type="checkbox" checked={showAccidents} onChange={e => setShowAccidents(e.target.checked)} className="w-4 h-4" />
                  <span>🚨 Incidents</span>
                </label>
                
                <label className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-lg">
                  <input type="checkbox" checked={showVehicles} onChange={e => setShowVehicles(e.target.checked)} className="w-4 h-4" />
                  <span>🚗 Vehicles</span>
                </label>
              </div>
              
              <select 
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">🗺️ Standard Map</option>
                <option value="dark">🌙 Dark Mode</option>
                <option value="satellite">🛰️ Satellite</option>
                <option value="light">💡 Light Mode</option>
              </select>
              
              <button 
                onClick={refetch} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mb-8"
        >
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Traffic/Accidents</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Medium Severity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low Traffic/Normal</span>
            </div>
          </div>

          {totalMarkers === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl p-16 text-center border border-gray-700/30">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-2xl font-bold mb-2">Awaiting Live Data</h3>
              <p className="text-gray-400 mb-4">No real-time markers available. This could be due to:</p>
              <ul className="text-gray-400 text-left max-w-md mx-auto space-y-2">
                <li>• TomTom API quota limitations</li>
                <li>• Temporary service interruption</li>
                <li>• No active incidents in monitored areas</li>
              </ul>
              <button 
                onClick={refetch} 
                className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Try Refreshing Data
              </button>
            </div>
          ) : (
            <GoogleMap 
              mapContainerStyle={containerStyle} 
              center={center} 
              zoom={12}
              options={{
                styles: mapStyle === 'dark' ? [
                  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                ] : [],
                mapTypeId: mapStyles[mapStyle]
              }}
            >
              {/* Accident Markers */}
              {showAccidents && validAccidents.map((acc, i) => (
                <Marker 
                  key={`acc-${i}`} 
                  position={{ lat: acc.coordinates.lat, lng: acc.coordinates.lng }} 
                  icon={{ url: getAccidentIcon(acc.severity) }}
                  onClick={() => setSelectedMarker({ type: 'accident', data: acc })}
                />
              ))}

              {/* Traffic Markers */}
              {showTraffic && validTraffic.map((traf, i) => (
                <Marker 
                  key={`traf-${i}`} 
                  position={{ lat: traf.coordinates.lat, lng: traf.coordinates.lng }} 
                  icon={{ url: getTrafficIcon(traf.congestionLevel) }}
                  onClick={() => setSelectedMarker({ type: 'traffic', data: traf })}
                />
              ))}

              {/* Vehicle Markers */}
              {showVehicles && validVehicles.map((veh, i) => (
                <Marker 
                  key={`veh-${i}`} 
                  position={{ lat: veh.coordinates.lat, lng: veh.coordinates.lng }} 
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                  onClick={() => setSelectedMarker({ type: 'vehicle', data: veh })}
                />
              ))}

              {/* Info Window */}
              <AnimatePresence>
                {selectedMarker && (
                  <InfoWindow 
                    position={{ 
                      lat: selectedMarker.data?.coordinates?.lat || center.lat, 
                      lng: selectedMarker.data?.coordinates?.lng || center.lng 
                    }} 
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="p-3 min-w-[200px] bg-white text-black rounded-lg shadow-xl"
                    >
                      <div className="font-bold text-lg mb-2 border-b pb-2">
                        {selectedMarker.type === 'accident' && '🚨 Traffic Incident'}
                        {selectedMarker.type === 'traffic' && '🚦 Traffic Update'}
                        {selectedMarker.type === 'vehicle' && '🚗 Vehicle Info'}
                      </div>
                      
                      {selectedMarker.type === 'accident' && (
                        <div>
                          <p><strong>Location:</strong> {selectedMarker.data?.location || 'Unknown Location'}</p>
                          <p><strong>Severity:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              selectedMarker.data?.severity === 'high' ? 'bg-red-100 text-red-800' :
                              selectedMarker.data?.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {(selectedMarker.data?.severity || 'low').toUpperCase()}
                            </span>
                          </p>
                          <p><strong>Reported:</strong> {new Date(selectedMarker.data?.timestamp || Date.now()).toLocaleTimeString()}</p>
                        </div>
                      )}
                      
                      {selectedMarker.type === 'traffic' && (
                        <div>
                          <p><strong>Location:</strong> {selectedMarker.data?.location || 'Unknown Location'}</p>
                          <p><strong>Congestion:</strong> {selectedMarker.data?.congestionLevel || 'unknown'}</p>
                          <p><strong>Avg Speed:</strong> {selectedMarker.data?.averageSpeed || 0} km/h</p>
                          <p><strong>Vehicles:</strong> {selectedMarker.data?.vehiclesCount || 0}</p>
                        </div>
                      )}
                      
                      {selectedMarker.type === 'vehicle' && (
                        <div>
                          <p><strong>Vehicle ID:</strong> {selectedMarker.data?.vehicleId || 'Unknown'}</p>
                          <p><strong>Speed:</strong> {selectedMarker.data?.currentSpeed || 0} km/h</p>
                          <p><strong>Status:</strong> {(selectedMarker.data?.currentSpeed || 0) > 80 ? '🚨 Speeding' : '✅ Normal'}</p>
                        </div>
                      )}
                    </motion.div>
                  </InfoWindow>
                )}
              </AnimatePresence>
            </GoogleMap>
          )}
        </motion.div>

        {/* Footer Information */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-400 text-sm bg-gray-800/30 rounded-2xl p-6 border border-gray-700/30"
        >
          <p className="font-semibold mb-2">📊 Real-time Traffic Analytics Platform</p>
          <p>Data updates every 2 minutes • Last refresh: {new Date().toLocaleString()} • Map center: Bhopal, India (23.2599°N, 77.4126°E)</p>
          <p className="mt-2">For emergency services, contact local authorities immediately</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MapPage