import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, PenTool, FileText, MessageCircle, Lightbulb, CheckCircle } from 'lucide-react';

// Famous author last names for random selection
const famousAuthors = [
  'Hemingway', 'Fitzgerald', 'Dickens', 'Austen', 'Tolstoy', 'Dostoevsky', 
  'Shakespeare', 'Poe', 'Twain', 'Steinbeck', 'Faulkner', 'Joyce', 
  'Woolf', 'Orwell', 'Bradbury', 'Vonnegut', 'Salinger', 'Kerouac',
  'Ginsberg', 'Plath', 'Angelou', 'Morrison', 'King', 'Rowling',
  'Tolkien', 'Lewis', 'Wilde', 'Bronte', 'Eliot', 'Yeats'
];

const ELATutorChatbot = () => {
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
    { id: 'literature', name: 'Literature Analysis', icon: MessageCircle }
  ];

  const callClaudeAPI = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      // Fallback to static responses if API fails
      return generateFallbackResponse(userMessage);
    }
  };

  const generateFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for writing requests
    if (message.includes('write this for me') || 
        message.includes('write it for me') || 
        message.includes('can you write') || 
        message.includes('will you write') || 
        message.includes('please write') ||
        message.includes('do my essay') ||
        message.includes('write my essay') ||
        message.includes('write my paper') ||
        message.includes('do my paper') ||
        message.includes('write my assignment') ||
        message.includes('do my assignment') ||
        message.includes('write this essay') ||
        message.includes('write this paper') ||
        message.includes('help me write') && (message.includes('essay') || message.includes('paper') || message.includes('assignment'))) {
      return {
        content: "I understand you're looking for help with your writing! However, I can't write your essay, paper, or assignment for you - that would be academic dishonesty and wouldn't help you learn.\n\nInstead, let me help you develop your own ideas and structure your writing:\n\n💡 **Let's Brainstorm Together:**\n• What's your main topic or thesis?\n• What are your key arguments or points?\n• What evidence or examples can you use?\n• Who is your audience?\n\n📝 **Writing Structure Help:**\n• I can help you outline your ideas\n• Guide you through the writing process\n• Review your grammar and style\n• Help you develop stronger arguments\n\n🎯 **What I Can Do:**\n• Help you organize your thoughts\n• Suggest writing strategies\n• Review your work for structure and clarity\n• Provide feedback on your ideas\n\nWould you like to start by brainstorming your main ideas or creating an outline?",
        suggestions: ["Help me brainstorm ideas", "Create an outline", "Writing process steps", "Thesis statement help"]
      };
    }
    
    // Reading Comprehension responses
    if (message.includes('reading') || message.includes('comprehension') || message.includes('understand')) {
      return {
        content: "Great! Reading comprehension is all about understanding what you read. Here are some strategies:\n\n📖 **Before Reading:**\n• Preview the text (title, headings, images)\n• Make predictions about the content\n• Set a purpose for reading\n\n🤔 **During Reading:**\n• Ask questions as you read\n• Visualize the scenes or information\n• Make connections to your own experiences\n\n✅ **After Reading:**\n• Summarize the main ideas\n• Identify key details that support the main idea\n• Reflect on what you learned\n\nWould you like me to help you practice with a specific text or reading strategy?",
        suggestions: ["Practice summarizing", "Main idea vs details", "Making inferences", "Reading strategies"]
      };
    }
    
    // Writing responses
    if (message.includes('writing') || message.includes('essay') || message.includes('paragraph')) {
      return {
        content: "Excellent! Writing is a process that gets easier with practice. Let's break it down:\n\n✏️ **The Writing Process:**\n1. **Prewriting** - Brainstorm and organize your ideas\n2. **Drafting** - Get your ideas down on paper\n3. **Revising** - Improve content and organization\n4. **Editing** - Fix grammar, spelling, and punctuation\n5. **Publishing** - Share your final piece\n\n📝 **Essay Structure:**\n• **Introduction** - Hook, background, thesis statement\n• **Body Paragraphs** - Topic sentence, evidence, explanation\n• **Conclusion** - Restate thesis, summarize, final thought\n\n💡 **Let's Work Together:**\n• I can help you brainstorm ideas\n• Guide you through outlining\n• Review your structure and organization\n• Provide feedback on your writing process\n\nWhat would you like to work on first - brainstorming, outlining, or reviewing your current work?",
        suggestions: ["Help me brainstorm", "Create an outline", "Review my structure", "Writing process help"]
      };
    }
    
    // Grammar responses
    if (message.includes('grammar') || message.includes('punctuation') || message.includes('sentence')) {
      return {
        content: "Grammar helps us communicate clearly! Here are some key areas:\n\n🔤 **Parts of Speech:**\n• Nouns (person, place, thing, idea)\n• Verbs (action or state of being)\n• Adjectives (describe nouns)\n• Adverbs (describe verbs, adjectives, other adverbs)\n\n✏️ **Sentence Structure:**\n• Simple: One independent clause\n• Compound: Two independent clauses joined by conjunction\n• Complex: Independent + dependent clause\n\n📍 **Common Punctuation:**\n• Period (.) - End of statement\n• Question mark (?) - End of question\n• Comma (,) - Separate items, clauses\n• Semicolon (;) - Connect related independent clauses\n\nWhat specific grammar topic would you like to practice?",
        suggestions: ["Subject-verb agreement", "Comma rules", "Sentence fragments", "Run-on sentences"]
      };
    }
    
    // Vocabulary responses
    if (message.includes('vocabulary') || message.includes('words') || message.includes('meaning')) {
      return {
        content: "Building vocabulary is key to better reading and writing! Here are proven strategies:\n\n📚 **Word Learning Strategies:**\n• **Context clues** - Use surrounding words to guess meaning\n• **Word parts** - Learn prefixes, roots, and suffixes\n• **Synonyms & antonyms** - Connect new words to known words\n• **Visual associations** - Create mental images\n\n🔍 **Context Clue Types:**\n• Definition - Word is defined in the sentence\n• Example - Examples help explain the word\n• Contrast - Opposite meaning is given\n• Inference - Use logic to determine meaning\n\n💡 **Daily Practice:**\n• Keep a vocabulary journal\n• Use new words in sentences\n• Read diverse materials\n• Play word games\n\nWant to practice with some vocabulary exercises?",
        suggestions: ["Context clues practice", "Word roots & prefixes", "Synonym activities", "Vocabulary games"]
      };
    }
    
    // Literature responses
    if (message.includes('literature') || message.includes('poem') || message.includes('story') || message.includes('analysis')) {
      return {
        content: "Literature analysis helps us understand deeper meanings in texts! Here's how to approach it:\n\n📖 **Literary Elements:**\n• **Plot** - Sequence of events (exposition, rising action, climax, falling action, resolution)\n• **Character** - People in the story (protagonist, antagonist, round, flat)\n• **Setting** - Time and place\n• **Theme** - Central message or lesson\n• **Point of view** - Who tells the story (1st, 2nd, 3rd person)\n\n🎭 **Literary Devices:**\n• Metaphor & Simile - Comparisons\n• Symbolism - Objects representing ideas\n• Irony - Contrast between expectation and reality\n• Foreshadowing - Hints about future events\n\n🤔 **Analysis Questions:**\n• What is the author trying to say?\n• How do characters change?\n• What symbols appear repeatedly?\n• How does setting affect the story?\n\nWhat literary work are you analyzing?",
        suggestions: ["Character analysis", "Theme identification", "Literary devices", "Poetry analysis"]
      };
    }
    
    // Default helpful response
    return {
      content: "I'm here to help with all aspects of English Language Arts! I can assist you with:\n\n📚 **Reading Comprehension** - Understanding texts, main ideas, inferences\n✏️ **Writing Skills** - Essays, narratives, research papers\n📝 **Grammar & Mechanics** - Sentence structure, punctuation, usage\n💭 **Vocabulary** - Word meanings, context clues, word building\n📖 **Literature Analysis** - Themes, characters, literary devices\n\nWhat specific area would you like to focus on? Feel free to ask questions, request practice exercises, or get help with homework!",
      suggestions: ["Reading help", "Writing assistance", "Grammar review", "Vocabulary building", "Literature analysis"]
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
      // Call Claude API
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
      literature: "Can you help me with literature analysis?"
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
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Claude {selectedAuthor}</h1>
            <p className="text-blue-100">Your personal English Language Arts assistant</p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ELATutorChatbot; 