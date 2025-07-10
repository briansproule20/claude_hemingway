import React, { useState, useEffect, useRef } from 'react';
import { useEcho } from '@zdql/echo-react-sdk';
import { 
  BookOpen, 
  PenTool, 
  FileText, 
  Lightbulb, 
  MessageCircle, 
  CheckCircle, 
  Send,
  HelpCircle,
  Plus
} from 'lucide-react';

// Type definitions
interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface Topic {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Famous author last names for random selection
const famousAuthors: string[] = [
  'Hemingway', 'Fitzgerald', 'Dickens', 'Austen', 'Tolstoy', 'Dostoevsky', 
  'Shakespeare', 'Poe', 'Twain', 'Steinbeck', 'Faulkner', 'Joyce', 
  'Woolf', 'Orwell', 'Bradbury', 'Vonnegut', 'Salinger', 'Kerouac',
  'Ginsberg', 'Plath', 'Angelou', 'Morrison', 'King', 'Rowling',
  'Tolkien', 'Lewis', 'Wilde', 'Bronte', 'Eliot', 'Yeats'
];

const ELATutorChatbot: React.FC = () => {
  console.log('🚀 ELATutorChatbot: Component is loading...');
  
  // Get Echo SDK context
  const echo = useEcho();
  
  console.log('🔑 Environment check on mount:', {
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY ? 'FOUND' : 'NOT FOUND',
    apiKeyLength: process.env.REACT_APP_ANTHROPIC_API_KEY?.length,
    apiKeyStart: process.env.REACT_APP_ANTHROPIC_API_KEY?.substring(0, 10)
  });
  
  const initialMessage = (author: string): Message[] => ([
    {
      id: 1,
      type: 'bot',
      content: `Hi! I'm Claude ${author}, your ELA tutor. I'm here to help you with reading comprehension, writing, grammar, vocabulary, and literature analysis. What would you like to work on today?`,
      timestamp: new Date()
    }
  ]);

  // Randomly select an author name on component mount
  const [selectedAuthor] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * famousAuthors.length);
    return famousAuthors[randomIndex];
  });

  const [messages, setMessages] = useState<Message[]>(initialMessage(selectedAuthor));
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // Suggestion management state

  const [availableSuggestions, setAvailableSuggestions] = useState<string[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Expanded list of academic dishonesty phrases
  const writingRequestPatterns: string[] = [
    'write this for me',
    'write it for me',
    'can you write',
    'will you write',
    'please write',
    'do my essay',
    'write my essay',
    'write my paper',
    'do my paper',
    'write my assignment',
    'do my assignment',
    'write this essay',
    'write this paper',
    'help me write',
    'complete my homework',
    'finish my assignment',
    'do my homework',
    'can you do my',
    'can you finish my',
    'can you complete my',
    'write an essay for me',
    'write a paper for me',
    'write my report',
    'write my story',
    'write my paragraph',
    'write my summary',
    'write my analysis',
    'write my response',
    'write my reflection',
    'write my book report',
    'write my review',
    'write my speech',
    'write my presentation',
    'write my script',
    'write my project',
    'write my thesis',
    'write my dissertation',
    'write my research paper',
    'write my case study',
    'write my article',
    'write my letter',
    'write my application',
    'write my cover letter',
    'write my personal statement',
    'write my college essay',
    'write my assignment for me',
    'do my assignment for me',
    'do my essay for me',
    'do my paper for me',
    'do my homework for me',
    'finish my essay',
    'finish my paper',
    'finish my assignment',
    'finish my homework',
    'finish my project',
    'finish my report',
    'finish my story',
    'finish my summary',
    'finish my analysis',
    'finish my response',
    'finish my reflection',
    'finish my book report',
    'finish my review',
    'finish my speech',
    'finish my presentation',
    'finish my script',
    'finish my thesis',
    'finish my dissertation',
    'finish my research paper',
    'finish my case study',
    'finish my article',
    'finish my letter',
    'finish my application',
    'finish my cover letter',
    'finish my personal statement',
    'finish my college essay',
  ];

  // Track repeated dishonesty attempts
  const [dishonestyCount, setDishonestyCount] = useState<number>(0);
  const [showDishonestyModal, setShowDishonestyModal] = useState<boolean>(false);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update available suggestions when conversation changes
  useEffect(() => {
    const updateSuggestions = async () => {
      const newSuggestions = await generateContextualSuggestions();
      setAvailableSuggestions(newSuggestions);
      setLastUpdateTime(Date.now());
    };
    updateSuggestions();
  }, [messages]);

  // No auto-scroll - suggestions only change when conversation progresses

  // Get all 6 suggestions to display
  const getCurrentSuggestions = (): string[] => {
    return availableSuggestions.slice(0, 6);
  };

  const topics: Topic[] = [
    { id: 'reading', name: 'Reading Comprehension', icon: BookOpen },
    { id: 'writing', name: 'Writing Skills', icon: PenTool },
    { id: 'grammar', name: 'Grammar & Mechanics', icon: FileText },
    { id: 'vocabulary', name: 'Vocabulary Building', icon: Lightbulb },
    { id: 'literature', name: 'Literature Analysis', icon: MessageCircle },
    { id: 'research', name: 'Research Skills', icon: CheckCircle },
    { id: 'testprep', name: 'Test Prep', icon: CheckCircle },
    { id: 'speaking', name: 'Public Speaking', icon: CheckCircle },
  ];

  // Check for writing requests (academic integrity protection)
  const checkForWritingRequests = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const found = writingRequestPatterns.some(pattern => lowerMessage.includes(pattern));
    if (found) {
      setDishonestyCount((prev) => prev + 1);
      setShowDishonestyModal(true);
    }
    return found;
  };

  // Call Echo LLM API using credits
  const callEchoLLM = async (userMessage: string): Promise<string> => {
    console.log('🔮 Calling Echo LLM API...');
    
    try {
      // Check if user is authenticated
      if (!echo?.isAuthenticated) {
        throw new Error('User not authenticated with Echo');
      }

      // Get authentication token from sessionStorage
      const instanceId = process.env.REACT_APP_ECHO_APP_ID;
      const oidcKey = `oidc.user:https://echo.merit.systems:${instanceId}`;
      const oidcData = sessionStorage.getItem(oidcKey);
      
      if (!oidcData) {
        throw new Error('No authentication token found');
      }

      const parsed = JSON.parse(oidcData);
      const accessToken = parsed.access_token;

      if (!accessToken) {
        throw new Error('No access token available');
      }

      console.log('🌐 Making authenticated call to Echo LLM API');
      
      // Try the correct Echo API endpoint for LLM calls
      const apiEndpoints = [
        'https://echo.merit.systems/api/v1/llm/chat',
        'https://echo.merit.systems/api/llm/chat',
        'https://echo.merit.systems/api/v1/chat',
        'https://echo.merit.systems/api/chat'
      ];

      const chatMessages = [
        {
          role: 'system',
          content: `You are Claude, an ELA tutor with a randomly selected famous author's last name. You help students with English Language Arts including reading comprehension, writing, grammar, vocabulary, and literature analysis.

CRITICAL ETHICAL GUIDELINES - YOU MUST FOLLOW THESE:
1. NEVER write essays, papers, or assignments for students
2. NEVER complete homework or assignments for students
3. NEVER provide full written content that students can submit as their own work
4. ALWAYS redirect writing requests to brainstorming, outlining, and process guidance
5. Focus on teaching the writing process, not doing the writing

TONE AND TEACHING STYLE:
- Always be supportive, encouraging, and positive—like a great teacher or mentor.
- Use affirmations like "Great question!", "You're on the right track!", "Your ideas matter!"
- End responses with encouragement toward independent thinking.

YOUR ROLE:
- Help with reading comprehension strategies
- Guide students through the writing process (brainstorming, outlining, revising)
- Teach grammar and mechanics
- Build vocabulary skills
- Analyze literature and literary devices

Always maintain academic integrity and promote genuine learning.`
        },
        ...messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const requestBody = {
        model: 'claude-3-haiku-20240307',
        messages: chatMessages,
        max_tokens: 500,
        temperature: 0.7
      };

      // Try each endpoint until one works
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Received response from Echo LLM API');
            
            // Refresh balance after LLM call to show updated credits
            if (echo.refreshBalance) {
              setTimeout(() => echo.refreshBalance(), 1000); // Delay to allow API processing
            }
            
            // Extract content from different possible response formats
            if (data.choices && data.choices[0] && data.choices[0].message) {
              return data.choices[0].message.content;
            } else if (data.content) {
              return data.content;
            } else if (data.response) {
              return data.response;
            } else if (data.text) {
              return data.text;
            } else if (typeof data === 'string') {
              return data;
            } else {
              return JSON.stringify(data);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ${endpoint} failed: ${response.status} - ${errorText}`);
            
            // Don't throw here, try next endpoint
            continue;
          }
        } catch (endpointError) {
          console.log(`❌ ${endpoint} error:`, endpointError);
          continue;
        }
      }

      // If all endpoints failed, throw an error
      throw new Error('All Echo API endpoints failed');
      
    } catch (error) {
      console.error('❌ Echo LLM API error:', error);
      
      // Return a seamless fallback response without showing technical errors
      return generateFallbackResponse(userMessage);
    }
  };

  const generateContextualSuggestions = async (): Promise<string[]> => {
    // If no conversation yet, return foundational questions
    if (messages.length <= 1) {
      return [
        "What makes a story compelling to read?",
        "How can I express my ideas more clearly?",
        "What's the difference between formal and informal writing?",
        "How do I find my unique writing voice?",
        "What are some techniques for creative thinking?",
        "How can reading improve my writing skills?"
      ];
    }

    try {
      // Get recent conversation context
      const recentMessages = messages.slice(-4);
      const conversationContext = recentMessages.map(m => 
        `${m.type === 'user' ? 'Student' : 'Tutor'}: ${m.content}`
      ).join('\n');

      // Use Echo LLM for suggestions too
      const response = await callEchoLLM(`Based on this recent ELA tutoring conversation, generate exactly 6 thoughtful follow-up questions that would naturally extend the discussion and help the student learn more. The questions should be:
1. Directly related to what's been discussed
2. Progressively build on the concepts mentioned
3. Encourage deeper thinking and analysis
4. Be engaging and age-appropriate
5. Help the student make connections to broader learning

Recent conversation:
${conversationContext}

Please respond with exactly 6 questions, one per line, without numbering or bullet points. Make them natural follow-up questions that a thoughtful tutor would ask.`);

      const suggestions = response
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.trim())
        .slice(0, 6);

      return suggestions.length >= 3 ? suggestions : getFallbackSuggestions();
    } catch (error) {
      console.error('Error generating Echo suggestions:', error);
      return getFallbackSuggestions();
    }
  };

  const getFallbackSuggestions = (): string[] => {
    // Simple fallback suggestions if Claude fails
    const fallbacks = [
      "What's the most important thing I should focus on improving?",
      "How can I practice this skill in my daily life?",
      "What would help me feel more confident about this topic?",
      "What patterns do I notice in good writing?",
      "How do different genres approach the same themes?",
      "What makes some texts more memorable than others?"
    ];
    return fallbacks.slice(0, 6);
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Academic integrity check first
    if (checkForWritingRequests(userMessage)) {
      const responses = [
        "I understand you're looking for help with your writing! However, I can't write your essay, paper, or assignment for you - that would be academic dishonesty and wouldn't help you learn. Instead, let me help you develop your own ideas and structure your writing. Would you like to start by brainstorming your main ideas or creating an outline?",
        "I'm here to guide you through the writing process, not do the writing for you! Let's work together to develop your ideas. What's your topic, and what are your initial thoughts about it?",
        "I can't complete assignments for you, but I can definitely help you become a better writer! Let's start with brainstorming - what are the key points you want to make in your writing?",
        "Academic integrity is important! Instead of writing it for you, let me help you organize your thoughts and create a strong outline. What's your main argument or topic?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Reading comprehension responses
    if (lowerMessage.includes('read') || lowerMessage.includes('comprehension') || lowerMessage.includes('understand')) {
      const responses = [
        "Great question about reading comprehension! Here are some strategies that can help: 🔍 Preview the text before reading, 📝 Take notes on key ideas, ❓ Ask yourself questions while reading, 🔄 Summarize each section in your own words. Which strategy would you like to try first?",
       "Reading comprehension improves with practice! Try these techniques: ✨ Look for the main idea in each paragraph, 🎯 Identify supporting details, 🔗 Make connections to what you already know, 📖 Visualize what you're reading. What type of text are you working with?",
        "Understanding what you read is a skill that gets better over time! Some helpful approaches: 🤔 Pause and reflect on what you've read, 📚 Look up unfamiliar words, 🗣️ Discuss the text with others, ✍️ Write a brief summary. What specific part are you having trouble with?"
         ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Writing help responses  
    if (lowerMessage.includes('writ') || lowerMessage.includes('essay') || lowerMessage.includes('paper')) {
      const responses = [
        "I'd love to help you with your writing! The key to good writing is good planning. Let's start with these steps: 🎯 Clarify your main idea or argument, 📋 Create an outline with your key points, 📝 Write a rough draft focusing on getting your ideas down, ✏️ Revise and edit for clarity. What's your topic?",
         "Writing is a process, and I'm here to guide you through it! Here's a helpful framework: 🔍 Brainstorm your ideas, 🏗️ Organize them logically, ✍️ Write your first draft, �� Revise for content and clarity, ✅ Proofread for errors. Which step would you like help with?",
          "Great writing starts with clear thinking! Let's work on developing your ideas: 💡 What's your main point or thesis? 📊 What evidence supports your argument? 🔗 How do your ideas connect? 🎯 What's your purpose and audience? Tell me about your writing assignment!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Grammar responses
    if (lowerMessage.includes('grammar') || lowerMessage.includes('punctuation') || lowerMessage.includes('sentence')) {
      const responses = [
        "Grammar questions are excellent for improving your writing! Some common areas to focus on: ✅ Subject-verb agreement, 🔗 Proper sentence structure, 📝 Correct punctuation usage, 📚 Appropriate word choice. What specific grammar topic would you like to explore?",
        "Let's work on grammar together! Here are some key areas: 🎯 Complete sentences (subject + predicate), 🔄 Avoiding run-on sentences, ❓ Proper question formation, 📖 Using commas correctly. Which grammar rule would you like to practice?",
       "Grammar is the foundation of clear communication! Focus on these essentials: 🏗️ Building strong sentence structure, 🔗 Using transition words effectively, ✅ Maintaining consistent verb tenses, 📝 Proper pronoun usage. What grammar challenge are you facing?"
     ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // General encouragement and help
    const generalResponses = [
      "I'm here to help you succeed in ELA! Whether you need help with reading comprehension, writing, grammar, vocabulary, or literature analysis, we can work on it together. What specific area would you like to focus on today? 📚✨",
     "That's a great question! I love helping students grow their English Language Arts skills. Let's explore this together - can you tell me more about what you're working on or what you'd like to learn? 🌟📖",
      "Learning is a journey, and I'm excited to be part of yours! ELA covers so many interesting areas - from creative writing to literary analysis to effective communication. What aspect interests you most right now? 💭📝",
      "Wonderful! I'm here to support your learning in reading, writing, speaking, and critical thinking. Every question you ask shows you're engaged and ready to grow. What would you like to explore today? 🎯📚",
      "ELA skills are interconnected and build on each other! Strong reading improves writing, good vocabulary enhances comprehension, and grammar knowledge supports clear communication. What skill would you like to strengthen first? 🔗📚",
      "Every great thinker started with curiosity! In ELA, we explore how language works, how stories move us, and how we can express our ideas effectively. What aspect of language and literature fascinates you? 🤔✨",
     "Reading, writing, thinking, and communicating are superpowers in today's world! I'm here to help you develop these skills through engaging discussions and practical strategies. What would you like to work on? 💪📝"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleSend = async (): Promise<void> => {
    console.log('🎯 handleSend called with input:', inputValue);
    
    if (!inputValue.trim()) {
      console.log('❌ No input provided, returning early');
      return;
    }

    // Check if user is authenticated with Echo
    if (!echo?.isAuthenticated) {
      const errorMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: "⚠️ **Authentication Required**: Please sign in with Echo to use the ELA tutor.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Check for academic integrity violations
    if (checkForWritingRequests(inputValue)) {
      return; // Don't process the message, let the modal handle it
    }

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    console.log('📝 Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      console.log('🔮 Calling Echo LLM...');
      const botResponse = await callEchoLLM(inputValue);
      console.log('📨 Got bot response:', botResponse);

      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      console.log('💬 Adding bot message:', botMessage);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('💥 Error in handleSend:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: generateFallbackResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log('🏁 Setting isTyping to false');
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string): void => {
    setInputValue(suggestion);
  };

  const handleTopicClick = (topicId: string): void => {
    setSelectedTopic(topicId);
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      const topicMessage = `I'd like to work on ${topic.name.toLowerCase()}.`;
      setInputValue(topicMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleNewChat = (): void => {
    setMessages(initialMessage(selectedAuthor));
    setInputValue('');
    setSelectedTopic('');
    setDishonestyCount(0);
    setShowDishonestyModal(false);
  };

  const currentSuggestions = getCurrentSuggestions();

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Claude {selectedAuthor}</h1>
            <p className="text-sm text-purple-200">ELA Tutor</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleNewChat}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
          >
            New Chat
          </button>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            ?
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-purple-800/50 backdrop-blur-md border-b border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">How I Can Help You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
            <div>
              <h4 className="font-medium text-white">📖 Reading Comprehension</h4>
              <p>Strategies for understanding texts, identifying main ideas, and analyzing content</p>
            </div>
            <div>
              <h4 className="font-medium text-white">✍️ Writing Process</h4>
              <p>Brainstorming, outlining, drafting, revising, and editing your work</p>
            </div>
            <div>
              <h4 className="font-medium text-white">📝 Grammar & Mechanics</h4>
              <p>Sentence structure, punctuation, spelling, and language conventions</p>
            </div>
            <div>
              <h4 className="font-medium text-white">💭 Literature Analysis</h4>
              <p>Understanding themes, literary devices, character development, and more</p>
            </div>
          </div>
          <p className="text-xs text-purple-300 mt-3">
            <strong>Academic Integrity:</strong> I help you learn and develop your own ideas - I don't write assignments for you!
          </p>
        </div>
      )}

      {/* Topic Selection */}
      <div className="bg-black/10 backdrop-blur-md border-b border-white/10 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Quick Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedTopic === topic.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{topic.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area - Left Side */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 backdrop-blur-md text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-black/20 backdrop-blur-md border-t border-white/10 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about reading, writing, grammar, vocabulary, or literature..."
                className="flex-1 bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white p-2 rounded-md transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Tips */}
        <div className="w-80 lg:w-80 md:w-64 hidden md:flex bg-black/30 backdrop-blur-md border-l border-white/10 flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">💡 Smart Suggestions</h4>
            </div>
          </div>
          
          {currentSuggestions.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                                  {currentSuggestions.map((suggestion: string, index: number) => (
                    <button
                      key={`${suggestion}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-start gap-2 p-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-400/50 text-purple-100 hover:text-white text-sm rounded-lg transition-all duration-500 text-left group animate-in fade-in slide-in-from-right-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:bg-yellow-400 transition-colors mt-2 flex-shrink-0"></div>
                    <span className="flex-1 leading-relaxed">{suggestion}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageCircle className="w-3 h-3 text-purple-300 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-600/20 border border-purple-400/30 rounded-lg">
                <div className="text-xs text-purple-300 text-center">
                  💬 Click any question to explore
                </div>
              </div>
            </div>
          )}
          
          {currentSuggestions.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-purple-300 text-sm">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation to see helpful suggestions!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Academic Dishonesty Modal */}
      {showDishonestyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Academic Integrity Reminder</h3>
            <p className="text-gray-700 mb-4">
              I'm here to help you learn, not to do your work for you! Academic integrity is important for your growth as a student and thinker.
            </p>
            <p className="text-gray-700 mb-4">
              Instead of asking me to write something for you, let's work together on:
              • Brainstorming your ideas
              • Creating outlines and structure  
              • Understanding the assignment requirements
              • Improving your writing process
            </p>
            {dishonestyCount > 3 && (
              <p className="text-red-600 font-medium mb-4">
                ⚠️ Multiple integrity violations detected. Please focus on learning rather than shortcuts.
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDishonestyModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELATutorChatbot; 