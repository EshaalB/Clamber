/**
 * AIController: Student academic agent interface.
 * Orchestrates LLM interactions, provides context-aware academic support, and manages usage limits.
 */
const OpenAIService = require('../../infrastructure/external-services/OpenAIService');
const catchAsync = require('../../utils/catchAsync');
const Task = require('../../infrastructure/database/models/Task');
const Course = require('../../infrastructure/database/models/Course');
const Analytics = require('../../infrastructure/database/models/Analytics');
const Chat = require('../../infrastructure/database/models/Chat');

const chat = catchAsync(async (req, res) => {
  const { message, sessionId } = req.body;
  const user = req.user;

  if (!message?.trim()) return res.status(400).json({ status: 'fail', message: 'Message is required' });

  // Daily usage limit
  const now = new Date();
  if (!user.aiUsage?.resetAt || now > user.aiUsage.resetAt) {
    user.aiUsage = { count: 0, resetAt: new Date(now.getTime() + 86400000) };
  }

  if (user.aiUsage.count >= 50) { // Increased daily limit for better UX
    return res.status(429).json({ status: 'fail', message: 'Daily limit reached', data: { resetAt: user.aiUsage.resetAt } });
  }

  // Session message limit
  let conversationHistory = [];
  let currentSessionId = sessionId;

  if (currentSessionId) {
    conversationHistory = await Chat.find({ userId: user._id, sessionId: currentSessionId }).sort({ createdAt: 1 }).lean();
    if (conversationHistory.length >= 40) { // 20 user + 20 AI = 40 total
      return res.status(429).json({ status: 'fail', message: 'Chat message limit reached (20 msgs). Please start a new chat.' });
    }
  } else {
    currentSessionId = `session_${Date.now()}`;
  }

  const [tasks, courses, analytics] = await Promise.all([
    Task.find({ userId: user._id, status: { $ne: 'Done' } }).lean(),
    Course.find({ userId: user._id }).lean(),
    Analytics.findOne({ userId: user._id }).sort({ date: -1 }).lean()
  ]);

  const userContext = {
    profile: {
      name: user.name, major: user.major, targetGPA: user.targetGPA,
      sleepHours: user.sleepHours, stressLevel: user.stressLevel,
      studyPreference: user.studyPreference,
    },
    activeTasks: tasks.map(t => ({ title: t.title, priority: t.priority, status: t.status, dueDate: t.dueDate })),
    courses: courses.map(c => ({ name: c.name, currentGrade: c.currentGrade, targetGrade: c.targetGrade, status: c.status })),
    burnoutMetrics: analytics ? { 
      burnoutScore: analytics.burnoutScore, sleepHours: analytics.sleepHours, 
      studyHours: analytics.studyHours, stressLevel: analytics.stressLevel 
    } : null
  };

  const result = await OpenAIService.chat(message.trim(), conversationHistory, userContext);

  // Auto-title for first message
  let chatTitle = 'New Chat';
  if (!sessionId) {
    chatTitle = message.trim().slice(0, 30) + (message.trim().length > 30 ? '...' : '');
  }

  await Chat.create([
    { userId: user._id, sessionId: currentSessionId, title: chatTitle, text: message.trim(), sender: 'user' },
    { userId: user._id, sessionId: currentSessionId, title: chatTitle, text: result.response, sender: 'ai' }
  ]);

  user.aiUsage.count += 1;
  await user.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    data: {
      sessionId: currentSessionId,
      response: result.response,
      actions: result.actions || [],
      isFallback: result.isFallback || false,
      aiUsage: user.aiUsage
    },
  });
});

const getHistory = catchAsync(async (req, res) => {
  const { sessionId } = req.query;
  const filter = { userId: req.user._id };
  if (sessionId) filter.sessionId = sessionId;

  const messages = await Chat.find(filter).sort({ createdAt: 1 }).limit(100);
  res.json({
    status: 'success',
    data: {
      messages: messages.map(m => ({ id: m._id, text: m.text, sender: m.sender, createdAt: m.createdAt, sessionId: m.sessionId })),
      aiUsage: req.user.aiUsage || { count: 0, resetAt: new Date() }
    }
  });
});

const getConversations = catchAsync(async (req, res) => {
  const conversations = await Chat.aggregate([
    { $match: { userId: req.user._id } },
    { $sort: { createdAt: -1 } },
    { $group: {
        _id: "$sessionId",
        title: { $first: "$title" },
        lastMessage: { $first: "$text" },
        createdAt: { $first: "$createdAt" }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  res.json({
    status: 'success',
    data: conversations
  });
});

const deleteConversation = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  await Chat.deleteMany({ userId: req.user._id, sessionId });
  res.json({ status: 'success', message: 'Conversation deleted' });
});

const getSuggestions = catchAsync(async (req, res) => {
  const userContext = {
    name: req.user.name, major: req.user.major, 
    targetGPA: req.user.targetGPA, stressLevel: req.user.stressLevel,
  };

  const suggestions = await OpenAIService.getSuggestions(userContext);
  res.json({ status: 'success', data: suggestions });
});

module.exports = { chat, getHistory, getConversations, deleteConversation, getSuggestions };
