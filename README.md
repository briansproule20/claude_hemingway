# ELA Tutor Chatbot

An interactive English Language Arts (ELA) tutor chatbot powered by Claude 3.5 Sonnet via Echo. This application helps students with reading comprehension, writing skills, grammar, vocabulary, and literature analysis while maintaining strict academic integrity.

## Features

- **AI-Powered Responses**: Uses Claude 3.5 Sonnet for intelligent, contextual responses
- **Built-in Authentication**: Secure OAuth2 authentication via Echo
- **Token Management**: Automatic credit tracking and payment processing
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
- Echo account and app ID

### Setup

1. **Create an Echo App**:
   - Visit [https://echo.merit.systems](https://echo.merit.systems)
   - Sign up and create a new app
   - Copy your app ID from the dashboard

2. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd ela-tutor-chatbot
   npm install
   ```

3. **Configure Echo**:
   - Open `src/index.js`
   - Replace `'your-echo-app-id'` with your actual Echo app ID
   - Set your callback URL in the Echo dashboard to your app's URL

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to view it in the browser.

## How It Works

### Authentication Flow
1. Users sign in via Echo's OAuth2 system
2. Echo provides secure tokens for API access
3. Users can purchase credits to use the chatbot
4. All API calls are routed through Echo's secure infrastructure

### AI Integration
- Uses Claude 3.5 Sonnet via Echo's router
- Maintains conversation context across messages
- Enforces academic integrity rules
- Provides fallback responses if needed

## Academic Integrity Features

The chatbot includes robust protections against academic dishonesty:

- **Writing Request Detection**: Automatically detects when students ask for writing help
- **Ethical Redirection**: Redirects writing requests to brainstorming and process guidance
- **Educational Focus**: Emphasizes learning and skill development over content generation
- **Process-Oriented Help**: Focuses on teaching the writing process, not doing the writing

## Usage

1. **Sign In**: Use Echo's authentication to access the chatbot
2. **Purchase Credits**: Buy credits to use the AI-powered tutoring
3. **Start Learning**: Ask questions about ELA topics
4. **Use Topic Shortcuts**: Quick access to different subjects
5. **Follow Suggestions**: Click suggestion buttons for related topics

## Technology Stack

- **Frontend**: React 18 with hooks
- **AI**: Claude 3.5 Sonnet via Echo
- **Authentication**: Echo OAuth2
- **Payment Processing**: Echo token system
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   └── ELATutorChatbot.js    # Main chatbot component
├── App.js                    # Root app with authentication
├── index.js                  # Entry point with Echo provider
└── index.css                 # Global styles with Tailwind
```

## Echo Integration Benefits

- **No Backend Required**: Echo handles all API routing and authentication
- **Secure**: No API keys to manage on your end
- **Scalable**: Echo handles infrastructure and billing
- **Built-in Payments**: Users can purchase credits seamlessly
- **OAuth2 Authentication**: Professional authentication system

## Customization

The chatbot can be customized by modifying:

- **System Prompt**: Update the `SYSTEM_PROMPT` in `ELATutorChatbot.js`
- **Author Names**: Modify the `famousAuthors` array
- **UI Styling**: Update Tailwind classes and CSS
- **Topic Categories**: Add or modify topics in the `topics` array

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables if needed
3. Deploy automatically on push

### Netlify
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`

### Other Platforms
The app is a standard React application and can be deployed to any static hosting service.

## Available Scripts

- `npm start` - Start development server
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

For questions or support:
- Echo-related issues: [Echo Documentation](https://echo.merit.systems)
- Project issues: Open an issue in this repository

## Security Notes

- All authentication is handled securely by Echo
- No API keys are stored in the frontend
- User data is protected by Echo's security measures
- Academic integrity rules are enforced at multiple levels 