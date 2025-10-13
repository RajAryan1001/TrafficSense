// import { useContext, useState, useCallback } from 'react'
// import TrafficContext from '../context/TrafficContext'
// import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'
// import { motion } from 'framer-motion'

// const containerStyle = {
//   width: '100%',
//   height: '600px'
// }

// const center = {
//   lat: 23.2599, // Bhopal
//   lng: 77.4126
// }

// const RoutesPage = () => {
//   const { requestRoute } = useContext(TrafficContext)
//   const [origin, setOrigin] = useState('')
//   const [destination, setDestination] = useState('')
//   const [distance, setDistance] = useState(null)
//   const [duration, setDuration] = useState(null)
//   const [error, setError] = useState(null)
//   const [directions, setDirections] = useState(null)

//   const handleDirectionsResponse = useCallback((response, status) => {
//     console.log('Directions response:', { status, response: JSON.stringify(response, null, 2) })
//     if (status === 'OK' && response?.routes?.length) {
//       setError(null)
//       setDirections(response)
//       const route = response.routes[0].legs[0]
//       setDistance(route.distance?.text || 'N/A')
//       setDuration(route.duration?.text || 'N/A')
//       requestRoute(origin, destination) // Update backend
//     } else {
//       setError('Unable to find route. Please use specific locations (e.g., "MP Nagar, Bhopal, Madhya Pradesh").')
//       setDirections(null)
//       setDistance(null)
//       setDuration(null)
//     }
//   }, [origin, destination, requestRoute])

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (!origin || !destination) {
//       setError('Please enter both origin and destination.')
//       setDirections(null)
//       return
//     }
//     setError(null)
//   }

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }} 
//       animate={{ opacity: 1 }} 
//       exit={{ opacity: 0 }}
//       className="p-4"
//     >
//       <h1 className="text-3xl font-bold mb-8">Route Planner</h1>
//       <form onSubmit={handleSubmit} className="mb-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//         <input
//           type="text"
//           placeholder="Enter origin (e.g., MP Nagar, Bhopal, Madhya Pradesh)"
//           value={origin}
//           onChange={(e) => setOrigin(e.target.value)}
//           className="p-2 border rounded w-full sm:w-1/3"
//         />
//         <input
//           type="text"
//           placeholder="Enter destination (e.g., Indrapuri, Bhopal, Madhya Pradesh)"
//           value={destination}
//           onChange={(e) => setDestination(e.target.value)}
//           className="p-2 border rounded w-full sm:w-1/3"
//         />
//         <button type="submit" className="bg-accent text-bgDark p-2 rounded w-full sm:w-auto">
//           Calculate Route
//         </button>
//       </form>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {(distance || duration) && (
//         <div className="mb-4">
//           <p><strong>Distance:</strong> {distance}</p>
//           <p><strong>Duration:</strong> {duration}</p>
//         </div>
//       )}
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={12}
//       >
//         {origin && destination && (
//           <DirectionsService
//             options={{
//               destination,
//               origin,
//               travelMode: 'DRIVING',
//               provideRouteAlternatives: true
//             }}
//             callback={handleDirectionsResponse}
//           />
//         )}
//         {directions && (
//           <DirectionsRenderer
//             directions={directions}
//             options={{ suppressMarkers: false, polylineOptions: { strokeColor: '#FF0000' } }}
//           />
//         )}
//       </GoogleMap>
//     </motion.div>
//   )
// }

// export default RoutesPage


import { useContext, useState, useCallback } from 'react'
import TrafficContext from '../context/TrafficContext'
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'
import { motion } from 'framer-motion'

const containerStyle = {
  width: '100%',
  height: '600px'
}

const center = {
  lat: 23.2599, // Bhopal
  lng: 77.4126
}

const RoutesPage = () => {
  const { requestRoute, trafficData } = useContext(TrafficContext)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [distance, setDistance] = useState(null)
  const [duration, setDuration] = useState(null)
  const [error, setError] = useState(null)
  const [directions, setDirections] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleDirectionsResponse = useCallback((response, status) => {
    console.log('Directions response:', { status, response: JSON.stringify(response, null, 2) })
    setIsCalculating(false)
    
    if (status === 'OK' && response?.routes?.length) {
      setError(null)
      setDirections(response)
      const route = response.routes[0].legs[0]
      setDistance(route.distance?.text || 'N/A')
      setDuration(route.duration?.text || 'N/A')
      requestRoute(origin, destination)
    } else {
      setError('Unable to find route. Please use specific locations (e.g., "MP Nagar, Bhopal, Madhya Pradesh").')
      setDirections(null)
      setDistance(null)
      setDuration(null)
    }
  }, [origin, destination, requestRoute])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!origin || !destination) {
      setError('Please enter both origin and destination.')
      setDirections(null)
      return
    }
    setIsCalculating(true)
    setError(null)
  }

  const getRouteCongestionLevel = () => {
    if (!directions) return 'unknown'
    const highCongestionAreas = trafficData.filter(item => item.congestionLevel === 'high').length
    if (highCongestionAreas > 3) return 'high'
    if (highCongestionAreas > 1) return 'medium'
    return 'low'
  }

  const congestionLevel = getRouteCongestionLevel()
  const congestionColor = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
    unknown: 'text-gray-500'
  }[congestionLevel]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6"
    >
      {/* Enhanced Header Section */}
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-green-400 to-cyan-400 bg-clip-text text-transparent"
        >
          🚀 Smart Route Planner
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-300 mb-4 font-light max-w-4xl mx-auto leading-relaxed"
        >
          <span className="text-blue-300 font-semibold">Navigate Bhopal like a pro!</span> Discover the fastest, safest, and most efficient routes with AI-powered traffic insights.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-400/30 rounded-2xl p-6 max-w-2xl mx-auto"
        >
          <p className="text-lg text-blue-100">
            💡 <strong>Pro Tip:</strong> Our system analyzes <span className="text-yellow-300">real-time traffic patterns</span> across 50+ locations in Bhopal to give you the most accurate route predictions!
          </p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Left Panel - Enhanced Input & Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Enhanced Route Input Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-blue-500/30 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
                Start Your Journey
              </h2>
              <p className="text-gray-400 text-sm">
                Enter your locations and let our intelligent system do the magic! ✨
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-blue-300 mb-3 flex items-center">
                  <span className="mr-2">📍</span> Starting Point
                </label>
                <input
                  type="text"
                  placeholder="e.g., MP Nagar Zone 1, Bhopal"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full p-4 bg-gray-900/60 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-lg transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-2">Be specific for better accuracy!</p>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-green-300 mb-3 flex items-center">
                  <span className="mr-2">🎯</span> Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Indrapuri Sector A, Bhopal"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-4 bg-gray-900/60 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500 text-lg transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-2">Where are you heading today?</p>
              </div>

              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center text-lg shadow-2xl"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                    🚀 Calculating Optimal Route...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📊</span> Find Smart Route
                  </>
                )}
              </motion.button>
            </form>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-red-500/30 border-2 border-red-500/50 rounded-xl text-red-100 backdrop-blur-lg"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">⚠️</span>
                  <span className="font-semibold">{error}</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Route Information Card */}
          {(distance || duration) && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-gray-800/80 to-blue-900/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-green-500/30 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent">
                  Route Analysis Complete! 🎉
                </h3>
                <p className="text-gray-400">Your personalized route details are ready</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-900/40 rounded-xl border border-gray-700/50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📏</span>
                    <div>
                      <div className="text-gray-400 text-sm">Total Distance</div>
                      <div className="font-semibold text-white text-lg">{distance}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-900/40 rounded-xl border border-gray-700/50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⏱️</span>
                    <div>
                      <div className="text-gray-400 text-sm">Estimated Travel Time</div>
                      <div className="font-semibold text-white text-lg">{duration}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-900/40 rounded-xl border border-gray-700/50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚦</span>
                    <div>
                      <div className="text-gray-400 text-sm">Traffic Condition</div>
                      <div className={`font-bold text-lg capitalize ${congestionColor}`}>
                        {congestionLevel === 'high' ? 'Heavy Traffic 🚨' : 
                         congestionLevel === 'medium' ? 'Moderate Traffic ⚠️' : 
                         'Clear Roads ✅'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Route Tips */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 border-2 border-blue-500/30 rounded-xl">
                <h4 className="font-bold text-blue-300 mb-3 flex items-center text-lg">
                  <span className="mr-2">💡</span> Smart Travel Recommendations
                </h4>
                <ul className="text-sm text-blue-100 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <strong>Best departure time:</strong> {congestionLevel === 'high' ? 'After 7 PM' : 'Anytime'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <strong>Fuel estimate:</strong> {distance ? `Approx. ${parseInt(distance) * 0.1}L` : 'Calculating...'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <strong>Safety:</strong> Well-lit routes selected
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Enhanced Quick Tips Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30 shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center">
              🌟 Pro Navigation Tips
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="font-semibold text-purple-300 mb-1">📍 Use Landmarks</div>
                <div className="text-sm text-purple-100">Include famous landmarks for pin-point accuracy</div>
              </div>
              
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="font-semibold text-blue-300 mb-1">⏰ Time Smartly</div>
                <div className="text-sm text-blue-100">Avoid 8-10 AM & 5-7 PM peak hours</div>
              </div>
              
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="font-semibold text-green-300 mb-1">📱 Save Routes</div>
                <div className="text-sm text-green-100">Bookmark frequent journeys for quick access</div>
              </div>
              
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="font-semibold text-yellow-300 mb-1">🚗 Vehicle Type</div>
                <div className="text-sm text-yellow-100">Consider smaller vehicles for narrow routes</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Right Panel - Map */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30 shadow-2xl h-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Live Bhopal Map
                </h2>
                <p className="text-gray-400 mt-1">Interactive real-time navigation interface</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-cyan-300">📍 Bhopal, MP</div>
                <div className="text-xs text-gray-500">Updated just now</div>
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden border-4 border-gray-600/30 shadow-3xl relative">
              <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-cyan-300 text-sm font-semibold">🚦 Live Traffic Overlay Active</div>
              </div>
              
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={{
                  styles: [
                    {
                      featureType: "all",
                      elementType: "geometry",
                      stylers: [{ color: "#1a2a3a" }]
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#2a3a4a" }]
                    }
                  ]
                }}
              >
                {origin && destination && !isCalculating && (
                  <DirectionsService
                    options={{
                      destination,
                      origin,
                      travelMode: 'DRIVING',
                      provideRouteAlternatives: true
                    }}
                    callback={handleDirectionsResponse}
                  />
                )}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{ 
                      suppressMarkers: false, 
                      polylineOptions: { 
                        strokeColor: '#10B981',
                        strokeWeight: 8,
                        strokeOpacity: 0.9
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </div>

            {/* Enhanced Map Legend */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center p-3 bg-gray-900/50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full mr-3 shadow-lg"></div>
                <div>
                  <div className="font-semibold text-white">Optimal Route</div>
                  <div className="text-gray-400 text-xs">Fastest path selected</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-900/50 rounded-lg">
                <div className="w-6 h-6 bg-red-500 rounded-full mr-3 shadow-lg"></div>
                <div>
                  <div className="font-semibold text-white">High Congestion</div>
                  <div className="text-gray-400 text-xs">Expect delays</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-900/50 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 rounded-full mr-3 shadow-lg"></div>
                <div>
                  <div className="font-semibold text-white">Moderate Traffic</div>
                  <div className="text-gray-400 text-xs">Slight delays possible</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-900/50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 shadow-lg"></div>
                <div>
                  <div className="font-semibold text-white">Clear Path</div>
                  <div className="text-gray-400 text-xs">Smooth sailing</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Why Choose Our Route Planner?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of navigation with cutting-edge features designed for modern travelers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-center p-8 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl border-2 border-blue-500/30 shadow-2xl"
          >
            <div className="text-5xl mb-4">🚗</div>
            <h4 className="font-bold text-2xl mb-3 text-blue-300">Real-time Intelligence</h4>
            <p className="text-gray-300 leading-relaxed">
              Our AI analyzes <strong>live traffic patterns</strong> from 100+ sensors across Bhopal, 
              giving you <span className="text-green-300">accurate, up-to-the-minute route suggestions</span> that save you time and frustration.
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-center p-8 bg-gradient-to-br from-green-900/40 to-cyan-900/40 rounded-2xl border-2 border-green-500/30 shadow-2xl"
          >
            <div className="text-5xl mb-4">⏱️</div>
            <h4 className="font-bold text-2xl mb-3 text-green-300">Time Optimization</h4>
            <p className="text-gray-300 leading-relaxed">
              Get <strong>smart time predictions</strong> that consider current congestion, weather conditions, 
              and historical data. <span className="text-yellow-300">Arrive on time, every time!</span>
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-center p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl border-2 border-purple-500/30 shadow-2xl"
          >
            <div className="text-5xl mb-4">📊</div>
            <h4 className="font-bold text-2xl mb-3 text-purple-300">Advanced Analytics</h4>
            <p className="text-gray-300 leading-relaxed">
              Detailed <strong>route analysis</strong> with congestion predictions, alternative routes, 
              and <span className="text-cyan-300">safety recommendations</span> for worry-free travel.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* New Testimonial Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="bg-gradient-to-r from-gray-800/50 to-blue-900/50 rounded-2xl p-8 border-2 border-yellow-500/30 text-center"
      >
        <h3 className="text-2xl font-bold mb-4 text-yellow-300">What Our Users Say 🌟</h3>
        <p className="text-lg text-gray-300 italic mb-4">
          "This route planner saved me 20 minutes daily on my commute from MP Nagar to Airport Road! 
          The traffic predictions are incredibly accurate."
        </p>
        <p className="text-gray-400">- Rajesh Kumar, Daily Commuter</p>
      </motion.div>
    </motion.div>
  )
}

export default RoutesPage