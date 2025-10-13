import { useState, useContext } from 'react'
import TrafficContext from '../context/TrafficContext'

const RouteForm = () => {
  const { requestRoute } = useContext(TrafficContext)
  const [origin, setOrigin] = useState('MP Nagar, Bhopal')
  const [destination, setDestination] = useState('Indrapuri, Bhopal')

  const handleSubmit = (e) => {
    e.preventDefault()
    requestRoute(origin, destination)
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="text" 
          value={origin} 
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Origin (e.g., MP Nagar, Bhopal)"
          className="p-3 bg-gray-700 rounded-lg text-textLight"
        />
        <input 
          type="text" 
          value={destination} 
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination (e.g., Indrapuri, Bhopal)"
          className="p-3 bg-gray-700 rounded-lg text-textLight"
        />
        <button type="submit" className="bg-accent text-bgDark p-3 rounded-lg font-bold hover:bg-yellow-600 transition">Calculate Route</button>
      </div>
    </form>
  )
}

export default RouteForm