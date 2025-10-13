import { useContext, useState, useEffect } from 'react'
import VehicleContext from '../context/VehicleContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCar, FaTachometerAlt, FaMapMarkerAlt, FaHistory, FaFilter, 
  FaSearch, FaRoad, FaClock, FaSort, FaPlus, FaEdit, FaTrash,
  FaSync, FaTimes, FaCheck, FaExclamationTriangle
} from 'react-icons/fa'

const VehicleSpeedsPage = () => {
  const { 
    vehicleSpeeds, 
    getAllVehicleSpeeds, 
    createVehicleSpeed, 
    updateVehicle, 
    deleteVehicle,
    getVehicleHistory,
    isLoading,
    error,
    clearError
  } = useContext(VehicleContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('currentSpeed')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [vehicleHistory, setVehicleHistory] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  
  // Toast notifications state
  const [toasts, setToasts] = useState([])

  // Form states
  const [formData, setFormData] = useState({
    vehicleId: '',
    vehicleType: 'car',
    currentSpeed: 0,
    coordinates: { lat: 23.2599, lng: 77.4126 },
    location: 'Bhopal, MP',
    direction: 0,
    source: 'tomtom'
  })

  // Safe data access with defaults
  const safeVehicleSpeeds = vehicleSpeeds || []

  // Filter and sort vehicles with safe access
  const filteredVehicles = safeVehicleSpeeds
    .filter(veh => 
      veh && 
      (filterType === 'all' || (veh.vehicleType && veh.vehicleType.toLowerCase() === filterType)) &&
      ((veh.vehicleId && veh.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (veh.location && veh.location.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1
      switch (sortBy) {
        case 'currentSpeed': return ((a.currentSpeed || 0) - (b.currentSpeed || 0)) * multiplier
        case 'averageSpeed': return ((a.averageSpeed || 0) - (b.averageSpeed || 0)) * multiplier
        case 'maxSpeed': return ((a.maxSpeed || 0) - (b.maxSpeed || 0)) * multiplier
        case 'vehicleType': return (a.vehicleType || '').localeCompare(b.vehicleType || '') * multiplier
        default: return 0
      }
    })

  // Statistics with safe access
  const stats = {
    total: safeVehicleSpeeds.length,
    cars: safeVehicleSpeeds.filter(v => v && v.vehicleType === 'car').length,
    trucks: safeVehicleSpeeds.filter(v => v && v.vehicleType === 'truck').length,
    buses: safeVehicleSpeeds.filter(v => v && v.vehicleType === 'bus').length,
    motorcycles: safeVehicleSpeeds.filter(v => v && v.vehicleType === 'motorcycle').length,
    autos: safeVehicleSpeeds.filter(v => v && v.vehicleType === 'auto').length,
    averageSpeed: Math.round(safeVehicleSpeeds.reduce((acc, v) => acc + (v?.currentSpeed || 0), 0) / Math.max(safeVehicleSpeeds.length, 1)) || 0,
    maxSpeed: Math.max(...safeVehicleSpeeds.map(v => v?.maxSpeed || 0), 0)
  }

  // Load vehicle data on component mount
  useEffect(() => {
    getAllVehicleSpeeds()
  }, [getAllVehicleSpeeds])

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

  // Handle creating a new vehicle
  const handleCreateVehicle = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.vehicleId.trim()) {
      setError('Vehicle ID is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    setActionLoading(true)
    try {
      const vehicleData = {
        vehicleId: formData.vehicleId.trim(),
        vehicleType: formData.vehicleType,
        currentSpeed: parseFloat(formData.currentSpeed) || 0,
        coordinates: formData.coordinates,
        location: formData.location.trim(),
        direction: parseFloat(formData.direction) || 0,
        source: formData.source
      }
      
      console.log('📤 Creating vehicle:', vehicleData);
      await createVehicleSpeed(vehicleData)
      setShowCreateModal(false)
      resetForm()
      showToast(`Vehicle "${formData.vehicleId}" created successfully!`, 'success')
    } catch (err) {
      console.error('Error creating vehicle:', err)
      showToast(`Failed to create vehicle: ${err.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle updating a vehicle
  const handleUpdateVehicle = async (e) => {
    e.preventDefault()
    if (!editingVehicle) return
    
    setActionLoading(true)
    try {
      const updates = {
        vehicleType: formData.vehicleType,
        currentSpeed: parseFloat(formData.currentSpeed) || 0,
        location: formData.location.trim(),
        coordinates: formData.coordinates,
        direction: parseFloat(formData.direction) || 0,
        source: formData.source
      }
      
      console.log('📤 Updating vehicle:', editingVehicle.vehicleId, updates);
      await updateVehicle(editingVehicle.vehicleId, updates)
      setShowEditModal(false)
      setEditingVehicle(null)
      resetForm()
      showToast(`Vehicle "${editingVehicle.vehicleId}" updated successfully!`, 'success')
    } catch (err) {
      console.error('Error updating vehicle:', err)
      showToast(`Failed to update vehicle: ${err.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle deleting a vehicle
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return
    }

    setActionLoading(true)
    try {
      await deleteVehicle(vehicleId)
      showToast(`Vehicle "${vehicleId}" deleted successfully!`, 'success')
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      showToast(`Failed to delete vehicle: ${err.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle viewing vehicle history
  const handleViewHistory = async (vehicleId) => {
    setActionLoading(true)
    try {
      const history = await getVehicleHistory(vehicleId)
      setVehicleHistory(history)
      setSelectedVehicle(vehicleId)
      setShowHistory(true)
      showToast(`Loaded history for vehicle "${vehicleId}"`, 'info')
    } catch (err) {
      console.error('Error fetching vehicle history:', err)
      showToast(`Failed to load vehicle history: ${err.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Reset form data
  const resetForm = () => {
    setFormData({
      vehicleId: '',
      vehicleType: 'car',
      currentSpeed: 0,
      coordinates: { lat: 23.2599, lng: 77.4126 },
      location: 'Bhopal, MP',
      direction: 0,
      source: 'tomtom'
    })
  }

  // Open edit modal with vehicle data
  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      vehicleId: vehicle.vehicleId,
      vehicleType: vehicle.vehicleType,
      currentSpeed: vehicle.currentSpeed,
      coordinates: vehicle.coordinates,
      location: vehicle.location,
      direction: vehicle.direction,
      source: vehicle.source
    })
    setShowEditModal(true)
  }

  // Open create modal
  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  // Refresh data
  const handleRefresh = async () => {
    try {
      await getAllVehicleSpeeds()
      showToast('Vehicle data refreshed successfully!', 'success')
    } catch (err) {
      showToast('Failed to refresh vehicle data', 'error')
    }
  }

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'car': return '🚗'
      case 'truck': return '🚚'
      case 'motorcycle': return '🏍️'
      case 'bus': return '🚌'
      case 'auto': return '🛺'
      default: return '🚙'
    }
  }

  const getSpeedColor = (speed) => {
    const safeSpeed = speed || 0
    if (safeSpeed >= 80) return 'text-red-400'
    if (safeSpeed >= 50) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getSpeedBgColor = (speed) => {
    const safeSpeed = speed || 0
    if (safeSpeed >= 80) return 'bg-red-500/20'
    if (safeSpeed >= 50) return 'bg-yellow-500/20'
    return 'bg-green-500/20'
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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️'
    return sortOrder === 'desc' ? '⬇️' : '⬆️'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-6 relative"
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
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-4 shadow-2xl"
          >
            <FaTachometerAlt className="text-3xl text-white" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            🚗 Real-Time Vehicle Speeds
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Monitor live vehicle speeds across <span className="text-blue-300 font-semibold">Bhopal's intelligent traffic network</span>. 
            Track individual vehicle performance, speed patterns, and traffic flow analytics in real-time.
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
        >
          <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-600/30 text-center">
            <div className="text-2xl font-bold text-blue-300">{stats.total}</div>
            <div className="text-blue-200 text-sm">Total</div>
          </div>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl p-4 border border-green-600/30 text-center">
            <div className="text-2xl font-bold text-green-300">{stats.cars}</div>
            <div className="text-green-200 text-sm">Cars</div>
          </div>
          <div className="bg-yellow-800/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-600/30 text-center">
            <div className="text-2xl font-bold text-yellow-300">{stats.trucks}</div>
            <div className="text-yellow-200 text-sm">Trucks</div>
          </div>
          <div className="bg-orange-800/50 backdrop-blur-sm rounded-2xl p-4 border border-orange-600/30 text-center">
            <div className="text-2xl font-bold text-orange-300">{stats.buses}</div>
            <div className="text-orange-200 text-sm">Buses</div>
          </div>
          <div className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-4 border border-purple-600/30 text-center">
            <div className="text-2xl font-bold text-purple-300">{stats.motorcycles}</div>
            <div className="text-purple-200 text-sm">Bikes</div>
          </div>
          <div className="bg-teal-800/50 backdrop-blur-sm rounded-2xl p-4 border border-teal-600/30 text-center">
            <div className="text-2xl font-bold text-teal-300">{stats.autos}</div>
            <div className="text-teal-200 text-sm">Autos</div>
          </div>
          <div className="bg-red-800/50 backdrop-blur-sm rounded-2xl p-4 border border-red-600/30 text-center">
            <div className="text-2xl font-bold text-red-300">{stats.maxSpeed}</div>
            <div className="text-red-200 text-sm">Max Speed</div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <FaFilter className="text-green-400" />
                Vehicle Speed Dashboard
              </h2>
              <p className="text-gray-400">
                {stats.total > 0 
                  ? `Tracking ${stats.total} vehicles in real-time. Filter by type or search for specific vehicles.`
                  : 'Awaiting vehicle data feed...'
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search vehicles or locations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full lg:w-64"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">🚦 All Vehicle Types</option>
                <option value="car">🚗 Cars Only</option>
                <option value="truck">🚚 Trucks Only</option>
                <option value="bus">🚌 Buses Only</option>
                <option value="motorcycle">🏍️ Motorcycles Only</option>
                <option value="auto">🛺 Autos Only</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 rounded-xl transition-colors"
              >
                <FaSync className={`${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
              >
                <FaPlus />
                Add Vehicle
              </button>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-700/30">
            <span className="text-gray-400 flex items-center gap-2">
              <FaSort /> Sort by:
            </span>
            {[
              { key: 'currentSpeed', label: 'Current Speed', icon: '💨' },
              { key: 'averageSpeed', label: 'Average Speed', icon: '📊' },
              { key: 'maxSpeed', label: 'Max Speed', icon: '🚀' },
              { key: 'vehicleType', label: 'Vehicle Type', icon: '🚗' }
            ].map((sortOption) => (
              <button
                key={sortOption.key}
                onClick={() => toggleSort(sortOption.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  sortBy === sortOption.key 
                    ? 'bg-green-600/30 border border-green-500/50' 
                    : 'bg-gray-700/30 hover:bg-gray-600/30'
                }`}
              >
                <span>{sortOption.icon}</span>
                <span>{sortOption.label}</span>
                <span className="text-sm">{getSortIcon(sortOption.key)}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-400" />
              <span>{error}</span>
            </div>
            <button 
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              <FaTimes />
            </button>
          </motion.div>
        )}

        {/* Vehicle Grid */}
        <AnimatePresence>
          {filteredVehicles.length > 0 ? (
            <motion.div 
              key="vehicle-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredVehicles.map((veh, index) => (
                <motion.div 
                  key={veh?.vehicleId || index}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-green-500/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {/* Vehicle Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {getVehicleIcon(veh?.vehicleType)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">
                          {veh?.vehicleId || 'Unknown Vehicle'}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {(veh?.vehicleType || 'unknown')} • <span className="text-green-400">Online</span>
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSpeedColor(veh?.currentSpeed)} bg-black/30 backdrop-blur-sm`}>
                      {veh?.currentSpeed || 0} km/h
                    </span>
                  </div>

                  {/* Speed Metrics */}
                  <div className="space-y-4 mb-4">
                    <div className={`p-3 rounded-lg ${getSpeedBgColor(veh?.currentSpeed)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 flex items-center gap-2">
                          <FaTachometerAlt className="text-green-400" />
                          Current Speed
                        </span>
                        <span className={`font-bold ${getSpeedColor(veh?.currentSpeed)}`}>
                          {veh?.currentSpeed || 0} km/h
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (veh?.currentSpeed || 0) >= 80 ? 'bg-red-500' : 
                            (veh?.currentSpeed || 0) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(veh?.currentSpeed || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-black/20 rounded-lg">
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <FaClock className="text-blue-400" />
                          Average
                        </div>
                        <div className="font-bold text-white">{veh?.averageSpeed || 0} km/h</div>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg">
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <FaTachometerAlt className="text-red-400" />
                          Max Speed
                        </div>
                        <div className="font-bold text-white">{veh?.maxSpeed || 0} km/h</div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg mb-4">
                    <span className="text-gray-300 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-purple-400" />
                      Location
                    </span>
                    <span className="font-semibold text-white text-sm text-right max-w-[120px] truncate">
                      {veh?.location || 'Unknown Location'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewHistory(veh?.vehicleId)}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <FaHistory />
                      History
                    </button>
                    <button
                      onClick={() => openEditModal(veh)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(veh?.vehicleId)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
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
                animate={{ x: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🚗
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">No Vehicles Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' 
                  ? "No vehicles match your current filters. Try adjusting your search criteria."
                  : "The vehicle tracking system is currently initializing. Live vehicle data will appear here shortly."
                }
              </p>
              <div className="flex gap-4 justify-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Reset Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreateModal}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Add First Vehicle
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Vehicle Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaPlus className="text-green-400" />
                  Add New Vehicle
                </h3>
                <form onSubmit={handleCreateVehicle} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle ID *</label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter vehicle ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="car">🚗 Car</option>
                      <option value="truck">🚚 Truck</option>
                      <option value="bus">🚌 Bus</option>
                      <option value="motorcycle">🏍️ Motorcycle</option>
                      <option value="auto">🛺 Auto</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Speed</label>
                      <input
                        type="number"
                        value={formData.currentSpeed}
                        onChange={(e) => setFormData({...formData, currentSpeed: parseInt(e.target.value) || 0})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading ? 'Creating...' : 'Create Vehicle'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Vehicle Modal */}
        <AnimatePresence>
          {showEditModal && editingVehicle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaEdit className="text-yellow-400" />
                  Edit Vehicle
                </h3>
                <form onSubmit={handleUpdateVehicle} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle ID</label>
                    <input
                      type="text"
                      value={formData.vehicleId}
                      disabled
                      className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="car">🚗 Car</option>
                      <option value="truck">🚚 Truck</option>
                      <option value="bus">🚌 Bus</option>
                      <option value="motorcycle">🏍️ Motorcycle</option>
                      <option value="auto">🛺 Auto</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Speed</label>
                      <input
                        type="number"
                        value={formData.currentSpeed}
                        onChange={(e) => setFormData({...formData, currentSpeed: parseInt(e.target.value) || 0})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Speed</label>
                      <input
                        type="number"
                        value={formData.maxSpeed}
                        onChange={(e) => setFormData({...formData, maxSpeed: parseInt(e.target.value) || 0})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading ? 'Updating...' : 'Update Vehicle'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vehicle History Modal */}
        <AnimatePresence>
          {showHistory && selectedVehicle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <FaHistory className="text-blue-400" />
                    Speed History - {selectedVehicle}
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {vehicleHistory.length > 0 ? (
                  <div className="space-y-3">
                    {vehicleHistory.map((record, index) => (
                      <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{record.speed} km/h</div>
                            <div className="text-sm text-gray-400">
                              {new Date(record.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            Lat: {record.coordinates?.lat?.toFixed(4)}, Lng: {record.coordinates?.lng?.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FaHistory className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>No speed history available for this vehicle.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
            <p className="flex items-center justify-center gap-2">
              <FaClock className="text-green-400" />
              <span>Real-time vehicle tracking • Data updates every 15 seconds</span>
            </p>
            <p className="mt-1 text-xs">
              🟢 Safe Speed (0-50 km/h) • 🟡 Moderate (51-80 km/h) • 🔴 High Speed (81+ km/h)
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default VehicleSpeedsPage