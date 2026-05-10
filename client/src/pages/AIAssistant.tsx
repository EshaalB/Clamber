/**
 * AIAssistant: Natural language interface for academic management.
 * Provides voice-enabled support for task creation, grade tracking, and wellbeing analysis.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Bot, User, Loader2, Volume2, VolumeX, 
  Mic, MicOff, MessageSquare, History, Plus, Trash2 
} from 'lucide-react';

import { aiApi } from '../api/aiApi';
import { taskApi } from '../api/taskApi';
import { playSound } from '../utils/sound';
import '../styles/pages/AIAssistant.css';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
}

interface Conversation {
  _id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
}

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState({ count: 0, resetAt: new Date() });
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const prevMessagesLength = useRef(messages.length);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = messagesEndRef.current?.parentElement;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    setIsAtBottom(isNearBottom);
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && isAtBottom) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, scrollToBottom, isAtBottom]);

  useEffect(() => {
    if (loading) scrollToBottom();
  }, [loading, scrollToBottom]);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await aiApi.getConversations();
      setConversations(data.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, []);

  const loadConversation = useCallback(async (sessionId: string) => {
    setLoading(true);
    setCurrentSessionId(sessionId);
    try {
      const { data } = await aiApi.getHistory(sessionId);
      setMessages(data.data.messages);
      setAiUsage(data.data.aiUsage);
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([{ id: '1', text: "Hello! I'm your Clamber AI Assistant. How can I help you today?", sender: 'ai' }]);
  }, []);

  useEffect(() => {
    document.title = 'Clamber - AI Academic Agent';
    fetchConversations();
    startNewChat();
  }, [fetchConversations, startNewChat]);

  // Speech Recognition setup (same as before)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInput(prev => `${prev.trim()} ${finalTranscript}`.trim());
        else if (interimTranscript) setInput(prev => `${prev.trim()} ${interimTranscript}`.trim());
      };

      recognition.current.onerror = () => setIsListening(false);
      recognition.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition.current) return;
    if (isListening) recognition.current.stop();
    else {
      setIsListening(true);
      recognition.current.start();
    }
  }, [isListening]);

  const handleAIAction = useCallback(async (action: any) => {
    try {
      if (action.type === 'CREATE_TASK') {
        await taskApi.createTask(action.payload);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `✅ Task added: "${action.payload.title}"`, sender: 'ai' }]);
      } else if (action.type === 'NAVIGATE') {
        setTimeout(() => navigate(action.payload.path), 1200);
      }
    } catch (err) {
      console.error('AI action failed', err);
    }
  }, [navigate]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || aiUsage.count >= 50) return;
    
    // Check local message count for current session
    const userMsgs = messages.filter(m => m.sender === 'user').length;
    if (userMsgs >= 20) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "⚠️ You've reached the 20 message limit for this chat. Please start a new one.", sender: 'ai' }]);
      return;
    }

    const textToSend = input;
    const newUserMsg: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiApi.chat(textToSend, currentSessionId || undefined);
      const aiReply: Message = { id: (Date.now() + 1).toString(), text: data.data.response, sender: 'ai' };
      
      if (!currentSessionId) {
        setCurrentSessionId(data.data.sessionId);
        fetchConversations();
      }

      setMessages(prev => [...prev, aiReply]);
      setAiUsage(data.data.aiUsage);
      playSound('notification');

      if (data.data.actions) {
        for (const action of data.data.actions) {
          await handleAIAction(action);
          await new Promise(r => setTimeout(r, 600));
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "I'm having trouble connecting right now.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: errorMsg, sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, aiUsage.count, currentSessionId, messages, handleAIAction, fetchConversations]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await aiApi.deleteConversation(id);
      if (currentSessionId === id) startNewChat();
      fetchConversations();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSpeak = useCallback((message: Message) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(message.id);
      window.speechSynthesis.speak(utterance);
    }
  }, [speakingId]);

  const getTimeRemaining = useMemo(() => {
    const diff = new Date(aiUsage.resetAt).getTime() - new Date().getTime();
    if (diff <= 0) return 'soon';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  }, [aiUsage.resetAt]);

  return (
    <div className={`ai-assistant-page ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className="ai-history-sidebar">
        <div className="sidebar-header">
          <button className="btn-new-chat" onClick={startNewChat}>
            <Plus size={18} /> New Chat
          </button>
        </div>
        <div className="conversation-list">
          <div className="list-label"><History size={14} /> Recent Conversations</div>
          {conversations.map(conv => (
            <div 
              key={conv._id} 
              className={`conv-item ${currentSessionId === conv._id ? 'active' : ''}`}
              onClick={() => loadConversation(conv._id)}
            >
              <MessageSquare size={16} />
              <div className="conv-details">
                <span className="conv-title">{conv.title}</span>
                <span className="conv-date">{new Date(conv.createdAt).toLocaleDateString()}</span>
              </div>
              <button className="btn-delete-conv" onClick={(e) => handleDeleteConversation(e, conv._id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="ai-chat-main">
        <header className="chat-view-header">
          <div className="header-left">
            <button className="btn-toggle-history" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <History size={20} />
            </button>
            <h2>AI Academic Agent</h2>
          </div>
          <div className="usage-badge">
            {50 - aiUsage.count} slots left
          </div>
        </header>

        <div className="chat-container">
          <main className="chat-messages" onScroll={handleScroll}>
            {messages.length === 0 && !loading && (
              <div className="empty-chat">
                <Bot size={48} strokeWidth={1} color="var(--active-accent)" />
                <h2>Hello! I'm Clamber AI</h2>
                <p>Ask me to manage your tasks, calculate grades, or check your burnout risk.</p>
              </div>
            )}
            {messages.map(m => (
              <MessageItem 
                key={m.id} message={m} 
                isSpeaking={speakingId === m.id} 
                onSpeak={() => handleSpeak(m)} 
              />
            ))}
            {loading && (
              <div className="message ai typing">
                <div className="message-header"><Bot size={14} /><span>Clamber AI</span></div>
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="chat-footer">
            <div className="usage-info">
              Session: {messages.filter(m => m.sender === 'user').length}/20 messages • Daily reset in {getTimeRemaining}
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <button 
                  className={`btn-mic ${isListening ? 'listening' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? 'Listening...' : 'Speak to AI'}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <input 
                  type="text" className="chat-input" 
                  placeholder={aiUsage.count >= 50 ? "Daily limit reached..." : "Ask me anything..."}
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading || aiUsage.count >= 50}
                />
                <button 
                  className="btn-send" onClick={handleSend} 
                  disabled={loading || aiUsage.count >= 50 || !input.trim()}
                >
                  {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </footer>  
        </div>
      </main>
    </div>
  );
};

const MessageItem = memo(({ message, isSpeaking, onSpeak }: any) => (
  <div className={`message ${message.sender}`}>
    <div className="message-header">
      {message.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
      <span>{message.sender === 'ai' ? 'Clamber AI' : 'You'}</span>
      {message.sender === 'ai' && (
        <button 
          className={`tts-btn ${isSpeaking ? 'speaking' : ''}`}
          onClick={onSpeak}
        >
          {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      )}
    </div>
    <div className="message-content">
      <ReactMarkdown>{message.text}</ReactMarkdown>
    </div>
  </div>
));

export default AIAssistant;
