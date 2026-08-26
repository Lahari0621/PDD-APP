require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initializeSocket } = require('./src/sockets/socket.handler');
const connectDB = require('./src/database/connection');
const { seedQuestionsIfNeeded } = require('./src/services/quiz.service');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server immediately — MongoDB connection happens in background
server.listen(PORT, () => {
  console.log(`🚀 AI Debate Partner Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});

// Connect to MongoDB (non-blocking — server is already up)
connectDB()
  .then(async () => {
    try {
      await seedQuestionsIfNeeded();
    } catch (e) {
      console.warn('⚠️  Quiz seeding skipped:', e.message);
    }
  })
  .catch((err) => {
    // connectDB already logs — nothing extra needed here
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
