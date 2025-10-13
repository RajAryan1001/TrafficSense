import { motion } from 'framer-motion'

const RouteResult = ({ route, index }) => {
  return (
    <motion.div 
      className={`card ${route.congestionLevel === 'high' ? 'card-high' : route.congestionLevel === 'medium' ? 'card-medium' : 'card-low'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <h3 className="text-xl font-bold text-accent">Route Option {index + 1}</h3>
      <p>Distance: {route.distance?.text}</p>
      <p>Duration: {route.duration?.text} (In Traffic: {route.duration_in_traffic?.text})</p>
      <p>Congestion: <span className={route.congestionLevel === 'high' ? 'text-red-400' : route.congestionLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}>{route.congestionLevel}</span></p>
      <p>Character: {route.routeCharacter}</p>
      <p>Accidents: {route.accidentsInWay || 0}</p>
      <details className="mt-4">
        <summary className="cursor-pointer text-accent">Steps</summary>
        <ul className="list-disc pl-6">
          {route.steps?.map((step, i) => (
            <li key={i}>{step.instruction}</li>
          ))}
        </ul>
      </details>
    </motion.div>
  )
}

export default RouteResult