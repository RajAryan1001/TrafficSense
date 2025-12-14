require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trafficDB', {
      serverSelectionTimeoutMS: 5000,
    });                                                                                
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`Collections: ${await conn.connection.db.listCollections().toArray().then(collections => collections.map(c => c.name))}`);
    mongoose.set('debug', true);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;