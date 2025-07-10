# ELA Tutor Chatbot

An interactive English Language Arts (ELA) tutor chatbot powered by Claude 3.5 Sonnet with comprehensive safety features and academic integrity protection. This application helps students with reading comprehension, writing skills, grammar, vocabulary, and literature analysis while maintaining strict educational standards and content moderation.

## 🛡️ **Comprehensive Safety & Content Moderation Features**

### **Multi-Layer Content Filtering**
- **Pattern-based profanity detection** (no explicit offensive words in codebase)
- **Hate speech pattern matching** with educational redirection
- **Violence and harmful content filtering**
- **Sexual content detection and blocking**
- **Drug-related content filtering**
- **Personal information protection** (SSN, phone numbers, addresses, emails, credit cards)
- **Spam and commercial content detection**
- **Off-topic content guidance** back to ELA subjects

### **Academic Integrity Protection**
- **Enhanced writing request detection** with educational guidance
- **Proofreading request handling** with self-improvement guidance
- **Alternative examples and learning strategies** instead of direct answers
- **Paragraph-specific guidance** for proofreading areas
- **Process-focused assistance** rather than content generation
- **Progressive violation tracking** with educational warnings

### **AI Response Moderation**
- **Enhanced AI prompt safety instructions**
- **Response validation and filtering**
- **Safe fallback responses** for all error conditions
- **Educational redirection** for inappropriate queries
- **Multilingual safety support** (English, Spanish, Haitian Creole)

### **User Interface Safety Features**
- **"Safe Learning" indicator** in header with shield icon
- **Content moderation modal** with clear explanations
- **Safety information** in help panel
- **Visual feedback** for content violations
- **Progressive warning system** for repeated violations

## Features

- **AI-Powered Responses**: Uses Claude 3.5 Sonnet for intelligent, contextual responses
- **Echo Authentication**: Secure OAuth2 + PKCE authentication via Echo platform
- **Credit Management**: Real-time credit balance display with purchase options
- **Platform Integration**: Direct links to Merit Systems and Echo dashboard
- **Academic Integrity Protection**: Built-in safeguards against writing requests with educational guidance
- **Interactive Chat Interface**: Real-time conversation with an AI tutor
- **Topic Shortcuts**: Quick access to different ELA subjects
- **Smart Responses**: Context-aware responses based on user input
- **Suggestion Buttons**: Clickable suggestions for follow-up questions
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Random Author Names**: Each session features a different famous author's name
- **Fallback System**: Educational resources when API is unavailable
- **Multilingual Support**: Full UI and AI responses in English, Spanish, and Haitian Creole

### Echo Control Header Features

- **Real-time Credit Balance**: Shows current credits with refresh capability
- **Low Credit Warnings**: Visual indicators when credits are low or critical
- **Purchase Integration**: Built-in credit purchase with Echo Token Purchase component
- **Payment Links**: Direct payment link creation for credit purchases
- **Platform Access**: Quick links to Merit Systems and Echo platform
- **Credit Information**: Detailed tooltip with usage information and warnings
- **Responsive Design**: Mobile-friendly layout with adaptive text and spacing

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
- Echo account and API key

### Setup

1. **Get an Echo API Key**:
   - Visit [https://echo.merit.systems/](https://echo.merit.systems/)
   - Sign up and create an account
   - Navigate to API Keys section
   - Create a new API key

2. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd ela-tutor-chatbot
   npm install
   ```

3. **Configure Echo API Key**:
   - Create a `.env` file in the root directory
   - Add your Echo API key:
     ```
     REACT_APP_ECHO_APP_ID=your-echo-app-id-here
     ```
   - **Important**: Never commit the `.env` file to version control!

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to view it in the browser.

## How It Works

### API Integration
- Uses GPT-4o via Echo's AI router for consistent billing and management
- Maintains conversation context across messages
- Enforces academic integrity rules through system prompts
- Provides educational fallback responses when API is unavailable

### Error Handling
- **Missing API Key**: Provides clear setup instructions
- **Authentication Errors**: Guides users to check their API key
- **Rate Limits**: Handles API rate limiting gracefully
- **Connection Issues**: Falls back to educational resources

## Academic Integrity Features

The chatbot includes robust protections against academic dishonesty with educational guidance:

### **Enhanced Writing Request Detection**
- **Comprehensive pattern matching** for various writing request types
- **Educational redirection** instead of simple blocking
- **Alternative learning strategies** and skill development guidance
- **Process-focused assistance** rather than content generation

### **Proofreading Guidance System**
- **Self-proofreading skill development** instead of direct corrections
- **Paragraph-specific guidance** (e.g., "Check Paragraph 1 for clear topic sentences")
- **Proofreading techniques** and best practices
- **Error type categorization** (grammar, punctuation, spelling)

### **Educational Response Types**
- **Writing Requests**: Guidance on brainstorming, outlining, thesis development
- **Proofreading Requests**: Self-proofreading tips and area-specific guidance
- **General Requests**: Learning process focus and skill development

### **Multilingual Academic Integrity**
- **English, Spanish, and Haitian Creole** academic integrity messages
- **Culturally appropriate** educational guidance
- **Localized violation explanations** and learning strategies

## Content Moderation System

### **Technical Safety Design**
- **Pattern-based filtering** (avoids explicit word lists in codebase)
- **Comprehensive error handling**
- **Safe state management**
- **Clean code practices** without offensive content

### **Violation Management**
- **Progressive violation tracking** and counting
- **Educational moderation modals** with clear guidance
- **Safe learning environment indicators**
- **Multiple violation warnings** with escalating responses

### **Safety Guidelines**
- **Age-appropriate content enforcement**
- **Educational topic guidance** and redirection
- **Privacy protection** for personal information
- **Spam and commercial content filtering**

## Usage

1. **Set up API Key**: Configure your Anthropic API key in the `.env` file
2. **Start Learning**: Ask questions about ELA topics
3. **Use Topic Shortcuts**: Quick access to different subjects
4. **Follow Suggestions**: Click suggestion buttons for related topics
5. **Academic Integrity**: The bot will guide you through learning, not do work for you
6. **Content Safety**: All interactions are monitored for appropriate educational content

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **AI**: GPT-4o via Echo AI router
- **AI SDK**: Vercel AI SDK with OpenAI provider
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks
- **Authentication**: Echo OAuth2 + PKCE
- **Content Moderation**: Pattern-based filtering system

## Project Structure

```
src/
├── components/
│   ├── ELATutorChatbot.tsx   # Main chatbot component with safety features
│   └── EchoControlHeader.tsx # Authentication and credit management
├── App.tsx                   # Root app component with language support
├── index.tsx                 # Entry point
├── MockEchoProvider.tsx      # Mock authentication provider
└── index.css                 # Global styles with Tailwind
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Required: Your Echo App ID
REACT_APP_ECHO_APP_ID=your-echo-app-id-here
```

## Customization

The chatbot can be customized by modifying:

- **System Prompt**: Update the `getLanguageInstructions()` function in `ELATutorChatbot.tsx`
- **Author Names**: Modify the `famousAuthors` array
- **UI Styling**: Update Tailwind classes and CSS
- **Topic Categories**: Add or modify topics in the `getTopics()` function
- **Safety Patterns**: Update content filtering patterns in `contentFilterPatterns`
- **Academic Integrity**: Modify `writingRequestPatterns` and `getEducationalGuidance()`

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
- Ensure your Echo App ID is correctly configured
- Check that the `.env` file is in the root directory
- Restart the development server after adding the API key
- Verify your Echo account is active and has credits

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
- Echo integration: [Echo Platform Documentation](https://echo.merit.systems/) 