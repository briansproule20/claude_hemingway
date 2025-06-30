# ELA Tutor Chatbot

An interactive English Language Arts (ELA) tutor chatbot built with React and Claude 3.5 Sonnet. This application helps students with reading comprehension, writing skills, grammar, vocabulary, and literature analysis while maintaining strict academic integrity.

## Features

- **AI-Powered Responses**: Uses Claude 3.5 Sonnet for intelligent, contextual responses
- **Academic Integrity Protection**: Built-in safeguards against writing requests
- **Interactive Chat Interface**: Real-time conversation with an AI tutor
- **Topic Shortcuts**: Quick access to different ELA subjects
- **Smart Responses**: Context-aware responses based on user input
- **Suggestion Buttons**: Clickable suggestions for follow-up questions
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Random Author Names**: Each session features a different famous author's name

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
- Anthropic API key (Claude 3.5 Sonnet)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ela-tutor-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```
   - Get your API key from [Anthropic Console](https://console.anthropic.com/)

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 3001) and the React frontend (port 3000).

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Academic Integrity Features

The chatbot includes robust protections against academic dishonesty:

- **Writing Request Detection**: Automatically detects when students ask for writing help
- **Ethical Redirection**: Redirects writing requests to brainstorming and process guidance
- **Educational Focus**: Emphasizes learning and skill development over content generation
- **Process-Oriented Help**: Focuses on teaching the writing process, not doing the writing

## Usage

1. **Start a Conversation**: The chatbot will greet you with an introduction
2. **Choose a Topic**: Click on any of the topic shortcuts at the top
3. **Ask Questions**: Type your questions about ELA topics
4. **Follow Suggestions**: Click on suggestion buttons for related topics
5. **Use Keyboard Shortcuts**: Press Enter to send, Shift+Enter for new line

## Technology Stack

- **Frontend**: React 18 with hooks
- **Backend**: Node.js with Express
- **AI**: Claude 3.5 Sonnet via Anthropic API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development**: Concurrently for running multiple servers

## Project Structure

```
├── src/
│   ├── components/
│   │   └── ELATutorChatbot.js    # Main chatbot component
│   ├── App.js                    # Root application component
│   ├── index.js                  # Application entry point
│   └── index.css                 # Global styles with Tailwind imports
├── server.js                     # Backend API server
├── package.json                  # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
└── .env                          # Environment variables (create this)
```

## API Integration

The chatbot uses Claude 3.5 Sonnet through the Anthropic API with:

- **System Prompt**: Comprehensive ethical guidelines and academic integrity rules
- **Conversation History**: Maintains context across multiple messages
- **Error Handling**: Graceful fallback to static responses if API fails
- **Rate Limiting**: Built-in protection against excessive API calls

## Customization

The chatbot responses can be customized by modifying:

- **System Prompt**: Update `SYSTEM_PROMPT` in `server.js`
- **Author Names**: Modify the `famousAuthors` array in `ELATutorChatbot.js`
- **UI Styling**: Update Tailwind classes and CSS
- **Topic Categories**: Add or modify topics in the `topics` array

## Environment Variables

Create a `.env` file with:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Available Scripts

- `npm start` - Start React development server only
- `npm run server` - Start backend API server only
- `npm run dev` - Start both frontend and backend servers
- `npm run build` - Build for production
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support, please open an issue in the repository.

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and private
- The application includes rate limiting and error handling
- All user interactions are processed locally and through secure API calls 