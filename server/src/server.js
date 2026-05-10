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
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  initializeSocket(httpServer);

  // Start HTTP server
  server = httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Clamber API + Realtime running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`   Health: http://localhost:${env.PORT}/health`);
    logger.info(`   API:    http://localhost:${env.PORT}/api/v1`);
    logger.info(`   Admin:  http://localhost:${env.PORT}/admin`);
  });
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
