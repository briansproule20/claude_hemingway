import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, PenTool, FileText, MessageCircle, Lightbulb, CheckCircle } from 'lucide-react';
import { useEcho, EchoSignIn } from '../useEcho';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Echo config (ensure appId is always set)
const echoConfig = {
  appId: 'd58eee0b-692b-4c2b-b384-6da6e513ea85',
  apiUrl: 'https://echo.merit.systems',
  redirectUri: window.location.origin,
};

// Famous author last names for random selection
const famousAuthors = [
  'Hemingway', 'Fitzgerald', 'Dickens', 'Austen', 'Tolstoy', 'Dostoevsky', 
  'Shakespeare', 'Poe', 'Twain', 'Steinbeck', 'Faulkner', 'Joyce', 
  'Woolf', 'Orwell', 'Bradbury', 'Vonnegut', 'Salinger', 'Kerouac',
  'Ginsberg', 'Plath', 'Angelou', 'Morrison', 'King', 'Rowling',
  'Tolkien', 'Lewis', 'Wilde', 'Bronte', 'Eliot', 'Yeats'
];

const ELATutorChatbot = () => {
  const { isAuthenticated, isLoading, user, balance, signOut } = useEcho(echoConfig);
  
  // Randomly select an author name on component mount
  const [selectedAuthor] = useState(() => {
    const randomIndex = Math.floor(Math.random() * famousAuthors.length);
    return famousAuthors[randomIndex];
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hi! I'm Claude ${selectedAuthor}, your ELA tutor. I'm here to help you with reading comprehension, writing, grammar, vocabulary, and literature analysis. What would you like to work on today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const messagesEndRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);

  // Expanded list of academic dishonesty phrases
  const writingRequestPatterns = [
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
  const [dishonestyCount, setDishonestyCount] = useState(0);
  const [showDishonestyModal, setShowDishonestyModal] = useState(false);

  // Mode: 'demo' (fallbacks only) or 'echo' (Claude via Echo)
  const [mode, setMode] = useState('demo'); // Change to 'echo' to enable Echo integration

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const topics = [
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
  const checkForWritingRequests = (message) => {
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

  const callClaudeAPI = async (userMessage) => {
    try {
      // Check for writing requests first
      if (checkForWritingRequests(userMessage)) {
        return {
          content: "I understand you're looking for help with your writing! However, I can't write your essay, paper, or assignment for you - that would be academic dishonesty and wouldn't help you learn.\n\nInstead, let me help you develop your own ideas and structure your writing:\n\n💡 **Let's Brainstorm Together:**\n• What's your main topic or thesis?\n• What are your key arguments or points?\n• What evidence or examples can you use?\n• Who is your audience?\n\n📝 **Writing Structure Help:**\n• I can help you outline your ideas\n• Guide you through the writing process\n• Review your grammar and style\n• Help you develop stronger arguments\n\n🎯 **What I Can Do:**\n• Help you organize your thoughts\n• Suggest writing strategies\n• Review your work for structure and clarity\n• Provide feedback on your ideas\n\nWould you like to start by brainstorming your main ideas or creating an outline?",
          suggestions: ["Help me brainstorm ideas", "Create an outline", "Writing process steps", "Thesis statement help"]
        };
      }

      if (mode === 'demo') {
        // Block all Claude API calls in demo mode
        return generateFallbackResponse(userMessage);
      }

      // Echo mode: (Claude via Echo, if enabled)
      // ... existing code for Claude API call ...
    } catch (error) {
      console.error('Error calling Claude API:', error);
      // Fallback to static responses if API fails
      return generateFallbackResponse(userMessage);
    }
  };

  const generateSuggestions = (content) => {
    const lowerContent = content.toLowerCase();
    const suggestions = [];

    if (lowerContent.includes('reading') || lowerContent.includes('comprehension')) {
      suggestions.push("Practice summarizing", "Main idea vs details", "Making inferences");
    }
    if (lowerContent.includes('writing') || lowerContent.includes('essay')) {
      suggestions.push("Help me brainstorm", "Create an outline", "Writing process help");
    }
    if (lowerContent.includes('grammar') || lowerContent.includes('sentence')) {
      suggestions.push("Subject-verb agreement", "Comma rules", "Sentence structure");
    }
    if (lowerContent.includes('vocabulary') || lowerContent.includes('words')) {
      suggestions.push("Context clues practice", "Word roots & prefixes", "Vocabulary games");
    }
    if (lowerContent.includes('literature') || lowerContent.includes('analysis')) {
      suggestions.push("Character analysis", "Theme identification", "Literary devices");
    }

    // Add default suggestions if none were generated
    if (suggestions.length === 0) {
      suggestions.push("Reading help", "Writing assistance", "Grammar review", "Vocabulary building");
    }

    return suggestions.slice(0, 4); // Return max 4 suggestions
  };

  const generateFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Academic dishonesty check (already handled by modal)

    // Reading Comprehension responses
    if (message.includes('reading') || message.includes('comprehension') || message.includes('understand')) {
      return {
        content: `Great! Reading comprehension is all about understanding what you read. Here are some strategies:

📖 **Before Reading:**
• Preview the text (title, headings, images)
• Make predictions about the content
• Set a purpose for reading

🤔 **During Reading:**
• Ask questions as you read
• Visualize the scenes or information
• Make connections to your own experiences

✅ **After Reading:**
• Summarize the main ideas
• Identify key details that support the main idea
• Reflect on what you learned

**Want to practice?** I can help you with summarizing, finding the main idea, or making inferences. Just ask!`,
        suggestions: ["Practice summarizing", "Main idea vs details", "Making inferences", "Reading strategies"]
      };
    }
    
    // Writing responses
    if (message.includes('writing') || message.includes('essay') || message.includes('paragraph')) {
      return {
        content: `Excellent! Writing is a process that gets easier with practice. Let's break it down:

✏️ **The Writing Process:**
1. **Prewriting** - Brainstorm and organize your ideas (I can help you brainstorm topics or create a mind map)
2. **Drafting** - Get your ideas down on paper (I can help you outline your essay or structure your paragraphs)
3. **Revising** - Improve content and organization (I can review your structure and suggest improvements)
4. **Editing** - Fix grammar, spelling, and punctuation (I can help you proofread and polish your writing)
5. **Publishing** - Share your final piece

📝 **Essay Structure:**
• **Introduction** - Hook, background, thesis statement
• **Body Paragraphs** - Topic sentence, evidence, explanation
• **Conclusion** - Restate thesis, summarize, final thought

💡 **Let's Work Together:**
• I can help you brainstorm ideas
• Guide you through outlining
• Review your structure and organization
• Provide feedback on your writing process

**What would you like to work on first?** Brainstorming, outlining, or reviewing your current work?`,
        suggestions: ["Help me brainstorm", "Create an outline", "Review my structure", "Writing process help"]
      };
    }
    
    // Grammar responses
    if (message.includes('grammar') || message.includes('punctuation') || message.includes('sentence')) {
      return {
        content: `Grammar helps us communicate clearly! Here are some key areas:

🔤 **Parts of Speech:**
• Nouns (person, place, thing, idea)
• Verbs (action or state of being)
• Adjectives (describe nouns)
• Adverbs (describe verbs, adjectives, other adverbs)

✏️ **Sentence Structure:**
• Simple: One independent clause
• Compound: Two independent clauses joined by conjunction
• Complex: Independent + dependent clause

📍 **Common Punctuation:**
• Period (.) - End of statement
• Question mark (?) - End of question
• Comma (,) - Separate items, clauses
• Semicolon (;) - Connect related independent clauses

**Want to practice?** I can quiz you or explain any grammar topic!`,
        suggestions: ["Subject-verb agreement", "Comma rules", "Sentence fragments", "Run-on sentences"]
      };
    }
    
    // Vocabulary responses
    if (message.includes('vocabulary') || message.includes('words') || message.includes('meaning')) {
      return {
        content: `Building vocabulary is key to better reading and writing! Here are proven strategies:

📚 **Word Learning Strategies:**
• **Context clues** - Use surrounding words to guess meaning (I can give you practice sentences)
• **Word parts** - Learn prefixes, roots, and suffixes (I can help you break down words)
• **Synonyms & antonyms** - Connect new words to known words
• **Visual associations** - Create mental images

🔍 **Context Clue Types:**
• Definition - Word is defined in the sentence
• Example - Examples help explain the word
• Contrast - Opposite meaning is given
• Inference - Use logic to determine meaning

💡 **Daily Practice:**
• Keep a vocabulary journal
• Use new words in sentences
• Read diverse materials
• Play word games

**Want to try a vocabulary game or practice with context clues?**`,
        suggestions: ["Context clues practice", "Word roots & prefixes", "Synonym activities", "Vocabulary games"]
      };
    }
    
    // Literature responses
    if (message.includes('literature') || message.includes('poem') || message.includes('story') || message.includes('analysis')) {
      return {
        content: `Literature analysis helps us understand deeper meanings in texts! Here's how to approach it:

📖 **Literary Elements:**
• **Plot** - Sequence of events (exposition, rising action, climax, falling action, resolution)
• **Character** - People in the story (protagonist, antagonist, round, flat)
• **Setting** - Time and place
• **Theme** - Central message or lesson
• **Point of view** - Who tells the story (1st, 2nd, 3rd person)

🎭 **Literary Devices:**
• Metaphor & Simile - Comparisons
• Symbolism - Objects representing ideas
• Irony - Contrast between expectation and reality
• Foreshadowing - Hints about future events

🤔 **Analysis Questions:**
• What is the author trying to say?
• How do characters change?
• What symbols appear repeatedly?
• How does setting affect the story?

**Want to practice?** I can help you analyze a story, poem, or character!`,
        suggestions: ["Character analysis", "Theme identification", "Literary devices", "Poetry analysis"]
      };
    }
    
    // Research skills
    if (message.includes('research')) {
      return {
        content: `Research skills are essential for academic success! Here are some tips:

🔎 **Finding Reliable Sources:**
• Use your school library databases
• Look for .edu, .gov, or .org websites
• Check the author's credentials
• Avoid Wikipedia as a main source

📝 **Taking Notes:**
• Summarize key points in your own words
• Keep track of sources for citations
• Organize notes by topic or question

📑 **Citing Sources:**
• Use MLA or APA format as required
• Always give credit to original authors

**Want help with brainstorming research questions or evaluating sources?**`,
        suggestions: ["How to cite sources", "Finding reliable sources", "Research question help", "Note-taking tips"]
      };
    }

    // Test prep
    if (message.includes('test') || message.includes('exam') || message.includes('quiz')) {
      return {
        content: `Test preparation is all about practice and strategy! Here are some tips:

📝 **Before the Test:**
• Review notes and key concepts regularly
• Make flashcards for important terms
• Practice with old quizzes or sample questions

😌 **During the Test:**
• Read all instructions carefully
• Manage your time—don't spend too long on one question
• Answer easy questions first, then return to harder ones

💡 **After the Test:**
• Review what you missed to learn from mistakes
• Ask your teacher for feedback

**Want to practice with sample questions or get study tips?**`,
        suggestions: ["Study tips", "Practice questions", "Test-taking strategies", "How to review mistakes"]
      };
    }

    // Public speaking
    if (message.includes('public speaking') || message.includes('presentation') || message.includes('speech')) {
      return {
        content: `Public speaking is a valuable skill! Here are some ways to improve:

🎤 **Preparation:**
• Know your topic well
• Organize your speech with a clear introduction, body, and conclusion
• Practice out loud, preferably in front of someone

😃 **Delivery:**
• Make eye contact with your audience
• Use gestures and vary your voice
• Speak clearly and at a moderate pace

🧘 **Managing Nerves:**
• Take deep breaths before speaking
• Visualize success
• Remember, everyone gets nervous—practice helps!

**Want to practice a speech or get feedback on your presentation?**`,
        suggestions: ["Speech practice", "Presentation tips", "Overcoming nerves", "Organizing a speech"]
      };
    }

    // Default helpful response
    return {
      content: `I'm here to help with all aspects of English Language Arts! I can assist you with:

📚 **Reading Comprehension** - Understanding texts, main ideas, inferences
✏️ **Writing Skills** - Essays, narratives, research papers
📝 **Grammar & Mechanics** - Sentence structure, punctuation, usage
💭 **Vocabulary** - Word meanings, context clues, word building
📖 **Literature Analysis** - Themes, characters, literary devices
🔎 **Research Skills** - Finding sources, note-taking, citations
📝 **Test Prep** - Study tips, practice questions, test-taking strategies
🎤 **Public Speaking** - Speech writing, delivery, overcoming nerves

**What specific area would you like to focus on? Feel free to ask questions, request practice exercises, or get help with brainstorming or outlining!**`,
      suggestions: ["Reading help", "Writing assistance", "Grammar review", "Vocabulary building", "Literature analysis", "Research skills", "Test prep", "Public speaking"]
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call Claude API via Echo
      const response = await callClaudeAPI(inputValue);
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response.content,
        suggestions: response.suggestions,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      // Fallback response
      const fallbackResponse = generateFallbackResponse(inputValue);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: fallbackResponse.content,
        suggestions: fallbackResponse.suggestions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleTopicClick = (topicId) => {
    setSelectedTopic(topicId);
    const topicMessages = {
      reading: "I'd like help with reading comprehension strategies",
      writing: "Can you help me with writing and essay structure?",
      grammar: "I need help with grammar and sentence structure",
      vocabulary: "I want to improve my vocabulary skills",
      literature: "Can you help me with literature analysis?",
      research: "Can you help me with research skills and finding reliable sources?",
      testprep: "How can I prepare for ELA tests and exams?",
      speaking: "Can you help me improve my public speaking and presentation skills?"
    };
    setInputValue(topicMessages[topicId]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Claude {selectedAuthor}</h1>
              <p className="text-blue-100">Your personal English Language Arts assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Mode toggle for dev/admin */}
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="bg-white text-blue-700 px-2 py-1 rounded-lg text-xs border border-blue-200 shadow"
              title="Switch between demo and Echo modes"
            >
              <option value="demo">Demo Mode</option>
              <option value="echo">Echo Mode</option>
            </select>
            <button
              onClick={() => setShowHelp(true)}
              className="bg-white text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors font-medium text-xs shadow"
            >
              Help / About
            </button>
            {isLoading ? (
              <span className="text-blue-100 text-sm">Loading...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-blue-100 text-sm font-medium">
                  {user?.name || user?.email || 'User'} ({balance?.credits || 0} credits)
                </span>
                <button
                  onClick={signOut}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <EchoSignIn
                onSuccess={(user) => console.log('Sign in initiated:', user)}
                onError={(error) => console.error('Sign in failed:', error)}
              >
                <button className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-xs shadow">
                  Sign In with Echo
                </button>
              </EchoSignIn>
            )}
          </div>
        </div>
      </div>

      {/* Echo sign-in callout */}
      {mode === 'demo' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 text-sm">
          <strong>Want to unlock full AI-powered tutoring?</strong> <br />
          <span>Sign in with Echo to access advanced Claude responses, track your credits, and support responsible, secure AI use. (Demo mode uses static educational responses only.)</span>
        </div>
      )}

      {/* Help/About Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">About This Tutor & Academic Integrity</h2>
            <p className="mb-2 text-gray-700">
              <strong>Claude [Author]</strong> is your AI-powered English Language Arts tutor. This chatbot can help you with reading comprehension, writing, grammar, vocabulary, literature analysis, research skills, test prep, and public speaking.
            </p>
            <p className="mb-2 text-gray-700">
              <strong>Academic Integrity:</strong> This tutor will <span className="text-red-600 font-semibold">never</span> write essays, assignments, or homework for you. Instead, it will help you brainstorm, outline, and improve your own work. All responses are designed to promote genuine learning and ethical academic behavior.
            </p>
            <ul className="list-disc pl-5 text-gray-700 mb-2">
              <li>Will not write or complete assignments for you</li>
              <li>Will help you brainstorm, outline, and revise</li>
              <li>Will teach you strategies and skills</li>
              <li>Will encourage independent thinking</li>
            </ul>
            <p className="text-gray-600 text-sm">If you have questions about how to use this tutor responsibly, ask your teacher or academic advisor.</p>
          </div>
        </div>
      )}

      {/* Topic Selection */}
      <div className="p-4 bg-gray-50 border-b">
        <p className="text-sm text-gray-600 mb-3">Quick topic shortcuts:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className={`p-3 rounded-lg border text-sm transition-all hover:shadow-md ${
                  selectedTopic === topic.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-4 w-4 mx-auto mb-1" />
                <div className="font-medium">{topic.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg whitespace-pre-line ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="text-sm">{message.content}</div>
              {message.suggestions && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Try asking about:</div>
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left px-2 py-1 text-xs bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about reading, writing, grammar, vocabulary, or literature..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {showDishonestyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative border-2 border-red-500">
            <button
              onClick={() => setShowDishonestyModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Academic Integrity Warning</h2>
            <p className="mb-2 text-gray-700">
              <strong>This tutor will never write essays, assignments, or homework for you.</strong> Asking for this is considered academic dishonesty and is against the rules.
            </p>
            <p className="mb-2 text-gray-700">
              Instead, let me help you brainstorm, outline, and improve your own work. If you need help getting started, try asking for brainstorming or outlining tips!
            </p>
            <div className="text-sm text-gray-500 mb-2">Dishonesty attempts this session: <span className="font-bold text-red-600">{dishonestyCount}</span></div>
            <button
              onClick={() => setShowDishonestyModal(false)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELATutorChatbot; 