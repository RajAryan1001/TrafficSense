const { VehicleSpeed, SpeedHistory } = require('../models/VehicleSpeed');
const { fetchTrafficData: fetchTomTomTraffic } = require('./googleMapsService');
const { fetchTrafficData: fetchMapMyIndiaTraffic } = require('./mapmyindiaService');

async function startCityPolling(intervalMs) {
  console.log(`Starting real-time city polling every ${intervalMs / 1000}s`);
  setInterval(async () => {
    try {
      let trafficData = await fetchTomTomTraffic();
      if (trafficData.length === 0) {
        console.warn('TomTom से कोई ट्रैफिक डेटा नहीं, MapMyIndia की कोशिश');
        trafficData = await fetchMapMyIndiaTraffic();
      }

      for (const item of trafficData) {
        const vehicleId = `segment_${item.coordinates.lat.toFixed(4)}_${item.coordinates.lng.toFixed(4)}`;
        const currentSpeed = item.averageSpeed || 0;
        const coordinates = item.coordinates;
        const location = item.location;
        const timestamp = new Date();

        let vehicle = await VehicleSpeed.findOne({ vehicleId });

        if (!vehicle) {
          vehicle = new VehicleSpeed({
            vehicleId,
            vehicleType: 'aggregated',
            currentSpeed,
            coordinates,
            location,
            maxSpeed: currentSpeed,
            averageSpeed: currentSpeed,
            isMoving: currentSpeed > 5,
            timestamp,
            source: item.source || 'tomtom'
          });
        } else {
          vehicle.currentSpeed = currentSpeed;
          vehicle.coordinates = coordinates;
          vehicle.location = location;
          vehicle.timestamp = timestamp;
          vehicle.isMoving = currentSpeed > 5;
          if (currentSpeed > vehicle.maxSpeed) {
            vehicle.maxSpeed = currentSpeed;
          }
          const recentHistory = await SpeedHistory.find({ vehicleId }).sort({ timestamp: -1 }).limit(10);
          const speeds = [currentSpeed, ...recentHistory.map(h => h.speed)];
          vehicle.averageSpeed = speeds.reduce((sum, sp) => sum + sp, 0) / speeds.length;
        }

        await vehicle.save();

        const speedHistory = new SpeedHistory({
          vehicleId,
          speed: currentSpeed,
          coordinates,
          timestamp
        });
        await speedHistory.save();
      }
      console.log(`Updated real average speeds from ${trafficData.length} road segments`);
    } catch (err) {
      console.error('City polling error:', err.message);
    }
  }, intervalMs);
}

module.exports = { startCityPolling };