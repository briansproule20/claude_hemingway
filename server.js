const express = require('express');
const cors = require('cors');
const { createAnthropic } = require('@ai-sdk/anthropic');
const { streamText } = require('ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for Claude
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

// API endpoint for Claude
app.post('/api/claude', async (req, res) => {
  try {
    const { message, messages } = req.body;
    
    console.log('🔍 Received request for Claude API');
    console.log('📝 Message:', message);
    console.log('💬 Previous messages count:', messages?.length || 0);
    
    if (!process.env.REACT_APP_ANTHROPIC_API_KEY) {
      console.error('❌ No API key found');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const anthropic = createAnthropic({
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
    });
    
    console.log('🚀 Creating stream...');
    const result = await streamText({
      model: anthropic('claude-3-haiku-20240307'),
      system: SYSTEM_PROMPT,
      messages: [
        ...(messages || []).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
      maxTokens: 500,
      temperature: 0.7,
    });
    
    let fullResponse = '';
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }
    
    console.log('✅ Got response from Claude');
    res.json({ response: fullResponse });
    
  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to get response from Claude' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔑 API Key configured: ${process.env.REACT_APP_ANTHROPIC_API_KEY ? 'YES' : 'NO'}`);
}); 