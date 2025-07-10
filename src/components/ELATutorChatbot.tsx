import React, { useState, useEffect, useRef } from 'react';
import { useEcho } from '@zdql/echo-react-sdk';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { useLanguage } from '../App';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Send, 
  Loader2, 
  MessageSquare, 
  User, 
  Bot, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle
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

interface UploadedDocument {
  id: string;
  name: string;
  content: string;
  size: number;
  type: string;
  uploadedAt: Date;
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
  
  // Get Echo SDK context for authentication and billing
  const { isAuthenticated, balance, token, refreshBalance } = useEcho() as any;
  const { currentLanguage, languageOptions } = useLanguage();
  
  console.log('🔑 Environment check on mount:', {
    echoAppId: process.env.REACT_APP_ECHO_APP_ID ? 'Present' : 'Missing',
    echoAuthenticated: isAuthenticated ? 'Yes' : 'No',
    echoBalance: balance?.credits || 0,
    hasToken: !!token,
    currentLanguage: currentLanguage
  });

  // Get current language details
  const getCurrentLanguage = () => {
    return languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];
  };

  const getLanguageInstructions = () => {
    const lang = getCurrentLanguage();
    switch (lang.code) {
      case 'es':
        return 'Responde en español. Eres un tutor de inglés como lengua extranjera (ELA) que ayuda a estudiantes hispanohablantes a aprender inglés. Proporciona explicaciones claras en español y ejemplos en inglés cuando sea apropiado.';
      case 'ht':
        return 'Reponn nan Kreyòl Ayisyen. Ou se yon pwofesè ELA (English Language Arts) ki ap ede elèv yo ki pale Kreyòl aprann anglè. Bay eksplikasyon ki klè nan Kreyòl ak egzanp nan anglè lè sa apropye.';
      default:
        return 'Respond in English. You are an ELA (English Language Arts) tutor helping students learn English language skills.';
    }
  };
  
  const getInitialMessage = () => {
    const lang = getCurrentLanguage();
    switch (lang.code) {
      case 'es':
        return '¡Hola! 👋 Soy tu tutor de inglés como lengua extranjera (ELA). Estoy aquí para ayudarte con:\n\n• Comprensión de lectura\n• Escritura y gramática\n• Vocabulario\n• Análisis literario\n• Preparación para exámenes\n\n¿En qué puedo ayudarte hoy? (Puedes preguntarme en español o inglés)';
      case 'ht':
        return 'Bonjou! 👋 Mwen se pwofesè ELA (English Language Arts) ou an. Mwen la pou ede w ak:\n\n• Konprann lekti\n• Ekriti ak gramè\n• Vokabilè\n• Analiz literè\n• Preparasyon egzamen\n\nKisa mwen ka ede w ak jodi a? (Ou ka mande m nan Kreyòl oswa nan anglè)';
      default:
        return 'Hello! 👋 I\'m your ELA (English Language Arts) tutor. I\'m here to help you with:\n\n• Reading comprehension\n• Writing and grammar\n• Vocabulary building\n• Literary analysis\n• Test preparation\n\nWhat can I help you with today?';
    }
  };

  const initialMessage = (author: string): Message[] => ([
    {
      id: 1,
      type: 'bot',
      content: getInitialMessage(),
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
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  


  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when language changes
  useEffect(() => {
    setMessages(initialMessage(selectedAuthor));
  }, [currentLanguage, selectedAuthor]);

  // Update available suggestions when conversation or language changes
  useEffect(() => {
    const updateSuggestions = async () => {
      const newSuggestions = await generateContextualSuggestions();
      setAvailableSuggestions(newSuggestions);
      setLastUpdateTime(Date.now());
    };
    updateSuggestions();
  }, [messages, currentLanguage]);

  // No auto-scroll - suggestions only change when conversation progresses

  // Get all 6 suggestions to display
  const getCurrentSuggestions = (): string[] => {
    return availableSuggestions.slice(0, 6);
  };

  const getTopics = (): Topic[] => {
    const lang = getCurrentLanguage();
    
    switch (lang.code) {
      case 'es':
        return [
          { id: 'reading', name: 'Comprensión de Lectura', icon: BookOpen },
          { id: 'writing', name: 'Habilidades de Escritura', icon: Users },
          { id: 'grammar', name: 'Gramática y Mecánica', icon: GraduationCap },
          { id: 'vocabulary', name: 'Construcción de Vocabulario', icon: Sparkles },
          { id: 'literature', name: 'Análisis Literario', icon: MessageSquare },
          { id: 'research', name: 'Habilidades de Investigación', icon: ChevronDown },
          { id: 'testprep', name: 'Preparación para Exámenes', icon: ChevronUp },
          { id: 'speaking', name: 'Oratoria', icon: RefreshCw },
        ];
      case 'ht':
        return [
          { id: 'reading', name: 'Konpreyansyon Lekti', icon: BookOpen },
          { id: 'writing', name: 'Kapasite Ekriti', icon: Users },
          { id: 'grammar', name: 'Gramè ak Mekanik', icon: GraduationCap },
          { id: 'vocabulary', name: 'Konstwi Vokabilè', icon: Sparkles },
          { id: 'literature', name: 'Analiz Literè', icon: MessageSquare },
          { id: 'research', name: 'Kapasite Rechèch', icon: ChevronDown },
          { id: 'testprep', name: 'Preparasyon pou Egzamen', icon: ChevronUp },
          { id: 'speaking', name: 'Kominote nan Piblik', icon: RefreshCw },
        ];
      default:
        return [
          { id: 'reading', name: 'Reading Comprehension', icon: BookOpen },
          { id: 'writing', name: 'Writing Skills', icon: Users },
          { id: 'grammar', name: 'Grammar & Mechanics', icon: GraduationCap },
          { id: 'vocabulary', name: 'Vocabulary Building', icon: Sparkles },
          { id: 'literature', name: 'Literature Analysis', icon: MessageSquare },
          { id: 'research', name: 'Research Skills', icon: ChevronDown },
          { id: 'testprep', name: 'Test Prep', icon: ChevronUp },
          { id: 'speaking', name: 'Public Speaking', icon: RefreshCw },
        ];
    }
  };

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

  // Call Echo LLM using AI SDK approach
  const callEchoLLM = async (userMessage: string): Promise<string> => {
    console.log('🔮 Calling Echo LLM using AI SDK...');
    
    try {
      const uiText = getUIText();
      
      // Check if user is authenticated with Echo
      if (!isAuthenticated) {
        return uiText.authRequired;
      }

      // Check if user has credits
      if (balance && balance.credits <= 0) {
        return uiText.creditsLow;
      }

      if (!token) {
        return uiText.tokenMissing;
      }

      console.log('🌐 Using AI SDK with Echo router...');
      
      // Create OpenAI client pointing to Echo's router
      const openai = createOpenAI({
        apiKey: token,
        baseURL: 'https://echo.router.merit.systems',
      });

      // Generate text using AI SDK
      const { text } = await generateText({
        model: openai('gpt-4o'),
        prompt: `${getLanguageInstructions()}

You are a helpful AI assistant specializing in English Language Arts (ELA) tutoring. You help students with reading comprehension, writing, grammar, vocabulary, and literary analysis. Always be encouraging and provide clear explanations.

User message: ${userMessage}

Respond helpfully and educationally to assist the student with their ELA learning.`,
        temperature: 0.7,
        maxTokens: 2000,
      });

      console.log('✅ AI SDK Response received');
      return text;
      
    } catch (error) {
      console.error('❌ Echo LLM Error:', error);
      
      const uiText = getUIText();
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return uiText.authError;
        } else if (error.message.includes('402') || error.message.includes('Payment')) {
          return uiText.paymentRequired;
        } else if (error.message.includes('429') || error.message.includes('Rate')) {
          return uiText.rateLimited;
        }
      }
      
      return uiText.connectionError;
    }
  };

  const generateContextualSuggestions = async (): Promise<string[]> => {
    const lang = getCurrentLanguage();
    
    // If no conversation yet, return foundational questions in the current language
    if (messages.length <= 1) {
      switch (lang.code) {
        case 'es':
          return [
            "¿Qué hace que una historia sea atractiva de leer?",
            "¿Cómo puedo expresar mis ideas con más claridad?",
            "¿Cuál es la diferencia entre escritura formal e informal?",
            "¿Cómo encuentro mi voz única de escritura?",
            "¿Cuáles son algunas técnicas para el pensamiento creativo?",
            "¿Cómo puede la lectura mejorar mis habilidades de escritura?"
          ];
        case 'ht':
          return [
            "Ki sa ki fè yon istwa atiran pou li?",
            "Kijan m ka eksprime ide m yo pi klè?",
            "Ki diferans ki genyen ant ekri fòmèl ak ekri enfòmèl?",
            "Kijan m ka jwenn vwa ekriti inik mwen an?",
            "Ki kèk teknik yo pou reflechi ak kreyativite?",
            "Kijan lekti ka amelyore kapasite ekriti m yo?"
          ];
        default:
          return [
            "What makes a story compelling to read?",
            "How can I express my ideas more clearly?",
            "What's the difference between formal and informal writing?",
            "How do I find my unique writing voice?",
            "What are some techniques for creative thinking?",
            "How can reading improve my writing skills?"
          ];
      }
    }

    try {
      // Get recent conversation context
      const recentMessages = messages.slice(-4);
      const conversationContext = recentMessages.map(m => 
        `${m.type === 'user' ? 'Student' : 'Tutor'}: ${m.content}`
      ).join('\n');

      // Get language-specific instructions for AI suggestions
      const suggestionInstructions = getSuggestionInstructions();

      // Use Echo LLM for suggestions too
      const response = await callEchoLLM(`${suggestionInstructions}

Based on this recent ELA tutoring conversation, generate exactly 6 thoughtful follow-up questions that would naturally extend the discussion and help the student learn more. The questions should be:
1. Directly related to what's been discussed
2. Progressively build on the concepts mentioned
3. Encourage deeper thinking and analysis
4. Be engaging and age-appropriate
5. Help the student make connections to broader learning

Recent conversation:
${conversationContext}

Please respond with exactly 6 questions, one per line, without numbering or bullet points. Make them natural follow-up questions that a thoughtful tutor would ask.`);

      // Check if response is an error message
      if (response.includes('**') && (response.includes('Error') || response.includes('Failed') || response.includes('Credits') || response.includes('Authentication'))) {
        console.log('Echo LLM failed for suggestions, using fallback');
        return getFallbackSuggestions();
      }

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

  const getSuggestionInstructions = () => {
    const lang = getCurrentLanguage();
    switch (lang.code) {
      case 'es':
        return 'Genera las preguntas de seguimiento en español. Las preguntas deben ser para un estudiante que está aprendiendo inglés como lengua extranjera.';
      case 'ht':
        return 'Jenere kesyon yo nan Kreyòl Ayisyen. Kesyon yo dwe pou yon elèv ki ap aprann anglè kòm dezyèm lang.';
      default:
        return 'Generate the follow-up questions in English for an ELA student.';
    }
  };

  const getFallbackSuggestions = (): string[] => {
    const lang = getCurrentLanguage();
    
    switch (lang.code) {
      case 'es':
        return [
          "¿En qué es lo más importante que debo enfocarme para mejorar?",
          "¿Cómo puedo practicar esta habilidad en mi vida diaria?",
          "¿Qué me ayudaría a sentirme más seguro sobre este tema?",
          "¿Qué patrones noto en la buena escritura?",
          "¿Cómo diferentes géneros abordan los mismos temas?",
          "¿Qué hace que algunos textos sean más memorables que otros?"
        ];
      case 'ht':
        return [
          "Ki bagay ki pi enpòtan pou m konsantre sou li pou m amelyore?",
          "Kijan m ka pratike kapasite sa a nan lavi m chak jou?",
          "Ki sa ki ta ede m santi m pi konfyan sou sijè sa a?",
          "Ki modèl mwen remake nan bon ekri?",
          "Ki jan diferan kalite tèks yo ap abòde menm sijè yo?",
          "Ki sa ki fè kèk tèks yo pi fasil pou sonje pase lòt yo?"
        ];
      default:
        return [
          "What's the most important thing I should focus on improving?",
          "How can I practice this skill in my daily life?",
          "What would help me feel more confident about this topic?",
          "What patterns do I notice in good writing?",
          "How do different genres approach the same themes?",
          "What makes some texts more memorable than others?"
        ];
    }
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
    if (!isAuthenticated) {
      const uiText = getUIText();
      const errorMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: uiText.authRequired,
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
    const topic = getTopics().find(t => t.id === topicId);
    if (topic) {
      const lang = getCurrentLanguage();
      let topicMessage = '';
      
      switch (lang.code) {
        case 'es':
          topicMessage = `Me gustaría trabajar en ${topic.name.toLowerCase()}.`;
          break;
        case 'ht':
          topicMessage = `Mwen ta renmen travay sou ${topic.name.toLowerCase()}.`;
          break;
        default:
          topicMessage = `I'd like to work on ${topic.name.toLowerCase()}.`;
          break;
      }
      
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
    setUploadedDocuments([]);
    setUploadError('');
  };

  // Document upload functions
  const handleFileUpload = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const newDocuments: UploadedDocument[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
          throw new Error(`Unsupported file type: ${file.name}. Please upload text files (.txt, .doc, .docx) only.`);
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}. Maximum size is 5MB.`);
        }
        
        const content = await readFileContent(file);
        const document: UploadedDocument = {
          id: Date.now().toString() + i,
          name: file.name,
          content: content,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        };
        
        newDocuments.push(document);
      }
      
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      
      // Auto-generate revision feedback for the first document
      if (newDocuments.length > 0) {
        await generateRevisionFeedback(newDocuments[0]);
      }
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const generateRevisionFeedback = async (document: UploadedDocument): Promise<void> => {
    const feedbackPrompt = `I've uploaded a document titled "${document.name}" for revision feedback. Please analyze this writing and provide constructive feedback focusing on AREAS FOR REVISION rather than individual mistakes. Consider:

1. **Structure & Organization**: How well is the piece organized? Are there logical flow issues?
2. **Content Development**: Are ideas fully developed and supported?
3. **Clarity & Coherence**: Is the writing clear and easy to follow?
4. **Style & Voice**: Does the writing style match the intended audience and purpose?
5. **Overall Impact**: How effective is the piece in achieving its goals?

Please provide specific, actionable suggestions for improvement. Here's the document content:

${document.content.substring(0, 3000)}${document.content.length > 3000 ? '...' : ''}`;

    // Add the feedback request to the chat
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: feedbackPrompt,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Process the feedback request
    setIsTyping(true);
    try {
      const response = await callEchoLLM(feedbackPrompt);
      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: 'I apologize, but I encountered an error while analyzing your document. Please try again or ask me a specific question about your writing.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const removeDocument = (documentId: string): void => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const getUIText = () => {
    const lang = getCurrentLanguage();
    
    const uiTexts = {
      en: {
        tutorSubtitle: 'ELA Tutor',
        newChat: 'New Chat',
        helpButton: '?',
        helpTitle: 'How I Can Help You',
        helpReading: {
          title: '📖 Reading Comprehension',
          description: 'Strategies for understanding texts, identifying main ideas, and analyzing content'
        },
        helpWriting: {
          title: '✍️ Writing Process',
          description: 'Brainstorming, outlining, drafting, revising, and editing your work'
        },
        helpGrammar: {
          title: '📝 Grammar & Mechanics',
          description: 'Sentence structure, punctuation, spelling, and language conventions'
        },
        helpLiterature: {
          title: '💭 Literature Analysis',
          description: 'Understanding themes, literary devices, character development, and more'
        },
        helpIntegrity: 'I help you learn and develop your own ideas - I don\'t write assignments for you!',
        quickTopics: 'Quick Topics',
        inputPlaceholder: 'Ask me about reading, writing, grammar, vocabulary, or literature...',
        smartSuggestions: '💡 Smart Suggestions',
        clickToExplore: '💬 Click any question to explore',
        startConversation: 'Start a conversation to see helpful suggestions!',
        authRequired: '⚠️ **Authentication Required**: Please sign in with Echo to use the ELA tutor.',
        integrityTitle: 'Academic Integrity Reminder',
        integrityMessage: 'I\'m here to help you learn, not to do your work for you! Academic integrity is important for your growth as a student and thinker.',
        integrityHelp: 'Instead of asking me to write something for you, let\'s work together on:\n• Brainstorming your ideas\n• Creating outlines and structure\n• Understanding the assignment requirements\n• Improving your writing process',
        integrityWarning: '⚠️ Multiple integrity violations detected. Please focus on learning rather than shortcuts.',
        understand: 'I Understand',
        academicIntegrity: 'Academic Integrity:',
        creditsLow: '💳 **No Credits Available**: You\'re out of Echo credits! Please purchase more credits to continue using AI features. You can buy credits from the header menu.',
        tokenMissing: '🔐 **Token Missing**: Authentication token not found. Please sign out and sign in again.',
        authError: '🔐 **Authentication Error**: Your session has expired. Please sign out and sign in again.',
        paymentRequired: '💳 **Payment Required**: You\'re out of Echo credits! Please purchase more credits to continue using AI features.',
        rateLimited: '⏰ **Rate Limited**: You\'re making requests too quickly. Please wait a moment and try again.',
        connectionError: '🚨 **Connection Error**: Failed to connect to Echo AI. Please check your internet connection and try again.',
        documentUpload: {
          title: '📄 Document Upload',
          subtitle: 'Upload your writing for revision feedback',
          dragDropText: 'Drag and drop your document here, or click to browse',
          uploadButton: 'Upload Document',
          supportedFormats: 'Supported formats: .txt, .doc, .docx (max 5MB)',
          uploading: 'Uploading...',
          uploadSuccess: 'Document uploaded successfully!',
          uploadError: 'Upload failed',
          removeDocument: 'Remove',
          analyzeDocument: 'Analyze for Revision',
          noDocuments: 'No documents uploaded yet'
        }
      },
      es: {
        tutorSubtitle: 'Tutor de ELA',
        newChat: 'Nueva Conversación',
        helpButton: '?',
        helpTitle: 'Cómo Puedo Ayudarte',
        helpReading: {
          title: '📖 Comprensión de Lectura',
          description: 'Estrategias para entender textos, identificar ideas principales y analizar contenido'
        },
        helpWriting: {
          title: '✍️ Proceso de Escritura',
          description: 'Lluvia de ideas, esquemas, borradores, revisión y edición de tu trabajo'
        },
        helpGrammar: {
          title: '📝 Gramática y Mecánica',
          description: 'Estructura de oraciones, puntuación, ortografía y convenciones del idioma'
        },
        helpLiterature: {
          title: '💭 Análisis Literario',
          description: 'Comprensión de temas, recursos literarios, desarrollo de personajes y más'
        },
        helpIntegrity: 'Te ayudo a aprender y desarrollar tus propias ideas - ¡no escribo tareas por ti!',
        quickTopics: 'Temas Rápidos',
        inputPlaceholder: 'Pregúntame sobre lectura, escritura, gramática, vocabulario o literatura...',
        smartSuggestions: '💡 Sugerencias Inteligentes',
        clickToExplore: '💬 Haz clic en cualquier pregunta para explorar',
        startConversation: '¡Inicia una conversación para ver sugerencias útiles!',
        authRequired: '⚠️ **Autenticación Requerida**: Por favor inicia sesión con Echo para usar el tutor de ELA.',
        integrityTitle: 'Recordatorio de Integridad Académica',
        integrityMessage: '¡Estoy aquí para ayudarte a aprender, no para hacer tu trabajo por ti! La integridad académica es importante para tu crecimiento como estudiante y pensador.',
        integrityHelp: 'En lugar de pedirme que escriba algo por ti, trabajemos juntos en:\n• Lluvia de ideas\n• Crear esquemas y estructura\n• Entender los requisitos de la tarea\n• Mejorar tu proceso de escritura',
        integrityWarning: '⚠️ Se detectaron múltiples violaciones de integridad. Por favor enfócate en aprender en lugar de buscar atajos.',
        understand: 'Entiendo',
        academicIntegrity: 'Integridad Académica:',
        creditsLow: '💳 **No Hay Créditos Disponibles**: ¡Se te acabaron los créditos de Echo! Por favor compra más créditos para continuar usando las funciones de IA. Puedes comprar créditos desde el menú del encabezado.',
        tokenMissing: '🔐 **Token Faltante**: Token de autenticación no encontrado. Por favor cierra sesión y vuelve a iniciar sesión.',
        authError: '🔐 **Error de Autenticación**: Tu sesión ha expirado. Por favor cierra sesión y vuelve a iniciar sesión.',
        paymentRequired: '💳 **Pago Requerido**: ¡Se te acabaron los créditos de Echo! Por favor compra más créditos para continuar usando las funciones de IA.',
        rateLimited: '⏰ **Límite de Velocidad**: Estás haciendo solicitudes muy rápido. Por favor espera un momento y vuelve a intentar.',
        connectionError: '🚨 **Error de Conexión**: Falló la conexión con Echo AI. Por favor verifica tu conexión a internet y vuelve a intentar.',
        documentUpload: {
          title: '📄 Subir Documento',
          subtitle: 'Sube tu escritura para recibir retroalimentación de revisión',
          dragDropText: 'Arrastra y suelta tu documento aquí, o haz clic para explorar',
          uploadButton: 'Subir Documento',
          supportedFormats: 'Formatos soportados: .txt, .doc, .docx (máx 5MB)',
          uploading: 'Subiendo...',
          uploadSuccess: '¡Documento subido exitosamente!',
          uploadError: 'Error al subir',
          removeDocument: 'Eliminar',
          analyzeDocument: 'Analizar para Revisión',
          noDocuments: 'Aún no se han subido documentos'
        }
      },
      ht: {
        tutorSubtitle: 'Pwofesè ELA',
        newChat: 'Nouvo Konvèsasyon',
        helpButton: '?',
        helpTitle: 'Kijan Mwen Ka Ede W',
        helpReading: {
          title: '📖 Konprann Lekti',
          description: 'Estrateji pou konprann tèks yo, idantifye ide prensipal yo ak analize kontni an'
        },
        helpWriting: {
          title: '✍️ Pwosesis Ekriti',
          description: 'Brainstorming, fè plan, ekri bouyon, revize ak korije travay ou'
        },
        helpGrammar: {
          title: '📝 Gramè ak Mekanik',
          description: 'Estrikti fraz, ponktiyasyon, òtograf ak konvansyon lang lan'
        },
        helpLiterature: {
          title: '💭 Analiz Literè',
          description: 'Konprann tèm yo, teknik literè, devlopman karaktè ak plis ankò'
        },
        helpIntegrity: 'Mwen ede w aprann ak devlope pwòp ide w yo - mwen pa ekri devwa pou ou!',
        quickTopics: 'Sijè Rapid',
        inputPlaceholder: 'Mande m sou lekti, ekriti, gramè, vokabilè, oswa literati...',
        smartSuggestions: '💡 Sijesyon Entèlijan',
        clickToExplore: '💬 Klike sou nenpòt kesyon pou eksplore',
        startConversation: 'Kòmanse yon konvèsasyon pou wè sijesyon itil yo!',
        authRequired: '⚠️ **Otentifikasyon Obligatwa**: Tanpri konekte ak Echo pou itilize pwofesè ELA a.',
        integrityTitle: 'Rapèl Entegrite Akademik',
        integrityMessage: 'Mwen la pou ede w aprann, pa pou fè travay ou pou ou! Entegrite akademik enpòtan pou kwasans ou kòm elèv ak moun k ap reflechi.',
        integrityHelp: 'Olye mande m ekri yon bagay pou ou, ann travay ansanm sou:\n• Brainstorming ide w yo\n• Kreye plan ak estrikti\n• Konprann egzijans devwa a\n• Amelyore pwosesis ekriti w',
        integrityWarning: '⚠️ Yo detekte plizyè vyolasyon entegrite. Tanpri konsantre sou aprann olye chèche raccourci.',
        understand: 'Mwen Konprann',
        academicIntegrity: 'Entegrite Akademik:',
        creditsLow: '💳 **Pa Gen Kredi Disponib**: Ou pa gen kredi Echo ankò! Tanpri achte plis kredi pou kontinye itilize fonksyon AI yo. Ou ka achte kredi nan meni tèt la.',
        tokenMissing: '🔐 **Token Manke**: Token otentifikasyon an pa jwenn. Tanpri dekonekte ak konekte ankò.',
        authError: '🔐 **Erè Otentifikasyon**: Sesyon ou an ekspire. Tanpri dekonekte ak konekte ankò.',
        paymentRequired: '💳 **Peman Obligatwa**: Ou pa gen kredi Echo ankò! Tanpri achte plis kredi pou kontinye itilize fonksyon AI yo.',
        rateLimited: '⏰ **Limit Vitès**: W ap fè demann yo twò vit. Tanpri tann yon moman ak eseye ankò.',
        connectionError: '🚨 **Erè Koneksyon**: Echèk koneksyon ak Echo AI. Tanpri verifye koneksyon entènèt ou ak eseye ankò.',
        documentUpload: {
          title: '📄 Telechaje Dokiman',
          subtitle: 'Telechaje ekriti w pou resevwa fidbak pou revizyon',
          dragDropText: 'Trennen ak lage dokiman w isit la, oswa klike pou navige',
          uploadButton: 'Telechaje Dokiman',
          supportedFormats: 'Fòma sipòte: .txt, .doc, .docx (maks 5MB)',
          uploading: 'Ap telechaje...',
          uploadSuccess: 'Dokiman telechaje avèk siksè!',
          uploadError: 'Echèk telechaj',
          removeDocument: 'Retire',
          analyzeDocument: 'Analize pou Revizyon',
          noDocuments: 'Pa gen dokiman telechaje ankò'
        }
      }
    };

    return uiTexts[lang.code as keyof typeof uiTexts] || uiTexts.en;
  };

  const currentSuggestions = getCurrentSuggestions();
  const uiText = getUIText();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Claude {selectedAuthor}</h1>
            <p className="text-sm text-purple-200">{uiText.tutorSubtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleNewChat}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
          >
            {uiText.newChat}
          </button>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            {uiText.helpButton}
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-purple-800/50 backdrop-blur-md border-b border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{uiText.helpTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
            <div>
              <h4 className="font-medium text-white">{uiText.helpReading.title}</h4>
              <p>{uiText.helpReading.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-white">{uiText.helpWriting.title}</h4>
              <p>{uiText.helpWriting.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-white">{uiText.helpGrammar.title}</h4>
              <p>{uiText.helpGrammar.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-white">{uiText.helpLiterature.title}</h4>
              <p>{uiText.helpLiterature.description}</p>
            </div>
          </div>
          <p className="text-xs text-purple-300 mt-3">
            <strong>{uiText.academicIntegrity}</strong> {uiText.helpIntegrity}
          </p>
        </div>
      )}

      {/* Topic Selection */}
      <div className="bg-black/10 backdrop-blur-md border-b border-white/10 p-4">
        <h3 className="text-sm font-medium text-white mb-3">{uiText.quickTopics}</h3>
        <div className="flex flex-wrap gap-2">
          {getTopics().map((topic) => {
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
      <div className="flex min-h-96">
        {/* Chat Area - Left Side */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 backdrop-blur-md text-white select-none'
              }`}
              style={{
                userSelect: message.type === 'bot' ? 'none' : 'auto',
                WebkitUserSelect: message.type === 'bot' ? 'none' : 'auto',
                MozUserSelect: message.type === 'bot' ? 'none' : 'auto',
                msUserSelect: message.type === 'bot' ? 'none' : undefined
              }}
              onContextMenu={message.type === 'bot' ? (e) => e.preventDefault() : undefined}
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
                placeholder={uiText.inputPlaceholder}
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
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">{uiText.smartSuggestions}</h4>
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
                      <MessageSquare className="w-3 h-3 text-purple-300 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-600/20 border border-purple-400/30 rounded-lg">
                <div className="text-xs text-purple-300 text-center">
                  💬 {uiText.clickToExplore}
                </div>
              </div>
            </div>
          )}
          
          {currentSuggestions.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-purple-300 text-sm">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{uiText.startConversation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="bg-black/20 backdrop-blur-md border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">{uiText.documentUpload.title}</h3>
          </div>
          <p className="text-sm text-purple-200 mb-4">{uiText.documentUpload.subtitle}</p>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-purple-400 bg-purple-900/20'
                : 'border-white/20 hover:border-purple-400/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                <p className="text-purple-200">{uiText.documentUpload.uploading}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-white font-medium mb-1">{uiText.documentUpload.dragDropText}</p>
                <p className="text-xs text-purple-300">{uiText.documentUpload.supportedFormats}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-400/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-200 text-sm">{uploadError}</p>
            </div>
          )}

          {/* Uploaded Documents */}
          {uploadedDocuments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-2">Uploaded Documents:</h4>
              <div className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-purple-300">
                          {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => generateRevisionFeedback(doc)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors"
                      >
                        {uiText.documentUpload.analyzeDocument}
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Documents Message */}
          {uploadedDocuments.length === 0 && !isUploading && (
            <div className="mt-4 text-center text-purple-300 text-sm">
              <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>{uiText.documentUpload.noDocuments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Academic Dishonesty Modal */}
      {showDishonestyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">{uiText.integrityTitle}</h3>
            <p className="text-gray-700 mb-4">
              {uiText.integrityMessage}
            </p>
            <p className="text-gray-700 mb-4">
              {uiText.integrityHelp}
            </p>
            {dishonestyCount > 3 && (
              <p className="text-red-600 font-medium mb-4">
                ⚠️ {uiText.integrityWarning}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDishonestyModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {uiText.understand}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELATutorChatbot; 