import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, PenTool, FileText, MessageCircle, Lightbulb, CheckCircle } from 'lucide-react';
import { useMockEcho } from '../MockEchoProvider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

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

type Mode = 'demo' | 'echo';

// Famous author last names for random selection
const famousAuthors: string[] = [
  'Hemingway', 'Fitzgerald', 'Dickens', 'Austen', 'Tolstoy', 'Dostoevsky', 
  'Shakespeare', 'Poe', 'Twain', 'Steinbeck', 'Faulkner', 'Joyce', 
  'Woolf', 'Orwell', 'Bradbury', 'Vonnegut', 'Salinger', 'Kerouac',
  'Ginsberg', 'Plath', 'Angelou', 'Morrison', 'King', 'Rowling',
  'Tolkien', 'Lewis', 'Wilde', 'Bronte', 'Eliot', 'Yeats'
];

const ELATutorChatbot: React.FC = () => {
  console.log('ELATutorChatbot: Component is loading...');
  
  // Safely handle Echo SDK with fallback
  let echoState;
  try {
    echoState = useMockEcho();
  } catch (error) {
    console.warn('Echo SDK initialization failed:', error);
    echoState = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      balance: null,
      signOut: () => console.log('Demo mode - signOut'),
      signIn: () => console.log('Demo mode - signIn')
    };
  }
  
  // Provide defaults for potentially undefined values
  const {
    isAuthenticated = false,
    isLoading = false,
    user = null,
    balance = null,
    signOut = () => console.log('Demo mode - signOut'),
    signIn = () => console.log('Demo mode - signIn')
  } = echoState || {};
  
  console.log('ELATutorChatbot: Echo state:', { isAuthenticated, isLoading, user, balance });
  console.log('ELATutorChatbot: signIn function exists:', !!signIn);
  
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

  // Mode: 'demo' (fallbacks only) or 'echo' (Claude via Echo)
  const [mode, setMode] = useState<Mode>('echo'); // Changed to 'echo' to enable Echo integration

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Claude system prompt with ethical guidelines
  const SYSTEM_PROMPT = `
You are Claude, an ELA tutor with a randomly selected famous author's last name. You help students with English Language Arts including reading comprehension, writing, grammar, vocabulary, and literature analysis.

CRITICAL ETHICAL GUIDELINES - YOU MUST FOLLOW THESE:
1. NEVER write essays, papers, or assignments for students
2. NEVER complete homework or assignments for students
3. NEVER provide full written content that students can submit as their own work
4. ALWAYS redirect writing requests to brainstorming, outlining, and process guidance
5. Focus on teaching the writing process, not doing the writing
6. Help students develop their own ideas and structure
7. Provide feedback on their work, not replacement content

TONE AND TEACHING STYLE:
- Always be supportive, encouraging, and positive—like a great teacher or mentor.
- Celebrate effort, curiosity, and progress.
- Encourage students to think for themselves, express their own ideas, and take creative risks.
- Use affirmations like "Great question!", "You're on the right track!", "Your ideas matter!", "Let's figure it out together!", "I'm here to support your learning journey."
- Never criticize or discourage; always reframe mistakes as learning opportunities.
- End responses with a nudge toward independent thinking or next steps.

ACADEMIC INTEGRITY RESPONSES:
If a student asks you to write something for them, respond with:
"I understand you're looking for help with your writing! However, I can't write your essay, paper, or assignment for you - that would be academic dishonesty and wouldn't help you learn. Instead, let me help you develop your own ideas and structure your writing. Would you like to start by brainstorming your main ideas or creating an outline?"

YOUR ROLE:
- Help with reading comprehension strategies
- Guide students through the writing process (brainstorming, outlining, revising)
- Teach grammar and mechanics
- Build vocabulary skills
- Analyze literature and literary devices
- Provide constructive feedback on student work
- Encourage independent thinking and learning

Always maintain academic integrity and promote genuine learning.
`;

  const callClaudeAPI = async (userMessage: string): Promise<string> => {
    console.log('Calling Claude API...');
    
    // Check if user has sufficient balance
    if (balance && typeof balance === 'number' && balance < 10) {
      return "I notice your balance is running low. You'll need to add credits to continue using the Claude AI tutor. In the meantime, I can provide basic guidance using the educational resources built into this platform.";
    }

    try {
      const anthropic = createAnthropic({
        apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || 'sk-ant-placeholder',
      });

      console.log('Creating stream...');
      const result = await streamText({
        model: anthropic('claude-3-haiku-20240307'),
        system: SYSTEM_PROMPT,
        messages: [
          ...messages.map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user' as const, content: userMessage }
        ],
        maxTokens: 500,
        temperature: 0.7,
      });

      let fullResponse = '';
      for await (const chunk of result.textStream) {
        fullResponse += chunk;
      }

      console.log('Received Claude response:', fullResponse);
      return fullResponse;
    } catch (error) {
      console.error('Claude API error:', error);
      return generateFallbackResponse(userMessage);
    }
  };

  const generateSuggestions = (content: string): string[] => {
    const lowerContent = content.toLowerCase();
    
    // Context-aware suggestions based on conversation content
    let suggestions: string[] = [];
    
    if (lowerContent.includes('read') || lowerContent.includes('comprehension')) {
      suggestions = [
        "What strategies help with reading comprehension?",
        "How can I identify the main idea in complex texts?",
        "What are context clues and how do I use them?",
        "How do I analyze cause and effect in reading?",
        "What's the difference between fact and opinion?",
        "How can I improve my reading speed and retention?"
      ];
    } else if (lowerContent.includes('writ') || lowerContent.includes('essay')) {
      suggestions = [
        "How do I create a strong thesis statement?",
        "What's the best way to organize my paragraphs?",
        "How can I improve my transitions between ideas?",
        "What makes a compelling introduction?",
        "How do I cite sources properly?",
        "What's the difference between revising and editing?"
      ];
    } else if (lowerContent.includes('grammar') || lowerContent.includes('sentence')) {
      suggestions = [
        "When should I use commas in a sentence?",
        "What's the difference between active and passive voice?",
        "How do I fix run-on sentences?",
        "What are the most common grammar mistakes?",
        "How do I use semicolons correctly?",
        "What's subject-verb agreement?"
      ];
    } else if (lowerContent.includes('vocab') || lowerContent.includes('word')) {
      suggestions = [
        "How can I learn new vocabulary effectively?",
        "What are root words and how do they help?",
        "How do I use context to understand unfamiliar words?",
        "What's the difference between denotation and connotation?",
        "How can I improve my academic vocabulary?",
        "What are some powerful transition words?"
      ];
    } else if (lowerContent.includes('literature') || lowerContent.includes('poem') || lowerContent.includes('story')) {
      suggestions = [
        "How do I analyze themes in literature?",
        "What are common literary devices and their effects?",
        "How do I understand symbolism in stories?",
        "What's the difference between plot and theme?",
        "How do I analyze character development?",
        "What makes poetry different from prose?"
      ];
    } else if (lowerContent.includes('test') || lowerContent.includes('exam')) {
      suggestions = [
        "What are the best test-taking strategies for ELA?",
        "How should I manage my time during reading tests?",
        "What's the best way to approach essay questions?",
        "How do I eliminate wrong answers on multiple choice?",
        "What should I review before an ELA test?",
        "How can I reduce test anxiety?"
      ];
    } else if (lowerContent.includes('speak') || lowerContent.includes('present')) {
      suggestions = [
        "How can I organize my presentation effectively?",
        "What techniques help with public speaking nerves?",
        "How do I engage my audience during presentations?",
        "What makes visual aids effective?",
        "How can I improve my voice and body language?",
        "What's the best way to practice a speech?"
      ];
    } else {
      // General suggestions for any context
      suggestions = [
        "How can I become a better reader?",
        "What makes writing more engaging?",
        "How do I improve my grammar skills?",
        "What are effective study strategies for ELA?",
        "How can I build my vocabulary?",
        "What's the key to understanding literature?",
        "How do I write a strong conclusion?",
        "What are good research techniques?",
        "How can I improve my critical thinking?",
        "What makes effective communication?",
        "How do I analyze different text types?",
        "What are the elements of good storytelling?"
      ];
    }
    
    // Return 4 random suggestions from the appropriate category
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
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
        "Writing is a process, and I'm here to guide you through it! Here's a helpful framework: 🔍 Brainstorm your ideas, 🏗️ Organize them logically, ✍️ Write your first draft, 🔄 Revise for content and clarity, ✅ Proofread for errors. Which step would you like help with?",
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
    
    // Vocabulary responses
    if (lowerMessage.includes('vocab') || lowerMessage.includes('word') || lowerMessage.includes('meaning')) {
      const responses = [
        "Building vocabulary is fantastic for improving your reading and writing! Try these strategies: 📖 Read widely and regularly, 📝 Keep a vocabulary journal, 🔍 Learn word roots and prefixes, 🎯 Use new words in your writing. What words are you curious about?",
        "Vocabulary growth takes time and practice! Here are some effective methods: 🧩 Study word families and patterns, 📚 Read texts slightly above your level, 🗣️ Use new words in conversation, ✍️ Practice with vocabulary games. Which approach interests you most?",
        "Expanding your vocabulary opens up new ways to express yourself! Consider these techniques: 🎨 Learn synonyms for common words, 🔗 Understand context clues, 📖 Read diverse genres, 💭 Make personal connections to new words. What vocabulary goals do you have?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Literature analysis responses
    if (lowerMessage.includes('literature') || lowerMessage.includes('poem') || lowerMessage.includes('story') || lowerMessage.includes('novel')) {
      const responses = [
        "Literature analysis is such a rewarding skill! When analyzing texts, consider: 🎭 Character development and motivations, 🎨 Literary devices (metaphor, symbolism, etc.), 🏛️ Theme and deeper meanings, 📖 Setting and its significance. What literary work are you studying?",
        "Great literature offers layers of meaning to explore! Look for: ✨ Symbolism and metaphors, 🗣️ The author's tone and style, 🔍 Conflicts and their resolutions, 🎯 Universal themes and messages. Which aspect of literature analysis interests you most?",
        "Analyzing literature helps you appreciate the craft of writing! Focus on: 📚 Plot structure and pacing, 👥 Character relationships and growth, 🎨 Language choices and their effects, 💭 Historical and cultural context. What text would you like to discuss?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Test prep responses
    if (lowerMessage.includes('test') || lowerMessage.includes('exam') || lowerMessage.includes('quiz')) {
      const responses = [
        "Test preparation in ELA requires strategic practice! Focus on: 📖 Reading comprehension strategies, ✍️ Essay writing techniques, 📝 Grammar and mechanics review, 🕐 Time management during tests. What type of test are you preparing for?",
        "Great test prep combines knowledge and strategy! Try these approaches: 🎯 Practice with sample questions, 📚 Review key concepts regularly, ⏰ Work on pacing yourself, 🧘 Develop test-taking confidence. Which area would you like to focus on?",
        "Effective test preparation builds both skills and confidence! Consider: 📋 Creating study schedules, 🔍 Identifying your weak areas, 💪 Practicing under timed conditions, 📖 Reviewing feedback on practice tests. How can I help with your test prep?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Speaking/presentation responses
    if (lowerMessage.includes('speak') || lowerMessage.includes('present') || lowerMessage.includes('speech')) {
      const responses = [
        "Public speaking is a valuable skill that improves with practice! Key areas to focus on: 🎯 Organizing your main points clearly, 🗣️ Using engaging voice and body language, 👥 Connecting with your audience, 💪 Building confidence through preparation. What speaking challenge are you facing?",
        "Presentation skills help in many areas of life! Consider these elements: 📝 Strong opening and closing, 📊 Clear structure and transitions, 🎨 Effective use of visual aids, 🔄 Practice and rehearsal. What type of presentation are you working on?",
        "Speaking confidently comes with preparation and practice! Focus on: 💭 Knowing your material well, 🎭 Using storytelling techniques, 👁️ Making eye contact with your audience, 🌟 Showing enthusiasm for your topic. How can I help you prepare?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Research and citation responses
    if (lowerMessage.includes('research') || lowerMessage.includes('source') || lowerMessage.includes('citation')) {
      const responses = [
        "Research skills are essential for academic success! Key areas to focus on: 🔍 Evaluating source credibility and bias, 📚 Using databases and reliable websites, 📝 Taking effective notes and organizing information, ✅ Proper citation formats (MLA, APA, etc.). What research project are you working on?",
        "Great research starts with great questions! Here's a helpful process: 🎯 Develop focused research questions, 🔍 Find diverse and credible sources, 📋 Take notes and track your sources, 📝 Synthesize information from multiple sources. What's your research topic?",
        "Learning to research effectively is a valuable life skill! Consider these strategies: 💡 Start with background reading, 🏛️ Use library databases for scholarly sources, 🔍 Fact-check information across multiple sources, 📝 Keep detailed citation records. How can I help with your research?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Creative writing responses
    if (lowerMessage.includes('creative') || lowerMessage.includes('story') || lowerMessage.includes('poem') || lowerMessage.includes('fiction')) {
      const responses = [
        "Creative writing is such a wonderful way to express yourself! Key elements to consider: 🎭 Developing compelling characters, 🏞️ Creating vivid settings, 📚 Building engaging plots, 🎨 Using literary devices effectively. What type of creative writing interests you?",
        "Creativity in writing comes from practice and experimentation! Try these techniques: 💭 Brainstorm freely without judgment, 🎯 Show don't tell through descriptive details, 🗣️ Develop authentic dialogue, 🔄 Revise and refine your work. What's your creative writing goal?",
        "Every great writer started as a beginner! Focus on these fundamentals: 📖 Read widely in your genre, ✍️ Write regularly to build skills, 🎨 Experiment with different styles, 👥 Share your work for feedback. What creative project are you working on?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Critical thinking responses
    if (lowerMessage.includes('critical') || lowerMessage.includes('analysis') || lowerMessage.includes('argument') || lowerMessage.includes('evidence')) {
      const responses = [
        "Critical thinking is at the heart of ELA! Key skills to develop: 🤔 Questioning assumptions and claims, 📊 Evaluating evidence and sources, 🔗 Making logical connections, 🎯 Forming well-reasoned conclusions. What are you analyzing?",
        "Strong critical thinking makes you a better reader and writer! Practice these skills: 📚 Identify main arguments and supporting evidence, 🔍 Recognize bias and perspective, 💭 Consider multiple viewpoints, 📝 Articulate your own reasoned opinions. What's your analytical challenge?",
        "Developing critical thinking takes practice! Try these approaches: ❓ Ask 'why' and 'how' questions, 🔍 Look for patterns and connections, ⚖️ Weigh different perspectives, 📝 Support your ideas with evidence. What topic are you thinking critically about?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Study strategies responses
    if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('practice') || lowerMessage.includes('improve')) {
      const responses = [
        "Effective studying makes all the difference in ELA! Try these strategies: 📅 Create a consistent study schedule, 📝 Use active reading techniques, 🎯 Practice with sample questions, 🗣️ Discuss concepts with others. What area do you want to improve?",
        "Learning ELA skills takes consistent practice! Here are proven methods: 📚 Read diverse texts regularly, ✍️ Write something every day, 🔄 Review and reflect on your progress, 💡 Apply skills to new situations. What's your learning goal?",
        "Building strong ELA skills is a process! Focus on these areas: 📖 Vocabulary development through reading, 🖊️ Writing practice with feedback, 🎯 Grammar through examples and exercises, 💭 Critical thinking through analysis. Where would you like to start?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Reading different genres responses
    if (lowerMessage.includes('genre') || lowerMessage.includes('type') || lowerMessage.includes('kind') || lowerMessage.includes('different')) {
      const responses = [
        "Exploring different genres expands your literary horizons! Each genre offers unique elements: 📚 Fiction (character, plot, theme), 📰 Non-fiction (facts, arguments, evidence), 🎭 Drama (dialogue, stage directions), 📝 Poetry (imagery, rhythm, form). What genre interests you most?",
        "Different text types require different reading strategies! Here's how to approach them: 📖 Narratives (follow plot and character development), 📊 Informational texts (identify main ideas and evidence), 🎨 Literary texts (analyze literary devices and themes). What type of text are you reading?",
        "Each genre has its own conventions and purposes! Understanding these helps you: 🎯 Set appropriate expectations, 🔍 Use genre-specific reading strategies, 📝 Appreciate the author's craft, 💭 Make meaningful connections. Which genre would you like to explore?"
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
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      let botResponse: string;
      
      if (mode === 'echo' && isAuthenticated) {
        console.log('Using Echo/Claude API...');
        botResponse = await callClaudeAPI(inputValue);
      } else {
        console.log('Using fallback response...');
        botResponse = generateFallbackResponse(inputValue);
      }

      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: generateFallbackResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
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

  const currentSuggestions = messages.length > 0 ? generateSuggestions(messages[messages.length - 1].content) : [];

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
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-purple-200">
                  {(user as any)?.name || 'Student'}
                </p>
                <p className="text-xs text-purple-300">
                  Balance: ${typeof balance === 'number' ? balance : 0}
                </p>
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-purple-200">
                {isLoading ? 'Loading...' : 'Demo Mode'}
              </span>
              {!isLoading && signIn && (
                <button
                  onClick={signIn}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                >
                  Sign In for AI Tutoring
                </button>
              )}
            </div>
          )}
          
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

      {/* Mode indicator */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 text-center">
        <p className="text-sm text-blue-200">
          {mode === 'echo' && isAuthenticated 
            ? "🤖 AI-Powered Tutoring Active" 
            : "📚 Educational Resources Mode - Sign in for AI tutoring"}
        </p>
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
              <h4 className="text-sm font-semibold text-white">💡 Quick Tips</h4>
            </div>
          </div>
          
          {currentSuggestions.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {currentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-start gap-2 p-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-400/50 text-purple-100 hover:text-white text-sm rounded-lg transition-all duration-200 text-left group"
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