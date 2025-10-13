import { useContext, useState, useEffect } from 'react';
import TrafficContext from '../context/TrafficContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTrafficPage = () => {
  const {
    createTrafficData,
    trafficData,
    deleteTrafficData,
    updateTrafficData,
    refreshTrafficData,
    error,
    clearError,
    socket,
  } = useContext(TrafficContext);

  const [formData, setFormData] = useState({
    location: '',
    coordinates: { lat: '', lng: '' },
    congestionLevel: 'low',
    vehiclesCount: '',
    averageSpeed: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [debugInfo, setDebugInfo] = useState(null);

  // Debug: Check database status
  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/traffic/debug/status');
      const data = await response.json();
      setDebugInfo(data);
      console.log('🔍 Database Debug:', data);
    } catch (error) {
      console.error('❌ Debug check failed:', error);
    }
  };

  // Test data creation
  const testCreateData = async () => {
    try {
      const testData = {
        location: "Test Location " + Date.now(),
        coordinates: {
          lat: 28.6139 + (Math.random() * 0.01 - 0.005),
          lng: 77.2090 + (Math.random() * 0.01 - 0.005)
        },
        congestionLevel: "medium",
        vehiclesCount: 25,
        averageSpeed: 30
      };

      console.log('🧪 Test Data:', testData);
      const result = await createTrafficData(testData);
      console.log('✅ Test Result:', result);
      
      setTimeout(() => {
        refreshTrafficData();
        checkDatabaseStatus();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Test Failed:', error);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔧 Context Debug:', {
      trafficDataCount: trafficData?.length,
      error,
      hasCreate: !!createTrafficData,
    });
  }, [trafficData, error, createTrafficData]);

  useEffect(() => {
    console.log('📊 Traffic Data Updated:', trafficData);
  }, [trafficData]);

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
      setTimeout(() => clearError(), 3000);
    }
  }, [error, clearError]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCoordChange = (e) => {
    const { name, value } = e.target;
    let numValue = value === '' ? '' : parseFloat(value);

    if (value !== '') {
      if (name === 'lat' && (numValue < -90 || numValue > 90)) {
        showNotification('Latitude must be between -90 and 90', 'error');
        return;
      }
      if (name === 'lng' && (numValue < -180 || numValue > 180)) {
        showNotification('Longitude must be between -180 and 180', 'error');
        return;
      }
    }

    setFormData({
      ...formData,
      coordinates: { ...formData.coordinates, [name]: numValue },
    });
  };

  // Form validation
  const validateForm = () => {
    if (!formData.location?.trim()) {
      showNotification('Location name is required', 'error');
      return false;
    }
    if (formData.coordinates.lat === '' || formData.coordinates.lng === '') {
      showNotification('Both latitude and longitude are required', 'error');
      return false;
    }
    return true;
  };

  // Prepare data for API
  const prepareDataForAPI = () => ({
    location: formData.location.trim(),
    coordinates: {
      lat: parseFloat(formData.coordinates.lat) || 0,
      lng: parseFloat(formData.coordinates.lng) || 0,
    },
    congestionLevel: formData.congestionLevel,
    vehiclesCount: parseInt(formData.vehiclesCount) || 0,
    averageSpeed: parseFloat(formData.averageSpeed) || 0,
  });

  // Form submissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Submitting form:', formData);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const apiData = prepareDataForAPI();
      const result = await createTrafficData(apiData);
      console.log('✅ Create result:', result);
      showNotification('Traffic data created successfully!', 'success');
      resetForm();
      checkDatabaseStatus(); // Refresh debug info
    } catch (error) {
      console.error('❌ Create error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('🔄 Updating:', formData, 'ID:', editingId);
    if (!validateForm() || !editingId) return;

    setIsLoading(true);
    try {
      const apiData = prepareDataForAPI();
      const result = await updateTrafficData(editingId, apiData);
      console.log('✅ Update result:', result);
      showNotification('Traffic data updated successfully!', 'success');
      cancelEdit();
      checkDatabaseStatus();
    } catch (error) {
      console.error('❌ Update error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Deleting:', id);
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this traffic record?')) {
      setIsLoading(true);
      try {
        const result = await deleteTrafficData(id);
        console.log('✅ Delete result:', result);
        showNotification('Traffic data deleted successfully!', 'success');
        checkDatabaseStatus();
      } catch (error) {
        console.error('❌ Delete error:', error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Form management
  const resetForm = () => {
    setFormData({
      location: '',
      coordinates: { lat: '', lng: '' },
      congestionLevel: 'low',
      vehiclesCount: '',
      averageSpeed: '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    showNotification('Edit cancelled', 'info');
  };

  const handleEdit = (item) => {
    console.log('✏️ Editing:', item);
    if (!item?._id) return;

    setFormData({
      location: item.location || '',
      coordinates: {
        lat: item.coordinates?.lat?.toString() || '',
        lng: item.coordinates?.lng?.toString() || '',
      },
      congestionLevel: item.congestionLevel || 'low',
      vehiclesCount: item.vehiclesCount?.toString() || '',
      averageSpeed: item.averageSpeed?.toString() || '',
    });
    setEditingId(item._id);
    setActiveTab('create');
    showNotification(`Editing: ${item.location}`, 'info');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshTrafficData();
      checkDatabaseStatus();
      showNotification('Data refreshed!', 'success');
    } catch (error) {
      console.error('❌ Refresh error:', error.message);
      showNotification('Refresh failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Data filtering and stats
  const filteredData = trafficData?.filter(item =>
    item.location?.toLowerCase().includes(searchTerm.toLowerCase()) && item._id
  ) || [];

  const stats = {
    total: trafficData?.length || 0,
    high: trafficData?.filter(item => item.congestionLevel === 'high').length || 0,
    medium: trafficData?.filter(item => item.congestionLevel === 'medium').length || 0,
    low: trafficData?.filter(item => item.congestionLevel === 'low').length || 0,
  };

  const getCongestionBadge = (level) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCongestionEmoji = (level) => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-6"
    >
      {/* Debug Panel */}
      <div className="fixed top-4 left-4 z-50 bg-yellow-900/80 backdrop-blur-sm p-4 rounded-lg border border-yellow-500/30 max-w-sm">
        <h3 className="font-bold mb-2">🔍 Debug Panel</h3>
        <div className="text-xs space-y-1">
          <p>Frontend Records: {trafficData.length}</p>
          <p>DB Connected: {debugInfo?.database?.connected ? '✅' : '❌'}</p>
          <p>DB Records: {debugInfo?.database?.trafficRecordsCount}</p>
          <p>Socket: {socket?.connected ? '✅' : '❌'}</p>
          <div className="flex space-x-1 mt-1">
            <button onClick={checkDatabaseStatus} className="bg-blue-600 px-2 py-1 rounded text-xs">
              Refresh
            </button>
            <button onClick={testCreateData} className="bg-green-600 px-2 py-1 rounded text-xs">
              Test Create
            </button>
            <button onClick={() => console.log('Data:', trafficData)} className="bg-purple-600 px-2 py-1 rounded text-xs">
              Log Data
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl border-l-4 ${
              notification.type === 'success' ? 'bg-green-900/80 border-green-400' :
              notification.type === 'error' ? 'bg-red-900/80 border-red-400' :
              'bg-blue-900/80 border-blue-400'
            } backdrop-blur-sm max-w-sm shadow-lg`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🚦 Traffic Data Management
          </h1>
          <p className="text-xl text-gray-300">
            Admin dashboard for managing real-time traffic data
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Records', value: stats.total, color: 'blue' },
            { label: 'High Congestion', value: stats.high, color: 'red' },
            { label: 'Medium Congestion', value: stats.medium, color: 'yellow' },
            { label: 'Low Congestion', value: stats.low, color: 'green' },
          ].map((stat, index) => (
            <div key={index} className={`bg-${stat.color}-800/50 backdrop-blur-sm rounded-2xl p-6 border border-${stat.color}-600/30 text-center shadow-lg`}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className={`text-${stat.color}-300`}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/30 shadow-lg">
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'create' ? 'bg-purple-600 shadow-lg' : 'hover:bg-gray-700/50'}`}>
            {editingId ? '✏️ Edit Record' : '➕ Create New'}
          </button>
          <button onClick={() => setActiveTab('view')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'view' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-700/50'}`}>
            📊 View All Data
          </button>
          <button onClick={handleRefresh} disabled={isLoading} className={`py-3 px-6 rounded-xl font-semibold transition-all ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg'}`}>
            {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </motion.div>

        {/* Create/Edit Form */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div key="create-form" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 mb-8 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold">
                  {editingId ? '✏️ Edit Traffic Record' : '➕ Create New Traffic Data'}
                </h2>
                <div className="flex space-x-2">
                  {editingId && (
                    <button onClick={cancelEdit} disabled={isLoading} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                      Cancel Edit
                    </button>
                  )}
                  <button onClick={() => setActiveTab('view')} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
                    View All Data
                  </button>
                </div>
              </div>

              <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">📍 Location Name *</label>
                    <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Main Street Intersection" className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400" required disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">🚦 Congestion Level</label>
                    <select name="congestionLevel" value={formData.congestionLevel} onChange={handleChange} className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" disabled={isLoading}>
                      <option value="low">🟢 Low Congestion</option>
                      <option value="medium">🟡 Medium Congestion</option>
                      <option value="high">🔴 High Congestion</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">🌐 Latitude *</label>
                    <input name="lat" value={formData.coordinates.lat} onChange={handleCoordChange} placeholder="23.2599" type="number" step="0.0001" min="-90" max="90" className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400" required disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">🌐 Longitude *</label>
                    <input name="lng" value={formData.coordinates.lng} onChange={handleCoordChange} placeholder="77.4126" type="number" step="0.0001" min="-180" max="180" className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400" required disabled={isLoading} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">🚗 Vehicles Count</label>
                    <input name="vehiclesCount" value={formData.vehiclesCount} onChange={handleChange} placeholder="0" type="number" min="0" className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">💨 Average Speed (km/h)</label>
                    <input name="averageSpeed" value={formData.averageSpeed} onChange={handleChange} placeholder="0" type="number" min="0" step="0.1" className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400" disabled={isLoading} />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={`w-full text-white p-4 rounded-xl font-bold transition-all transform shadow-lg ${
                  isLoading ? 'bg-gray-600 cursor-not-allowed' :
                  editingId ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 hover:scale-105' :
                  'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                }`}>
                  {isLoading ? '⏳ Processing...' : editingId ? '💾 Update Traffic Data' : '🚀 Create Traffic Data'}
                </button>
              </form>
            </motion.div>
          )}

          {/* View Data Section */}
          {activeTab === 'view' && (
            <motion.div key="view-data" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              {/* Search Bar */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-6 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">📋 Traffic Data Records</h2>
                    <p className="text-gray-400">Manage and monitor all traffic data entries</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <input type="text" placeholder="Search by location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400" />
                      <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                    </div>
                    <button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-xl transition-colors whitespace-nowrap">
                      ➕ Add New
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              {filteredData.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/30 shadow-lg">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-2xl font-bold mb-2">No Records Found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm ? 'No traffic data matches your search.' : 'No traffic data available. Create your first record!'}
                  </p>
                  {!searchTerm && (
                    <button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition-colors">
                      ➕ Create First Record
                    </button>
                  )}
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors ml-2">
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredData.map((item, index) => (
                      <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.1 }} className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-white pr-2">{item.location || 'Unknown Location'}</h3>
                          <span className="text-2xl flex-shrink-0">{getCongestionEmoji(item.congestionLevel)}</span>
                        </div>
                        <div className="space-y-3 text-sm mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Coordinates:</span>
                            <span className="text-white font-mono text-xs">{item.coordinates?.lat?.toFixed(4)}, {item.coordinates?.lng?.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Congestion:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCongestionBadge(item.congestionLevel)}`}>{(item.congestionLevel || 'low').toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Avg Speed:</span>
                            <span className="text-white">{item.averageSpeed || 0} km/h</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Vehicles:</span>
                            <span className="text-white">{item.vehiclesCount || 0}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-4 border-t border-gray-600/30">
                          <button onClick={() => handleEdit(item)} disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(item._id)} disabled={isLoading} className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg transition-colors text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                            🗑️ Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminTrafficPage;