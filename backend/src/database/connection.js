const dns = require('dns');
const mongoose = require('mongoose');

// Override DNS to use Google + Cloudflare — fixes queryTxt ECONNREFUSED on
// networks that block the default system resolver (common with Atlas SRV records)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  // If no URI is set, skip silently
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — running without database');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // give up after 10 s instead of 30 s
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      family: 4, // force IPv4
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Server will start WITHOUT database — auth/data features will be unavailable');
    console.warn('💡 Fix options:');
    console.warn('   1. Check MongoDB Atlas → Network Access → add your IP (or 0.0.0.0/0 for dev)');
    console.warn('   2. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.warn('      Then set MONGODB_URI=mongodb://localhost:27017/ai-debate-partner in .env');
    // Do NOT throw — let server start anyway
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;
