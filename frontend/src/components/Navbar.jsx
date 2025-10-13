import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { MenuIcon, XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [trafficOpen, setTrafficOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setTrafficOpen(false)
  }

  const handleAdminClick = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/register')
      closeMobileMenu()
    } else {
      navigate('/admin/traffic')
      closeMobileMenu()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    closeMobileMenu()
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-purple-900 text-white shadow-xl border-b border-purple-600/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🚦 TrafficSense
        </Link>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all"
          >
            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-20 left-4 right-4 bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/30 py-4 z-50"
            >
              <ul className="flex flex-col space-y-2 px-4">
                {/* Auth Info in Mobile Menu */}
                {isAuthenticated && (
                  <li className="px-4 py-2 text-center border-b border-gray-700/30">
                    <span className="text-sm text-gray-300">Welcome, Admin</span>
                  </li>
                )}

                <li>
                  <Link
                    to="/"
                    className="block py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    📊 Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/routes"
                    className="block py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    🛣️ Routes
                  </Link>
                </li>
                
                {/* Traffic Dropdown Mobile */}
                <li className="relative">
                  <button
                    className="flex justify-between items-center w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold"
                    onClick={() => setTrafficOpen(!trafficOpen)}
                  >
                    <span>🚦 Traffic Overview</span>
                    <motion.span animate={{ rotate: trafficOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {trafficOpen && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-900/80 backdrop-blur-md rounded-xl mt-2 space-y-1 ml-4 overflow-hidden"
                      >
                        <li>
                          <Link
                            to="/traffic"
                            className="block py-2 px-4 rounded-lg hover:bg-purple-600/30 transition-all duration-200"
                            onClick={closeMobileMenu}
                          >
                            🚗 Congestion
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/vehicles"
                            className="block py-2 px-4 rounded-lg hover:bg-purple-600/30 transition-all duration-200"
                            onClick={closeMobileMenu}
                          >
                            💨 Vehicle Speeds
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/vehicles/area"
                            className="block py-2 px-4 rounded-lg hover:bg-purple-600/30 transition-all duration-200"
                            onClick={closeMobileMenu}
                          >
                            🔍 Area Search
                          </Link>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>

                <li>
                  <Link
                    to="/accidents"
                    className="block py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    🚨 Accidents
                  </Link>
                </li>
                <li>
                  <Link
                    to="/map"
                    className="block py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    🗺️ Map
                  </Link>
                </li>
                
                {/* Admin Link with Auth Check */}
                <li>
                  <button
                    onClick={handleAdminClick}
                    className="w-full text-left py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ⚙️ {isAuthenticated ? 'Admin Panel' : 'Admin'}
                  </button>
                </li>

                {/* Logout Button - Only show when authenticated */}
                {isAuthenticated && (
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-200 font-semibold mt-2"
                    >
                      🚪 Logout
                    </button>
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <ul className="flex flex-row items-center space-x-1">
            <li>
              <Link 
                to="/" 
                className="py-2 px-4 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 font-semibold hover:scale-105"
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/routes" 
                className="py-2 px-4 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 font-semibold hover:scale-105"
              >
                🛣️ Routes
              </Link>
            </li>
            
            {/* Traffic Dropdown Desktop */}
            <li 
              className="relative group"
              onMouseEnter={() => setTrafficOpen(true)}
              onMouseLeave={() => setTrafficOpen(false)}
            >
              <button className="py-2 px-4 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 font-semibold hover:scale-105 flex items-center gap-2">
                🚦 Traffic Overview
                <motion.span animate={{ rotate: trafficOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {trafficOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/30 py-3 w-64 z-50"
                  >
                    <li>
                      <Link
                        to="/traffic"
                        className="block py-3 px-4 hover:bg-purple-600/30 transition-all duration-200 rounded-lg mx-2"
                      >
                        🚗 Congestion
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vehicles"
                        className="block py-3 px-4 hover:bg-purple-600/30 transition-all duration-200 rounded-lg mx-2"
                      >
                        💨 Vehicle Speeds
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vehicles/area"
                        className="block py-3 px-4 hover:bg-purple-600/30 transition-all duration-200 rounded-lg mx-2"
                      >
                        🔍 Area Search
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            <li>
              <Link 
                to="/accidents" 
                className="py-2 px-4 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 font-semibold hover:scale-105"
              >
                🚨 Accidents
              </Link>
            </li>
            <li>
              <Link 
                to="/map" 
                className="py-2 px-4 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 font-semibold hover:scale-105"
              >
                🗺️ Map
              </Link>
            </li>
            
            {/* Admin Link with Auth Check - Desktop */}
            <li>
              <button
                onClick={handleAdminClick}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-semibold ml-2"
              >
                ⚙️ {isAuthenticated ? 'Admin Panel' : 'Admin'}
              </button>
            </li>

            {/* Logout Button - Only show when authenticated */}
            {isAuthenticated && (
              <li>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-200 font-semibold ml-2"
                >
                  🚪 Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar