# ELA Tutor Chatbot

An interactive English Language Arts (ELA) tutor chatbot powered by Claude 3.5 Sonnet. This application helps students with reading comprehension, writing skills, grammar, vocabulary, and literature analysis while maintaining strict academic integrity.

## Features

- **AI-Powered Responses**: Uses Claude 3.5 Sonnet for intelligent, contextual responses
- **Real-time API Integration**: Direct integration with Anthropic's Claude API
- **Academic Integrity Protection**: Built-in safeguards against writing requests
- **Interactive Chat Interface**: Real-time conversation with an AI tutor
- **Topic Shortcuts**: Quick access to different ELA subjects
- **Smart Responses**: Context-aware responses based on user input
- **Suggestion Buttons**: Clickable suggestions for follow-up questions
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Random Author Names**: Each session features a different famous author's name
- **Fallback System**: Educational resources when API is unavailable

## Topics Covered

- 📚 **Reading Comprehension**: Strategies for understanding texts
- ✏️ **Writing Skills**: Essay structure, writing process, different genres
- 📝 **Grammar & Mechanics**: Parts of speech, sentence structure, punctuation
- 💭 **Vocabulary Building**: Context clues, word parts, learning strategies
- 📖 **Literature Analysis**: Literary elements, devices, analysis techniques

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Anthropic API key

### Setup

1. **Get an Anthropic API Key**:
   - Visit [https://console.anthropic.com/](https://console.anthropic.com/)
   - Sign up and create an account
   - Navigate to API Keys section
   - Create a new API key (starts with 'sk-ant-')

2. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd ela-tutor-chatbot
   npm install
   ```

3. **Configure API Key**:
   - Create a `.env` file in the root directory
   - Add your Anthropic API key:
     ```
     REACT_APP_ANTHROPIC_API_KEY=your-api-key-here
     ```
   - **Important**: Never commit the `.env` file to version control!

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to view it in the browser.

## How It Works

### API Integration
- Uses Anthropic's Claude API directly via the `@ai-sdk/anthropic` package
- Maintains conversation context across messages
- Enforces academic integrity rules through system prompts
- Provides educational fallback responses when API is unavailable

### Error Handling
- **Missing API Key**: Provides clear setup instructions
- **Authentication Errors**: Guides users to check their API key
- **Rate Limits**: Handles API rate limiting gracefully
- **Connection Issues**: Falls back to educational resources

## Academic Integrity Features

The chatbot includes robust protections against academic dishonesty:

- **Writing Request Detection**: Automatically detects when students ask for writing help
- **Ethical Redirection**: Redirects writing requests to brainstorming and process guidance
- **Educational Focus**: Emphasizes learning and skill development over content generation
- **Process-Oriented Help**: Focuses on teaching the writing process, not doing the writing
- **System Prompt Safeguards**: Claude is instructed to never complete assignments

## Usage

1. **Set up API Key**: Configure your Anthropic API key in the `.env` file
2. **Start Learning**: Ask questions about ELA topics
3. **Use Topic Shortcuts**: Quick access to different subjects
4. **Follow Suggestions**: Click suggestion buttons for related topics
5. **Academic Integrity**: The bot will guide you through learning, not do work for you

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **AI**: Claude 3.5 Sonnet via Anthropic API
- **AI SDK**: Vercel AI SDK with Anthropic provider
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks

## Project Structure

```
src/
├── components/
│   └── ELATutorChatbot.tsx   # Main chatbot component
├── App.tsx                   # Root app component
├── index.tsx                 # Entry point
├── MockEchoProvider.tsx      # Mock authentication provider
└── index.css                 # Global styles with Tailwind
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Required: Your Anthropic API key
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

## Customization

The chatbot can be customized by modifying:

- **System Prompt**: Update the `SYSTEM_PROMPT` in `ELATutorChatbot.tsx`
- **Author Names**: Modify the `famousAuthors` array
- **UI Styling**: Update Tailwind classes and CSS
- **Topic Categories**: Add or modify topics in the `topics` array
- **Model**: Change the Claude model version in `callClaudeAPI`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `REACT_APP_ANTHROPIC_API_KEY`: Your Anthropic API key
3. Deploy automatically on push

### Netlify
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Set environment variables in Netlify dashboard

### Other Platforms
The app is a standard React application and can be deployed to any static hosting service that supports environment variables.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Troubleshooting

### API Key Issues
- Ensure your API key starts with 'sk-ant-'
- Check that the `.env` file is in the root directory
- Restart the development server after adding the API key
- Verify your API key is active in the Anthropic console

### Common Errors
- **401 Unauthorized**: Check your API key
- **429 Rate Limited**: Wait before making more requests
- **Network Errors**: Check your internet connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support:
- Anthropic API issues: [Anthropic Documentation](https://docs.anthropic.com/)
- Project issues: Open an issue in this repository

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and never share it
- The `.env` file is already included in `.gitignore`
- Academic integrity rules are enforced at multiple levels 