import { Link } from "react-router-dom"
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa"
import { motion } from "framer-motion"

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900 to-purple-900 text-gray-300 py-12 mt-auto border-t border-gray-700/30"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4"
            >
              🚦 TrafficFlow
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm leading-relaxed"
            >
              Advanced traffic management system providing real-time monitoring and analytics for smarter city transportation solutions.
            </motion.p>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Dashboard', path: '/dashboard', emoji: '📊' },
                { name: 'Live Traffic', path: '/traffic', emoji: '🚦' },
                { name: 'Analytics', path: '/analytics', emoji: '📈' },
                { name: 'Admin Panel', path: '/admin', emoji: '⚙️' },
                { name: 'Support', path: '/support', emoji: '💬' }
              ].map((link, index) => (
                <motion.li key={link.name} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link 
                    to={link.path} 
                    className="flex items-center text-gray-400 hover:text-white transition-all duration-200 group"
                  >
                    <span className="mr-2">{link.emoji}</span>
                    <span className="group-hover:text-purple-300">{link.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Contact Info
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                <span className="text-sm">123 Traffic Lane, Bhopal, MP 462001, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <a href="mailto:info@trafficflow.com" className="text-sm hover:text-white transition-colors">
                  info@trafficflow.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-blue-400 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-sm hover:text-white transition-colors">
                  +91 12345 67890
                </a>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Follow Us
            </h4>
            <p className="text-gray-400 text-sm mb-4">Stay connected for updates</p>
            <div className="flex space-x-4">
              {[
                { icon: FaFacebook, color: 'hover:text-blue-400', label: 'Facebook' },
                { icon: FaTwitter, color: 'hover:text-blue-300', label: 'Twitter' },
                { icon: FaInstagram, color: 'hover:text-pink-400', label: 'Instagram' },
                { icon: FaLinkedin, color: 'hover:text-blue-500', label: 'LinkedIn' }
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-gray-400 ${social.color} transition-all duration-300 bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-gray-700/30`}
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-gray-700/30 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              <p>&copy; 2025 <span className="text-purple-400 font-semibold">TrafficFlow</span>. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <motion.a 
                href="#" 
                whileHover={{ color: "#ffffff" }}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ color: "#ffffff" }}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ color: "#ffffff" }}
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </motion.a>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>🚀 Built with React & Tailwind CSS</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer