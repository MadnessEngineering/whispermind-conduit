#!/usr/bin/env node

/**
 * 🧠 Enhanced Whispermind_Conduit - Agentic Neural Bridge Architecture 🧠
 * 
 * The enhanced mad conduit with autonomous AI agent capabilities!
 * Now featuring LM Studio SDK integration with multi-round tool execution.
 * 
 * NEW FEATURES:
 * - 🤖 Agentic Tool Use via .act() API
 * - 📋 Structured Output with Zod schemas
 * - ⚡ Native LM Studio SDK integration
 * - 🛠️ Tool-enabled autonomous problem solving
 * 
 * Author: Mad Tinker
 * Project: Madness Interactive - Enhanced Whispermind_Conduit
 */

const mqtt = require('mqtt');
const winston = require('winston');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { z } = require('zod');

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

/**
 * 🌟 Enhanced Whispermind_Conduit - The Agentic Neural Bridge Service
 */
class EnhancedWhispermindConduit
{
    constructor()
    {
        this.config = {
            mqtt: {
                broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
                clientId: `enhanced-whispermind-conduit-${uuidv4()}`,
                topics: {
                    request: process.env.MQTT_REQUEST_TOPIC || 'chat/request',
                    response: process.env.MQTT_RESPONSE_TOPIC || 'chat/response',
                    status: process.env.MQTT_STATUS_TOPIC || 'conduit/status',
                    agent_activity: process.env.MQTT_AGENT_TOPIC || 'conduit/agent'
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

        this.mqttClient = null;
        this.lmStudio = null;
        this.model = null;
        this.isConnected = false;
        this.processingQueue = new Map();

        logger.info('🧠✨ Enhanced Whispermind_Conduit initialized with agentic capabilities!', {
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
            logger.info('🌟 Starting Enhanced Whispermind_Conduit agentic neural bridge...');

            await this.initializeLMStudio();
            await this.connectMQTT();

            // Publish startup status
            await this.publishStatus('ONLINE', 'Enhanced neural bridge activated - Ready for autonomous madness!');

            logger.info('🎭✨ Enhanced Whispermind_Conduit is LIVE with agentic powers!');

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
     * 🔌 Connect to MQTT broker (similar to original)
     */
    async connectMQTT()
    {
        return new Promise((resolve, reject) =>
        {
            logger.info('🔌 Connecting to MQTT broker...', { broker: this.config.mqtt.broker });

            this.mqttClient = mqtt.connect(this.config.mqtt.broker, {
                clientId: this.config.mqtt.clientId,
                clean: true,
                connectTimeout: 30000,
                reconnectPeriod: 5000
            });

            this.mqttClient.on('connect', () =>
            {
                logger.info('✅ MQTT connection established!');
                this.isConnected = true;

                // Subscribe to request topic
                this.mqttClient.subscribe(this.config.mqtt.topics.request, (err) =>
                {
                    if (err)
                    {
                        logger.error('❌ Failed to subscribe to request topic:', err);
                        reject(err);
                    } else
                    {
                        logger.info('👂 Listening for agentic chat requests on:', this.config.mqtt.topics.request);
                        resolve();
                    }
                });
            });

            this.mqttClient.on('message', (topic, message) =>
            {
                this.handleIncomingMessage(topic, message);
            });

            this.mqttClient.on('error', (error) =>
            {
                logger.error('💥 MQTT connection error:', error);
                this.isConnected = false;
                reject(error);
            });

            this.mqttClient.on('close', () =>
            {
                logger.warn('🔌 MQTT connection closed');
                this.isConnected = false;
            });
        });
    }

    /**
     * 📨 Handle incoming MQTT messages
     */
    async handleIncomingMessage(topic, message)
    {
        try
        {
            if (topic !== this.config.mqtt.topics.request)
            {
                return;
            }

            const request = JSON.parse(message.toString());
            const requestId = request.id || uuidv4();

            logger.info('📨 Received agentic chat request:', {
                requestId,
                user: request.user || 'anonymous',
                messageLength: request.message?.length || 0,
                agentMode: request.agent_mode || 'standard'
            });

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
            const useAgentMode = request.agent_mode === 'autonomous' || request.message.includes('solve') || request.message.includes('analyze');

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

            // Publish structured response
            this.mqttClient.publish(
                this.config.mqtt.topics.response,
                JSON.stringify(responseMessage),
                { qos: 1 }
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
     * 📡 Publish agent activity to MQTT
     */
    async publishAgentActivity(requestId, activity)
    {
        if (!this.isConnected) return;

        const activityMessage = {
            request_id: requestId,
            timestamp: new Date().toISOString(),
            activity,
            service: this.config.service.name
        };

        this.mqttClient.publish(
            this.config.mqtt.topics.agent_activity,
            JSON.stringify(activityMessage),
            { qos: 1 }
        );
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

        this.mqttClient.publish(
            this.config.mqtt.topics.response,
            JSON.stringify(errorResponse),
            { qos: 1 }
        );

        this.processingQueue.delete(requestId);
    }

    /**
     * 📊 Publish service status
     */
    async publishStatus(status, message)
    {
        if (!this.isConnected) return;

        const statusMessage = {
            service: this.config.service.name,
            version: this.config.service.version,
            status,
            message,
            timestamp: new Date().toISOString(),
            processing_queue_size: this.processingQueue.size,
            madness_level: this.config.service.madnessLevel,
            agentic_capabilities: true
        };

        this.mqttClient.publish(
            this.config.mqtt.topics.status,
            JSON.stringify(statusMessage),
            { qos: 1, retain: true }
        );
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

        if (this.mqttClient)
        {
            this.mqttClient.end();
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
    logger.info('🎭✨ Welcome to the Enhanced Madness! Starting Agentic Whispermind_Conduit...');

    const conduit = new EnhancedWhispermindConduit();
    global.enhancedConduitInstance = conduit;

    conduit.start().catch((error) =>
    {
        logger.error('💥 Fatal error starting enhanced service:', error);
        process.exit(1);
    });
}

module.exports = EnhancedWhispermindConduit; 
