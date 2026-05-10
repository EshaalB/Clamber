/**
 * Server Entry Point
 * Starts the HTTP server with graceful shutdown support.
 */
const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const logger = require('./utils/logger');
const { initializeSocket } = require('./infrastructure/socket/socket');

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);

    // Start HTTP server
    const port = process.env.PORT || env.PORT || 5000;
    server = httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 Clamber API + Realtime running on port ${port} [${env.NODE_ENV}]`);
      logger.info(`   Health: /health`);
    });
  } catch (error) {
    logger.error('❌ FATAL STARTUP ERROR:', error);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ───
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled Errors ───
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Start the server
startServer();
