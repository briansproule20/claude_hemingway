const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Academic integrity check function
const checkForWritingRequests = (message) => {
  const lowerMessage = message.toLowerCase();
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
    'help me write'
  ];
  
  return writingRequestPatterns.some(pattern => lowerMessage.includes(pattern));
};

// Claude system prompt with ethical guidelines
const SYSTEM_PROMPT = `You are Claude, an ELA tutor with a randomly selected famous author's last name. You help students with English Language Arts including reading comprehension, writing, grammar, vocabulary, and literature analysis.

CRITICAL ETHICAL GUIDELINES - YOU MUST FOLLOW THESE:
1. NEVER write essays, papers, or assignments for students
2. NEVER complete homework or assignments for students
3. NEVER provide full written content that students can submit as their own work
4. ALWAYS redirect writing requests to brainstorming, outlining, and process guidance
5. Focus on teaching the writing process, not doing the writing
6. Help students develop their own ideas and structure
7. Provide feedback on their work, not replacement content

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

TONE:
- Encouraging and supportive
- Educational and instructive
- Professional but friendly
- Focus on learning and growth

Always maintain academic integrity and promote genuine learning.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    // Check for writing requests first
    if (checkForWritingRequests(message)) {
      return res.json({
        content: "I understand you're looking for help with your writing! However, I can't write your essay, paper, or assignment for you - that would be academic dishonesty and wouldn't help you learn.\n\nInstead, let me help you develop your own ideas and structure your writing:\n\n💡 **Let's Brainstorm Together:**\n• What's your main topic or thesis?\n• What are your key arguments or points?\n• What evidence or examples can you use?\n• Who is your audience?\n\n📝 **Writing Structure Help:**\n• I can help you outline your ideas\n• Guide you through the writing process\n• Review your grammar and style\n• Help you develop stronger arguments\n\n🎯 **What I Can Do:**\n• Help you organize your thoughts\n• Suggest writing strategies\n• Review your work for structure and clarity\n• Provide feedback on your ideas\n\nWould you like to start by brainstorming your main ideas or creating an outline?",
        suggestions: ["Help me brainstorm ideas", "Create an outline", "Writing process steps", "Thesis statement help"]
      });
    }

    // Prepare conversation history for Claude
    const messages = [
      {
        role: 'user',
        content: message
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      const historyMessages = conversationHistory.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.unshift(...historyMessages);
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    // Extract suggestions based on the response content
    const suggestions = generateSuggestions(response.content[0].text);

    res.json({
      content: response.content[0].text,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      content: "I'm having trouble connecting right now. Please try again in a moment.",
      suggestions: ["Try again", "Reading help", "Writing assistance", "Grammar review"]
    });
  }
});

// Generate contextual suggestions based on response content
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 