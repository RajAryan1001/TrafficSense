import { motion } from 'framer-motion'

const CongestionCard = ({ level, count, averageSpeed }) => {
  const color = level === 'high' ? 'card-high' : level === 'medium' ? 'card-medium' : 'card-low'

  return (
    <motion.div 
      className={`card ${color}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <h3 className="text-xl font-bold capitalize">{level} Congestion</h3>
      <p className="text-3xl mt-2">{count} Areas</p>
      <p>Avg Speed: {averageSpeed} km/h</p>
    </motion.div>
  )
}

export default CongestionCard