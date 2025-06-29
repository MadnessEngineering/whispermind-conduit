#!/usr/bin/env node

/**
 * 🧠 Enhanced Whispermind_Conduit - Agentic Neural Bridge Architecture 🧠
 * 
 * The enhanced mad conduit with autonomous AI agent capabilities!
 * Now featuring LM Studio SDK integration with multi-round tool execution and Redis persistence.
 * 
 * NEW FEATURES:
 * - 🤖 Agentic Tool Use via .act() API
 * - 📋 Structured Output with Zod schemas
 * - ⚡ Native LM Studio SDK integration
 * - 🛠️ Tool-enabled autonomous problem solving
 * - 💾 Redis pub/sub with conversation history
 * - 👤 User session management and persistence
 * 
 * Author: Mad Tinker
 * Project: Madness Interactive - Enhanced Whispermind_Conduit
 */

const winston = require('winston');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { z } = require('zod');
const Redis = require('ioredis');

// LM Studio SDK Integration
const LMStudio = require('@lmstudio/sdk');

// Load environment configuration
dotenv.config();

// 🎭 Enhanced Logger Configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, ...meta }) =>
        {
            return `${timestamp} [${level.toUpperCase()}] 🧠✨ ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/enhanced-conduit.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// 📋 Zod Response Schemas
const ChatResponseSchema = z.object({
    id: z.string(),
    user: z.string(),
    original_message: z.string(),
    response: z.string(),
    processing_time_ms: z.number(),
    timestamp: z.string(),
    model: z.string(),
    madness_level: z.string(),
    agent_rounds: z.number().optional(),
    tools_used: z.array(z.string()).optional()
});

const ToolResultSchema = z.object({
    tool_name: z.string(),
    result: z.any(),
    execution_time_ms: z.number()
});

const UserSessionSchema = z.object({
    userId: z.string(),
    preferences: z.object({
        agenticMode: z.boolean().default(false),
        temperature: z.number().default(0.7),
        maxTokens: z.number().default(1000)
    }).optional(),
    context: z.string().optional(),
    lastActivity: z.string(),
    conversationCount: z.number().default(0)
});

/**
 * 🌟 Enhanced Whispermind_Conduit - The Agentic Neural Bridge Service with Redis
 */
class EnhancedWhispermindConduit
{
    constructor()
    {
        this.config = {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASSWORD || null,
                db: parseInt(process.env.REDIS_DB) || 0,
                channels: {
                    request: process.env.REDIS_REQUEST_CHANNEL || 'whispermind:request',
                    response: process.env.REDIS_RESPONSE_CHANNEL || 'whispermind:response',
                    status: process.env.REDIS_STATUS_CHANNEL || 'whispermind:status',
                    agent_activity: process.env.REDIS_AGENT_CHANNEL || 'whispermind:agent'
                },
                keys: {
                    conversations: 'conversations',
                    sessions: 'sessions',
                    agent_logs: 'agent_logs',
                    service_status: 'service:status'
                }
            },
            lmStudio: {
                port: parseInt(process.env.LM_STUDIO_PORT) || 1234,
                model: process.env.LM_STUDIO_MODEL || 'qwen2.5-7b-instruct',
                timeout: parseInt(process.env.LM_STUDIO_TIMEOUT) || 30000
            },
            service: {
                name: 'Enhanced_Whispermind_Conduit',
                version: '2.0.0',
                madnessLevel: 'autonomous_chaos'
            }
        };

        this.redis = null;
        this.redisSub = null;
        this.lmStudio = null;
        this.model = null;
        this.isConnected = false;
        this.processingQueue = new Map();

        logger.info('🧠✨ Enhanced Whispermind_Conduit initialized with Redis and agentic capabilities!', {
            config: this.config
        });
    }

    /**
     * 🚀 Start the enhanced neural bridge service
     */
    async start()
    {
        try
        {
            logger.info('🌟 Starting Enhanced Whispermind_Conduit agentic neural bridge with Redis...');

            await this.initializeLMStudio();
            await this.connectRedis();

            // Publish startup status
            await this.publishStatus('ONLINE', 'Enhanced neural bridge activated - Ready for autonomous madness with Redis persistence!');

            logger.info('🎭✨ Enhanced Whispermind_Conduit is LIVE with agentic powers and Redis persistence!');

        } catch (error)
        {
            logger.error('💥 Failed to start Enhanced Whispermind_Conduit:', error);
            process.exit(1);
        }
    }

    /**
     * 🤖 Initialize LM Studio SDK
     */
    async initializeLMStudio()
    {
        try
        {
            logger.info('🤖 Initializing LM Studio SDK...');

            this.lmStudio = new LMStudio({
                port: this.config.lmStudio.port
            });

            // Load model
            this.model = await this.lmStudio.llm(this.config.lmStudio.model);

            logger.info('✅ LM Studio SDK initialized successfully!', {
                model: this.config.lmStudio.model
            });

        } catch (error)
        {
            logger.error('❌ LM Studio SDK initialization failed:', error.message);
            throw new Error('LM Studio SDK is not accessible - ensure LM Studio is running');
        }
    }

    /**
     * 🔌 Connect to Redis with pub/sub
     */
    async connectRedis()
    {
        try
        {
            logger.info('🔌 Connecting to Redis...', {
                host: this.config.redis.host,
                port: this.config.redis.port
            });

            // Main Redis connection for pub/writes
            this.redis = new Redis({
                host: this.config.redis.host,
                port: this.config.redis.port,
                password: this.config.redis.password,
                db: this.config.redis.db,
                retryDelayOnFailover: 100,
                enableOfflineQueue: false,
                maxRetriesPerRequest: 3
            });

            // Separate Redis connection for subscriptions
            this.redisSub = new Redis({
                host: this.config.redis.host,
                port: this.config.redis.port,
                password: this.config.redis.password,
                db: this.config.redis.db
            });

            // Set up event handlers
            this.redis.on('connect', () =>
            {
                logger.info('✅ Redis main connection established!');
                this.isConnected = true;
            });

            this.redis.on('error', (error) =>
            {
                logger.error('💥 Redis main connection error:', error);
                this.isConnected = false;
            });

            this.redisSub.on('connect', () =>
            {
                logger.info('✅ Redis subscription connection established!');
            });

            this.redisSub.on('error', (error) =>
            {
                logger.error('💥 Redis subscription error:', error);
            });

            // Subscribe to request channel
            await this.redisSub.subscribe(this.config.redis.channels.request);
            logger.info('👂 Listening for agentic chat requests on:', this.config.redis.channels.request);

            // Handle incoming messages
            this.redisSub.on('message', (channel, message) =>
            {
                this.handleIncomingMessage(channel, message);
            });

            // Wait for connections to be ready
            await new Promise((resolve) =>
            {
                if (this.isConnected)
                {
                    resolve();
                } else
                {
                    this.redis.once('connect', resolve);
                }
            });

        } catch (error)
        {
            logger.error('❌ Redis connection failed:', error);
            throw new Error('Redis is not accessible - ensure Redis is running');
        }
    }

    /**
     * 📨 Handle incoming Redis messages
     */
    async handleIncomingMessage(channel, message)
    {
        try
        {
            if (channel !== this.config.redis.channels.request)
            {
                return;
            }

            const request = JSON.parse(message);
            const requestId = request.id || uuidv4();

            logger.info('📨 Received agentic chat request:', {
                requestId,
                user: request.user || 'anonymous',
                messageLength: request.message?.length || 0,
                agentMode: request.agent_mode || 'standard'
            });

            // Update user session
            await this.updateUserSession(request.user || 'anonymous', request);

            // Add to processing queue
            this.processingQueue.set(requestId, {
                timestamp: new Date(),
                request
            });

            // Process the request with agentic capabilities
            await this.processAgenticRequest(requestId, request);

        } catch (error)
        {
            logger.error('💥 Error handling incoming message:', error);
        }
    }

    /**
     * 👤 Update user session in Redis
     */
    async updateUserSession(userId, request)
    {
        try
        {
            const sessionKey = `${this.config.redis.keys.sessions}:${userId}`;
            const existingSession = await this.redis.get(sessionKey);

            let session = {
                userId,
                preferences: {
                    agenticMode: request.agent_mode === 'autonomous',
                    temperature: request.temperature || 0.7,
                    maxTokens: request.max_tokens || 1000
                },
                context: request.context || '',
                lastActivity: new Date().toISOString(),
                conversationCount: 1
            };

            if (existingSession)
            {
                const parsed = JSON.parse(existingSession);
                session.conversationCount = (parsed.conversationCount || 0) + 1;
                session.preferences = { ...parsed.preferences, ...session.preferences };
            }

            // Store session with 24-hour TTL
            await this.redis.setex(sessionKey, 86400, JSON.stringify(session));

            logger.info('👤 Updated user session:', { userId, conversationCount: session.conversationCount });

        } catch (error)
        {
            logger.error('❌ Error updating user session:', error);
        }
    }

    /**
     * 🧠🤖 Process agentic chat request with LM Studio SDK
     */
    async processAgenticRequest(requestId, request)
    {
        try
        {
            logger.info('🧠🤖 Processing agentic request through enhanced neural bridge...', { requestId });

            const startTime = Date.now();
            let agentRounds = 0;
            let toolsUsed = [];

            // Determine processing mode
            const useAgentMode = request.agent_mode === 'autonomous' ||
                request.message.includes('solve') ||
                request.message.includes('analyze') ||
                request.message.includes('calculate');

            let response;
            if (useAgentMode)
            {
                // 🤖 Use .act() API for autonomous tool use
                response = await this.processWithAgenticTools(request, (roundInfo) =>
                {
                    agentRounds++;
                    if (roundInfo.tool_name)
                    {
                        toolsUsed.push(roundInfo.tool_name);
                        this.publishAgentActivity(requestId, roundInfo);
                    }
                });
            } else
            {
                // 💬 Standard chat response with structured output
                response = await this.model.respond(request.message, {
                    structured: ChatResponseSchema.pick({ response: true })
                });
            }

            const processingTime = Date.now() - startTime;

            // Create structured response
            const responseMessage = ChatResponseSchema.parse({
                id: requestId,
                user: request.user || 'anonymous',
                original_message: request.message,
                response: response.parsed?.response || response.content || 'No response generated',
                processing_time_ms: processingTime,
                timestamp: new Date().toISOString(),
                model: this.config.lmStudio.model,
                madness_level: this.config.service.madnessLevel,
                agent_rounds: agentRounds,
                tools_used: toolsUsed.length > 0 ? [...new Set(toolsUsed)] : undefined
            });

            // Store conversation in Redis
            await this.storeConversation(request.user || 'anonymous', request.message, responseMessage);

            // Publish structured response
            await this.redis.publish(
                this.config.redis.channels.response,
                JSON.stringify(responseMessage)
            );

            logger.info('✅ Agentic request processed successfully!', {
                requestId,
                processingTime: `${processingTime}ms`,
                agentRounds,
                toolsUsed: toolsUsed.length
            });

            // Remove from processing queue
            this.processingQueue.delete(requestId);

        } catch (error)
        {
            logger.error('💥 Error processing agentic request:', error);
            await this.sendErrorResponse(requestId, request, error);
        }
    }

    /**
     * 💾 Store conversation in Redis
     */
    async storeConversation(userId, userMessage, responseMessage)
    {
        try
        {
            const conversationKey = `${this.config.redis.keys.conversations}:${userId}`;
            const conversationEntry = {
                timestamp: new Date().toISOString(),
                userMessage,
                aiResponse: responseMessage.response,
                processingTime: responseMessage.processing_time_ms,
                agentRounds: responseMessage.agent_rounds || 0,
                toolsUsed: responseMessage.tools_used || [],
                madnessLevel: responseMessage.madness_level
            };

            // Store conversation entry (keep last 100 messages)
            await this.redis.lpush(conversationKey, JSON.stringify(conversationEntry));
            await this.redis.ltrim(conversationKey, 0, 99);

            // Set TTL for conversation history (7 days)
            await this.redis.expire(conversationKey, 604800);

            logger.info('💾 Stored conversation in Redis:', { userId, messageLength: userMessage.length });

        } catch (error)
        {
            logger.error('❌ Error storing conversation:', error);
        }
    }

    /**
     * 🛠️ Process request with agentic tools using .act() API
     */
    async processWithAgenticTools(request, onRoundCallback)
    {
        // Define available tools for the agent
        const tools = [
            {
                name: 'file_analyzer',
                description: 'Analyze file contents and structure',
                function: async (filePath) =>
                {
                    try
                    {
                        const stats = await fs.stat(filePath);
                        const content = await fs.readFile(filePath, 'utf8');
                        return {
                            size: stats.size,
                            lines: content.split('\n').length,
                            type: path.extname(filePath),
                            preview: content.substring(0, 200)
                        };
                    } catch (error)
                    {
                        return { error: error.message };
                    }
                }
            },
            {
                name: 'system_info',
                description: 'Get system information',
                function: async () =>
                {
                    return {
                        platform: process.platform,
                        arch: process.arch,
                        nodeVersion: process.version,
                        memory: process.memoryUsage(),
                        uptime: process.uptime()
                    };
                }
            },
            {
                name: 'mad_calculator',
                description: 'Perform calculations with mad tinker precision',
                function: async (expression) =>
                {
                    try
                    {
                        // Safe eval for basic math (in production, use a proper math parser)
                        const result = Function(`"use strict"; return (${expression})`)();
                        return { result, madness_factor: Math.random() };
                    } catch (error)
                    {
                        return { error: 'Calculation failed', madness_level: 'chaotic' };
                    }
                }
            },
            {
                name: 'conversation_history',
                description: 'Retrieve user conversation history',
                function: async (userId, limit = 5) =>
                {
                    try
                    {
                        const conversationKey = `${this.config.redis.keys.conversations}:${userId}`;
                        const history = await this.redis.lrange(conversationKey, 0, limit - 1);
                        return {
                            conversations: history.map(entry => JSON.parse(entry)),
                            total: await this.redis.llen(conversationKey)
                        };
                    } catch (error)
                    {
                        return { error: error.message };
                    }
                }
            }
        ];

        // Use .act() API for autonomous execution
        return await this.model.act(
            request.message,
            tools,
            {
                on_message: (message) =>
                {
                    logger.info('🤖 Agent message:', message);
                },
                on_tool_call: (toolCall) =>
                {
                    logger.info('🛠️ Agent using tool:', toolCall.name);
                    onRoundCallback({
                        tool_name: toolCall.name,
                        round: toolCall.round,
                        status: 'executing'
                    });
                },
                on_tool_result: (toolResult) =>
                {
                    logger.info('✅ Tool result:', toolResult);
                    onRoundCallback({
                        tool_name: toolResult.name,
                        result: toolResult.result,
                        status: 'completed'
                    });
                }
            }
        );
    }

    /**
     * 📡 Publish agent activity to Redis
     */
    async publishAgentActivity(requestId, activity)
    {
        if (!this.isConnected) return;

        try
        {
            const activityMessage = {
                request_id: requestId,
                timestamp: new Date().toISOString(),
                activity,
                service: this.config.service.name
            };

            // Publish to channel
            await this.redis.publish(
                this.config.redis.channels.agent_activity,
                JSON.stringify(activityMessage)
            );

            // Store in agent logs stream
            await this.redis.xadd(
                this.config.redis.keys.agent_logs,
                '*',
                'requestId', requestId,
                'tool', activity.tool_name || 'unknown',
                'round', activity.round || 0,
                'status', activity.status || 'unknown',
                'timestamp', new Date().toISOString()
            );

        } catch (error)
        {
            logger.error('❌ Error publishing agent activity:', error);
        }
    }

    /**
     * ❌ Send error response
     */
    async sendErrorResponse(requestId, request, error)
    {
        const errorResponse = {
            id: requestId,
            user: request.user || 'anonymous',
            error: 'Enhanced processing failed',
            error_details: error.message,
            timestamp: new Date().toISOString(),
            madness_level: 'error_chaos'
        };

        await this.redis.publish(
            this.config.redis.channels.response,
            JSON.stringify(errorResponse)
        );

        this.processingQueue.delete(requestId);
    }

    /**
     * 📊 Publish service status
     */
    async publishStatus(status, message)
    {
        if (!this.isConnected) return;

        try
        {
            const statusMessage = {
                service: this.config.service.name,
                version: this.config.service.version,
                status,
                message,
                timestamp: new Date().toISOString(),
                processing_queue_size: this.processingQueue.size,
                madness_level: this.config.service.madnessLevel,
                agentic_capabilities: true,
                redis_features: {
                    conversation_history: true,
                    user_sessions: true,
                    agent_activity_logging: true
                }
            };

            // Publish status to channel
            await this.redis.publish(
                this.config.redis.channels.status,
                JSON.stringify(statusMessage)
            );

            // Store current status in Redis
            await this.redis.set(
                this.config.redis.keys.service_status,
                JSON.stringify(statusMessage)
            );

        } catch (error)
        {
            logger.error('❌ Error publishing status:', error);
        }
    }

    /**
     * 🛑 Graceful shutdown
     */
    async shutdown()
    {
        logger.info('🛑 Shutting down Enhanced Whispermind_Conduit...');

        await this.publishStatus('OFFLINE', 'Enhanced neural bridge deactivating...');

        if (this.model)
        {
            await this.model.unload();
        }

        if (this.redisSub)
        {
            this.redisSub.disconnect();
        }

        if (this.redis)
        {
            this.redis.disconnect();
        }

        logger.info('👋 Enhanced Whispermind_Conduit has been deactivated. The agentic madness sleeps...');
        process.exit(0);
    }
}

// 🎭 Handle graceful shutdown
process.on('SIGINT', async () =>
{
    logger.info('🛑 Received SIGINT, initiating graceful shutdown...');
    if (global.enhancedConduitInstance)
    {
        await global.enhancedConduitInstance.shutdown();
    }
});

process.on('SIGTERM', async () =>
{
    logger.info('🛑 Received SIGTERM, initiating graceful shutdown...');
    if (global.enhancedConduitInstance)
    {
        await global.enhancedConduitInstance.shutdown();
    }
});

// 🚀 Start the enhanced service if run directly
if (require.main === module)
{
    logger.info('🎭✨ Welcome to the Enhanced Madness! Starting Agentic Whispermind_Conduit with Redis...');

    const conduit = new EnhancedWhispermindConduit();
    global.enhancedConduitInstance = conduit;

    conduit.start().catch((error) =>
    {
        logger.error('💥 Fatal error starting enhanced service:', error);
        process.exit(1);
    });
}

module.exports = EnhancedWhispermindConduit; 
