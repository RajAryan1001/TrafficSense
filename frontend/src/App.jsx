import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api'; // Optional: Keep if using in pages
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/RoutesPage';
import TrafficPage from './pages/TrafficPage';
import AccidentsPage from './pages/AccidentsPage';
import MapPage from './pages/MapPage';
import VehicleSpeedsPage from './pages/VehicleSpeedsPage';
import VehicleHistoryPage from './pages/VehicleHistoryPage';
import AreaVehiclesPage from './pages/AreaVehiclesPage';
import AdminTrafficPage from './pages/AdminTrafficPage';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext'; // NEW: Import your VehicleProvider
import Login from './components/Login';
import Register from './components/Register';
import LoadingSpinner from './components/LoadingSpinner';
import { useState, useEffect } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (for login/register when not authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/admin/traffic" replace />;
  }
  
  return children;
};

// Custom Google Maps Loader to prevent duplicate loading
const GoogleMapsLoader = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        setLoadError('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center">
        <div className="text-red-500 p-4 bg-white rounded-lg shadow-lg">
          Error: {loadError}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center">
        <div className="text-white text-lg">Loading Google Maps...</div>
      </div>
    );
  }

  return children;
};

function App() {
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { loading } = useAuth();

  // OPTIONAL: Add API base check (if using VITE_API_URL in VehicleContext)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_API_URL not set in .env – using default in VehicleContext');
  }

  if (!mapKey) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center">
        <div className="text-red-500 p-4 bg-white rounded-lg shadow-lg">
          Error: Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in .env file.
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <GoogleMapsLoader>
      <VehicleProvider> {/* NEW: Wrap here – provides context to all pages */}
        <div className="min-h-screen bg-bgDark">
          <Navbar />
          <main className="min-h-screen">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />

                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  {/* Public Routes */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/traffic" element={<TrafficPage />} />
                  <Route path="/accidents" element={<AccidentsPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/vehicles" element={<VehicleSpeedsPage />} />
                  <Route path="/vehicles/history/:vehicleId" element={<VehicleHistoryPage />} />
                  <Route path="/vehicles/area" element={<AreaVehiclesPage />} />

                  {/* Protected Admin Route */}
                  <Route
                    path="/admin/traffic"
                    element={
                      <ProtectedRoute>
                        <AdminTrafficPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </VehicleProvider>
    </GoogleMapsLoader>
  );
}

export default App;