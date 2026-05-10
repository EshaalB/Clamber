/**
 * Socket.io Configuration (MOCKED)
 * Handles real-time communication.
 */
// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const env = require('../../config/env');
const logger = require('../../utils/logger');

let io = null;

const initializeSocket = (server) => {
  logger.warn('⚠️ Socket.io is mocked. Real-time features disabled.');
  // Mock io object
  io = {
    to: () => ({ emit: () => {} }),
    on: () => {},
    use: () => {},
  };
  return io;
};

const getIO = () => {
  return io;
};

/**
 * Emit a notification to a specific user
 */
const notifyUser = (userId, type, message, data = {}) => {
  logger.info(`[MOCK NOTIFY] User: ${userId}, Msg: ${message}`);
};

module.exports = { initializeSocket, getIO, notifyUser };
