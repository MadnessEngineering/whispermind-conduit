# 🧠 Whispermind_Conduit - Neural Bridge Architecture

> *"The mad conduit between mortal queries and AI consciousness!"*

**Welcome to the Madness Interactive!** 🎭

Whispermind_Conduit is a Windows-based Node.js service that acts as the "neural bridge" between MQTT chat requests and LM Studio's AI models. Part of the greater **Madness Interactive** ecosystem - a crazy AI project hub where mad tinkers create extraordinary things!

## 🌟 Architecture Components

### Core Service

- **Main Service**: `[src/conduit.js]` - Primary service implementation  
- **Configuration**: `[package.json]` - Dependencies and scripts
- **Environment**: `[.env.example]` - Configuration template

## 🚀 Quick Start

### 1. **Clone the Repository** (if not already in the madness)

```bash
git clone https://github.com/madtinker/madness_interactive.git
cd madness_interactive/projects/common/Inventorium/Omnispindle/Whispermind_Conduit
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. **Start the Neural Bridge**

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Install as Windows service
npm run install-service
```

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```env
# MQTT Broker Configuration
MQTT_BROKER=mqtt://localhost:1883
MQTT_REQUEST_TOPIC=chat/request
MQTT_RESPONSE_TOPIC=chat/response
MQTT_STATUS_TOPIC=conduit/status

# LM Studio Configuration
LM_STUDIO_URL=http://localhost:1234
LM_STUDIO_MODEL=local-model
LM_STUDIO_TIMEOUT=30000

# Logging
LOG_LEVEL=info
```

## 🧬 How It Works

1. **MQTT Listener**: Subscribes to `chat/request` topic
2. **Neural Processing**: Forwards requests to LM Studio's API
3. **Response Channeling**: Publishes AI responses to `chat/response` topic
4. **Status Broadcasting**: Keeps everyone informed via `conduit/status`

### Request Format

```json
{
  "id": "unique-request-id",
  "user": "username",
  "message": "Your mad query here!",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### Response Format

```json
{
  "id": "unique-request-id",
  "user": "username",
  "original_message": "Your mad query here!",
  "response": "AI's brilliant madness response",
  "processing_time_ms": 1234,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "model": "local-model",
  "madness_level": "controlled_chaos"
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

## 📊 Monitoring & Logs

- **Console Logs**: Real-time colored output
- **File Logs**: `logs/conduit.log` (auto-rotating, 5MB max, 5 files)
- **Status Updates**: Published to MQTT `conduit/status` topic

## 🧪 Testing

```bash
npm test
```

## 🔧 Development

- **Auto-restart**: `npm run dev` uses nodemon
- **Debugging**: Enable debug logs with `LOG_LEVEL=debug`
- **Hot Configuration**: Restart service to pick up `.env` changes

## 🌐 Integration Points

- **MQTT Broker**: Any MQTT broker (Mosquitto, HiveMQ, etc.)
- **LM Studio**: Local AI model server
- **Swarmonomicon**: Part of the greater Madness ecosystem
- **Neural Networks**: Ready for mad tinker experiments!

## 🎯 Project Structure

```
Whispermind_Conduit/
├── src/
│   └── conduit.js          # Main service implementation
├── scripts/
│   ├── install-windows-service.js
│   └── uninstall-windows-service.js
├── config/                 # Configuration files
├── logs/                   # Log files
├── package.json            # Dependencies & scripts
├── .env.example           # Environment template
└── README.md              # This file!
```

## 🤝 Contributing to the Madness

This is part of **Madness Interactive** - where mad tinkers collaborate on extraordinary AI projects!

- 🧠 Embrace creative chaos
- 🔬 Experiment with neural architectures  
- 🎭 Add your own flavor of madness
- 🚀 Push the boundaries of AI integration

## 📝 License

MIT License - Because sharing madness makes the world more interesting!

---

**Made with 🧠 and ⚡ by the Mad Tinker**  
*Part of the Madness Interactive ecosystem*

> *"In madness, there is method. In method, there is madness. In between, there is the Whispermind_Conduit!"*
