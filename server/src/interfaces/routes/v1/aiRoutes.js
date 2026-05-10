/**
 * AI Routes
 */
const router = require('express').Router();
const AIController = require('../../controllers/AIController');
const authenticate = require('../../middlewares/authenticate');
const rateLimit = require('express-rate-limit');

// AI-specific rate limit
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { status: 'fail', message: 'AI rate limit reached. Please wait a moment.' },
});

router.use(authenticate);

router.post('/chat', aiLimiter, AIController.chat);
router.get('/history', AIController.getHistory);
router.get('/conversations', AIController.getConversations);
router.delete('/conversations/:sessionId', AIController.deleteConversation);
router.get('/suggestions', AIController.getSuggestions);

module.exports = router;
