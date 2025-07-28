# 🐗 HogMind - PostHog MCP Server

> AI-powered analytics assistant that makes PostHog data accessible through Model Context Protocol (MCP)

HogMind bridges the gap between PostHog's powerful analytics platform and AI models, enabling natural language queries and intelligent insights from your product data.

## ✨ Features

### 🚀 Core Capabilities
- **Natural Language Queries**: Ask questions about your data in plain English
- **Intelligent Analysis**: AI-powered insights and recommendations
- **User Journey Analysis**: Deep dive into individual user behavior patterns
- **Real-time Metrics**: Get key performance indicators instantly
- **Event Tracking**: Comprehensive event analysis and filtering
- **Cohort Management**: Access and analyze user segments
- **Feature Flag Integration**: Monitor feature rollouts and adoption

### 🧠 AI-Powered Features
- **Smart Query Parsing**: Converts natural language to PostHog API calls
- **Automated Insights**: Generates actionable recommendations from data
- **Trend Analysis**: Identifies patterns and anomalies in user behavior
- **User Segmentation**: Automatically discovers user behavior patterns
- **Optimization Suggestions**: AI-generated recommendations for improvement

### 🛠 MCP Tools Available

| Tool | Description | Example Use |
|------|-------------|-------------|
| `get_events` | Retrieve PostHog events with filtering | Get all login events from last week |
| `get_insights` | Access existing PostHog insights | Show conversion funnel insights |
| `create_insight` | Build new insights programmatically | Create signup trend analysis |
| `get_cohorts` | Retrieve user cohorts and segments | List all power user cohorts |
| `get_persons` | Access user/person data | Find users with specific properties |
| `get_feature_flags` | Monitor feature flag status | Check which flags are active |
| `analyze_user_journey` | Deep user behavior analysis | Analyze user X's complete journey |
| `get_metrics` | High-level analytics KPIs | Show overall engagement metrics |
| `query_data` | Natural language data queries | "What are the most popular events?" |
| `get_session_recordings` | Access session replay data | Get recordings for debugging |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostHog account with API access
- Your PostHog API key and project ID

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/berkdurmus/hogmind.git
cd hogmind
npm install
```

2. **Configure environment variables:**
```bash
cp env.example .env
```

Edit `.env` with your PostHog credentials:
```bash
POSTHOG_API_KEY=your_api_key_here
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=your_project_id
```

3. **Test the connection:**
```bash
npm run build
npm run start -- test-connection
```

4. **Start the MCP server:**
```bash
npm run dev
```

## 📖 Usage Examples

### With Claude Desktop (MCP Client)

Add HogMind to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "hogmind": {
      "command": "node",
      "args": ["/path/to/hogmind/dist/index.js"]
    }
  }
}
```

### Example Queries

Once connected, you can ask Claude questions like:

**📊 Analytics Overview:**
```
"What are my key metrics for the last 30 days?"
```

**👤 User Analysis:**
```
"Analyze the journey of user abc123"
```

**📈 Event Analysis:**
```
"Show me the most popular events from last week"
```

**🔍 Natural Language Queries:**
```
"How many users signed up in the past 7 days?"
"What's the conversion rate from signup to first purchase?"
"Show me users with high engagement"
```

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Model      │◄──►│   HogMind MCP   │◄──►│   PostHog API   │
│  (Claude/GPT)   │    │     Server      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Service    │
                    │  (Intelligence) │
                    └─────────────────┘
```

### Core Components

- **MCP Server**: Handles Model Context Protocol communication
- **PostHog Service**: Manages PostHog API interactions
- **AI Service**: Provides intelligent analysis and natural language processing
- **Type System**: Comprehensive TypeScript types for data safety

## 🛠 Development

### Project Structure

```
hogmind/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── services/        # Core business logic
│   ├── server.ts        # MCP server implementation
│   └── index.ts         # Main entry point
├── web/                 # Optional web interface
├── tests/               # Test suites
└── docs/                # Documentation
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run test suite
npm run test:watch       # Watch mode testing

# Utilities
npm run lint             # Code linting
npm run format           # Code formatting
npm start -- info       # Show server info
npm start -- test-connection  # Test PostHog connection
```

### Building and Testing

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Build the project
npm run build

# Test PostHog connection
npm run start -- test-connection

# Run tests
npm run test
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTHOG_API_KEY` | Your PostHog API key | Required |
| `POSTHOG_PROJECT_ID` | PostHog project identifier | Required |
| `POSTHOG_HOST` | PostHog instance URL | `https://app.posthog.com` |
| `MCP_DEBUG` | Enable debug logging | `false` |
| `LOG_LEVEL` | Logging level | `info` |

### PostHog Setup

1. **Get your API key:**
   - Go to PostHog Settings → Project Settings → API Keys
   - Copy your project API key

2. **Find your project ID:**
   - Check your PostHog URL: `https://app.posthog.com/project/YOUR_PROJECT_ID`
   - Or find it in Settings → Project Settings

## 🎯 Use Cases

### Product Analytics
- **User Behavior Analysis**: "Show me the user journey for high-value customers"
- **Feature Adoption**: "Which features are most popular among new users?"
- **Conversion Optimization**: "Where do users drop off in our signup funnel?"

### Marketing Intelligence
- **Campaign Analysis**: "How effective was our last marketing campaign?"
- **User Segmentation**: "Create segments based on engagement patterns"
- **Attribution**: "Which channels drive the most valuable users?"

### Product Development
- **Feature Performance**: "How is our new feature performing?"
- **A/B Testing**: "What are the results of our latest experiment?"
- **User Feedback**: "What events indicate user frustration?"

## 🚀 Advanced Features

### Custom Analysis

HogMind's AI service can automatically:
- Identify user behavior patterns
- Suggest optimization opportunities
- Generate actionable insights
- Detect anomalies and trends

### Natural Language Processing

Ask complex questions like:
- "Compare user engagement before and after our last release"
- "Find users who completed signup but never made a purchase"
- "What's the difference between mobile and desktop user behavior?"

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## 📚 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Desktop MCP Setup](https://claude.ai/docs/mcp)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- PostHog team for the amazing analytics platform
- Anthropic for the Model Context Protocol
- The open-source community for inspiration and tools

---

**Made with ❤️ for the PostHog community**

*HogMind makes PostHog data accessible to AI models, enabling natural language analytics and intelligent insights.* 