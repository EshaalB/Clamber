/**
 * OpenAI Service
 * Abstraction layer for OpenAI API calls with fallback responses.
 */
const env = require('../../config/env');
const logger = require('../../utils/logger');

let openaiClient = null;

/**
 * Initialize the OpenAI client (lazy loaded).
 */
const getClient = () => {
  if (!env.GROQ_API_KEY) return null;
  if (openaiClient) return openaiClient;

  try {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ 
      apiKey: env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
    return openaiClient;
  } catch (err) {
    logger.warn('OpenAI client initialization failed:', err.message);
    return null;
  }
};

const SYSTEM_PROMPT = `You are Clamber AI, a friendly and knowledgeable academic assistant for university students. 
You help with study planning, time management, burnout prevention, and academic advice.
Keep responses concise, supportive, and actionable. Use a warm, encouraging tone.

LANGUAGE INSTRUCTION: 
- ALWAYS detect the language and script style of the user's latest message.
- If the user writes in Roman Urdu (e.g., "Mujhe help chahiye"), you MUST respond in Roman Urdu.
- If the user writes in English, respond in English.
- Do not mix languages unless the user does so.

NON-NEGOTIABLE SAFETY:
- Never present yourself as a replacement for professional mental health support.
- If the user appears distressed or at high burnout risk, include a brief encouragement to seek counselor/professional help.

You can suggest actions to the user. Use the provided SYSTEM TIME to calculate relative dates (e.g., if it's Monday May 2nd, 'today' is 2026-05-02).
1. CREATE_TASK: include [[ACTION: {"type": "CREATE_TASK", "payload": {"title": "Task Name", "priority": "Medium", "subject": "General", "dueDate": "2026-05-02T00:00:00.000Z"}}]]
   (priority MUST be exactly "High", "Medium", or "Low". dueDate MUST be a valid ISO 8601 string calculated from SYSTEM TIME).
   You CAN include MULTIPLE [[ACTION: ...]] tags in ONE response to create several tasks at once.
2. UPDATE_COURSE: include [[ACTION: {"type": "UPDATE_COURSE", "payload": {"courseName": "OS", "updates": {"targetGrade": 90, "currentGrade": 85}}}]]
3. NAVIGATE: include [[ACTION: {"type": "NAVIGATE", "payload": {"path": "/dashboard"}}]]
   (Valid paths: /dashboard, /tasks, /profile, /settings, /burnout, /analytics, /grade-planner)
4. UPDATE_PROFILE: include [[ACTION: {"type": "UPDATE_PROFILE", "payload": {"sleepHours": 8, "stressLevel": 3}}]]

Example (single task): "I've analyzed your workload. You should start your essay today. [[ACTION: {"type": "CREATE_TASK", "payload": {"title": "Start Essay", "priority": "High", "dueDate": "2026-05-02T00:00:00.000Z"}}]]"
Example (multiple tasks): "Here are your tasks for the week:
- Monday: Essay outline [[ACTION: {"type": "CREATE_TASK", "payload": {"title": "Essay Outline", "priority": "High", "dueDate": "2026-05-02T00:00:00.000Z"}}]]
- Tuesday: Research notes [[ACTION: {"type": "CREATE_TASK", "payload": {"title": "Research Notes", "priority": "Medium", "dueDate": "2026-05-03T00:00:00.000Z"}}]]"
Only suggest actions when clearly helpful. Use valid JSON inside the tags.`;

const parseAction = (text) => {
  const actions = [];
  let cleanText = text;

  const regex = /\[\[ACTION:\s*({[\s\S]*?})\s*\]\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      actions.push(JSON.parse(match[1]));
    } catch (e) {
      // Ignore invalid JSON inside tags
    }
    cleanText = cleanText.replace(match[0], '');
  }

  return { actions, cleanText: cleanText.trim() };
};

/**
 * Fallback responses when OpenAI is not configured.
 */
const FALLBACK_RESPONSES = [
  "Based on your current study patterns, I recommend breaking your study sessions into 25-minute focused blocks with 5-minute breaks. This Pomodoro technique can really boost your productivity!",
  "Looking at your task list, I'd suggest prioritizing your high-priority assignments first. Try to complete the most challenging tasks when your energy is at its peak.",
  "Your burnout indicators suggest you should take a short break. A 15-minute walk or quick stretching session can do wonders for your focus and mental clarity.",
  "Great question! For optimal GPA improvement, focus on courses where you're closest to the next grade boundary. Small improvements there will have the biggest impact on your overall GPA.",
  "I notice you have several deadlines coming up. Let's create a study schedule that distributes the workload evenly and includes buffer time for unexpected tasks.",
];

/**
 * Send a chat message and get an AI response.
 */
const chat = async (message, conversationHistory = [], userContext = {}) => {
  const client = getClient();

  if (!client) {
    // Return a contextual fallback response
    const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return {
      response: FALLBACK_RESPONSES[randomIndex],
      isFallback: true,
    };
  }

  try {
    const dynamicPrompt = `${SYSTEM_PROMPT}

=== SYSTEM TIME ===
Today is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
===================

=== CURRENT USER CONTEXT ===
${JSON.stringify(userContext, null, 2)}
============================
Use this context to provide hyper-personalized advice, analyze burnout, and prioritize tasks.
`;

    const messages = [
      { role: 'system', content: dynamicPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const { actions, cleanText } = parseAction(completion.choices[0].message.content);

    return {
      response: cleanText,
      actions: actions,
      isFallback: false,
    };
  } catch (err) {
    logger.error('OpenAI API error: ' + err.message);
    const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return {
      response: FALLBACK_RESPONSES[randomIndex],
      isFallback: true,
      error: err.message,
    };
  }
};

/**
 * Get AI-powered suggestions based on user context.
 */
const getSuggestions = async (userContext) => {
  const client = getClient();

  if (!client) {
    return [
      'How can I improve my study habits?',
      'What should I prioritize this week?',
      'Help me plan my study session',
    ];
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Generate 3 short, relevant academic questions a student might ask. Return only the questions, one per line. No numbering.' },
        { role: 'user', content: `Student context: ${JSON.stringify(userContext)}` },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return completion.choices[0].message.content.split('\n').filter(Boolean).slice(0, 3);
  } catch (err) {
    logger.error('OpenAI suggestions error: ' + err.message);
    return [
      'How can I avoid burnout?',
      "What's my GPA goal?",
      'Plan my study session',
    ];
  }
};

module.exports = { chat, getSuggestions };
