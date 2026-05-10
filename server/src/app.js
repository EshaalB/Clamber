/**
 * Express Application Setup
 * Configures all middleware, routes, and error handling.
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const logger = require('./utils/logger');
const ApiError = require('./utils/ApiError');

// Import routes
const apiRoutes = require('./interfaces/routes/v1');
const adminRoutes = require('./interfaces/routes/adminRoutes');
const passport = require('./infrastructure/security/passport');

const app = express();

app.use(passport.initialize());

// ─── View Engine (EJS for admin panel) ───
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Security Middleware ───
app.use(helmet({
  contentSecurityPolicy: false, // Disable for EJS admin panel inline styles
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (like mobile apps or curl) or if it matches CLIENT_URL (with or without slash)
    if (!origin || origin === env.CLIENT_URL || origin === env.CLIENT_URL.replace(/\/$/, '') || origin.includes('sevalla.page') || origin.includes('sevalla.app')) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ───
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { status: 'fail', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ─── Body Parsers ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Data Sanitization ───
app.use(mongoSanitize());
// xss-clean for XSS protection
try {
  const xss = require('xss-clean');
  app.use(xss());
} catch (e) {
  logger.warn('xss-clean not available, skipping XSS middleware');
}

// ─── Request Logging ───
if (env.isDev()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// ─── Static Files (for admin panel assets and uploads) ───
app.use('/admin/assets', express.static(path.join(__dirname, 'views/admin/assets')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// ─── Base Route ───
app.get('/', (req, res) => {
  res.json({ message: 'Clamber API is running!', status: 'active' });
});

// ─── API Routes ───
app.use('/api/v1', apiRoutes);

// ─── Admin Routes ───
app.use('/admin', adminRoutes);

// ─── Frontend Static Files (Production) ───
if (process.env.NODE_ENV === 'production' || env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(distPath));
  
  // Handle SPA routing: serve index.html for any unknown non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── 404 Handler ───
app.all('*', (req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl}`));
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} - ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: env.isDev() ? err.stack : undefined,
  });

  if (env.isDev()) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || [],
      stack: err.stack,
    });
  } else {
    // Production: don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors || [],
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  }
});

module.exports = app;
