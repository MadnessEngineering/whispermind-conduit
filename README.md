# 🧠 Whispermind_Conduit - Enhanced Neural Bridge Architecture

> *"The mad conduit between mortal queries and AI consciousness - now with agentic superpowers!"*

**Welcome to the Madness Interactive!** 🎭

Whispermind_Conduit is a Windows-based Node.js service that acts as the "neural bridge" between Redis chat requests and LM Studio's AI models with **autonomous agentic capabilities**. Part of the greater **Madness Interactive** ecosystem - a crazy AI project hub where mad tinkers create extraordinary things!

## 🌟 Architecture Components

### Core Services

- **Enhanced Service**: `[src/enhanced-conduit.js]` - Agentic AI service with Redis and tool use
- **Original Service**: `[src/conduit.js]` - Legacy MQTT-based service  
- **Configuration**: `[package.json]` - Dependencies and scripts
- **Environment**: `[.env.example]` - Configuration template

### 🤖 Agentic Features

- **Autonomous Tool Use**: Multi-round problem solving with built-in tools
- **Conversation History**: Persistent Redis-based chat memory
- **User Sessions**: Track preferences and activity across conversations
- **Structured Output**: Zod schema validation for reliable responses
- **Real-time Agent Monitoring**: Stream agent activity and tool usage

## 🚀 Quick Start

### 1. **Clone the Repository** (if not already in the madness)

```bash
git clone https://github.com/madtinker/madness_interactive.git
cd madness_interactive/projects/common/Inventorium/Omnispindle/Whispermind_Conduit
```

### 2. **Install Redis** (Windows)

```bash
# Automatic installation (tries winget, chocolatey, then manual)
npm run install-redis

# Or specify method
powershell -ExecutionPolicy Bypass -File scripts/install-redis-windows.ps1 -Method winget
powershell -ExecutionPolicy Bypass -File scripts/install-redis-windows.ps1 -Method chocolatey
powershell -ExecutionPolicy Bypass -File scripts/install-redis-windows.ps1 -Method manual
```

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. **Start the Enhanced Neural Bridge**

```bash
# Development mode with auto-restart (Enhanced with Redis)
npm run dev:enhanced

# Production mode (Enhanced)
npm run start:enhanced

# Legacy MQTT mode
npm run start
```

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```env
# Redis Configuration (Enhanced Mode)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_REQUEST_CHANNEL=whispermind:request
REDIS_RESPONSE_CHANNEL=whispermind:response
REDIS_STATUS_CHANNEL=whispermind:status
REDIS_AGENT_CHANNEL=whispermind:agent

# LM Studio Configuration
LM_STUDIO_PORT=1234
LM_STUDIO_MODEL=qwen2.5-7b-instruct
LM_STUDIO_TIMEOUT=30000

# Legacy MQTT Configuration (Original Mode)
MQTT_BROKER=mqtt://localhost:1883
MQTT_REQUEST_TOPIC=chat/request
MQTT_RESPONSE_TOPIC=chat/response
MQTT_STATUS_TOPIC=conduit/status

# Logging
LOG_LEVEL=info
```

## 🧬 How It Works (Enhanced Mode)

1. **Redis Listener**: Subscribes to `whispermind:request` channel
2. **Neural Processing**: Routes requests through LM Studio SDK with agentic capabilities
3. **Tool Execution**: Autonomous multi-round tool use for complex problem solving
4. **Conversation Storage**: Persistent Redis-based conversation history and user sessions
5. **Response Publishing**: Structured responses to `whispermind:response` channel
6. **Agent Activity**: Real-time tool usage streaming to `whispermind:agent` channel

### 🛠️ Built-in Tools

- **file_analyzer**: Analyze file contents and structure
- **system_info**: Get system information and metrics
- **mad_calculator**: Perform calculations with mad tinker precision
- **conversation_history**: Retrieve user conversation history

### Request Format (Enhanced)

```json
{
  "id": "unique-request-id",
  "user": "username",
  "message": "Analyze the system and calculate memory usage!",
  "agent_mode": "autonomous",
  "temperature": 0.7,
  "max_tokens": 1000,
  "context": "Previous conversation context"
}
```

### Response Format (Enhanced)

```json
{
  "id": "unique-request-id",
  "user": "username",
  "original_message": "Analyze the system and calculate memory usage!",
  "response": "AI's tool-powered analysis and solution",
  "processing_time_ms": 2345,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "model": "qwen2.5-7b-instruct",
  "madness_level": "autonomous_chaos",
  "agent_rounds": 3,
  "tools_used": ["system_info", "mad_calculator"]
}
```

## 🎭 Windows Service Installation

For production deployment as a Windows service:

```bash
# Install the service
npm run install-service

# Uninstall the service
npm run uninstall-service
```

## 🧪 Testing

```bash
# Test enhanced Redis-based service
npm run test:enhanced

# Test legacy MQTT service
npm test
```

## 📊 Monitoring & Logs

- **Console Logs**: Real-time colored output with agent activity
- **File Logs**: `logs/enhanced-conduit.log` (auto-rotating, 5MB max, 5 files)
- **Redis Status**: Published to `whispermind:status` channel
- **Agent Activity**: Real-time tool usage on `whispermind:agent` channel
- **Conversation History**: Persistent storage in Redis (7-day TTL)
- **User Sessions**: Activity tracking with 24-hour TTL

## 🔧 Development

- **Auto-restart**: `npm run dev:enhanced` uses nodemon
- **Debugging**: Enable debug logs with `LOG_LEVEL=debug`
- **Hot Configuration**: Restart service to pick up `.env` changes
- **Redis Monitoring**: Use `redis-cli monitor` to watch real-time activity

## 🌐 Integration Points

- **Redis**: High-performance pub/sub and data storage
- **LM Studio SDK**: Native integration with agentic capabilities
- **Swarmonomicon**: Part of the greater Madness ecosystem
- **Inventorium**: Web interface integration ready
- **Neural Networks**: Ready for mad tinker experiments!

## 🎯 Project Structure

```
Whispermind_Conduit/
├── src/
│   ├── enhanced-conduit.js    # Enhanced Redis+agentic service
│   └── conduit.js            # Legacy MQTT service
├── scripts/
│   ├── install-redis-windows.ps1      # Redis installation script
│   ├── test-enhanced-conduit.js       # Enhanced service tests
│   ├── install-windows-service.js     # Service installation
│   └── uninstall-windows-service.js   # Service removal
├── config/                   # Configuration files
├── logs/                     # Log files
├── package.json              # Dependencies & scripts
├── .env.example             # Environment template
├── AGENTIC_ENHANCEMENT_GUIDE.md  # Integration guide
└── README.md                # This file!
```

## 💾 Redis Data Structure

The enhanced conduit uses several Redis data structures:

- **Conversations**: `conversations:userId` - Lists of chat history (7-day TTL)
- **User Sessions**: `sessions:userId` - User preferences and activity (24-hour TTL)
- **Agent Logs**: `agent_logs` - Stream of tool execution activity
- **Service Status**: `service:status` - Current service state

## 🤝 Contributing to the Madness

This is part of **Madness Interactive** - where mad tinkers collaborate on extraordinary AI projects!

- 🧠 Embrace creative chaos with agentic AI
- 🔬 Experiment with neural tool architectures  
- 🎭 Add your own flavor of autonomous madness
- 🚀 Push the boundaries of AI agent integration
- 💾 Explore Redis-based AI memory systems

## 📝 License

MIT License - Because sharing madness makes the world more interesting!

---

**Made with 🧠 and ⚡ by the Mad Tinker**  
*Part of the Madness Interactive ecosystem*

> *"In madness, there is method. In method, there is madness. In between, there is the autonomous Whispermind_Conduit with Redis superpowers!"*
