#!/usr/bin/env node

/**
 * 🧠 Whispermind_Conduit - Neural Bridge Architecture 🧠
 * 
 * The mad conduit between mortal queries and AI consciousness!
 * A Windows-based Node.js service that channels chat requests through LM Studio's AI models.
 * 
 * Architecture Components:
 * - Main Service: [src/conduit.js] - Primary service implementation
 * - Configuration: [package.json] - Dependencies and scripts  
 * - Environment: [.env.example] - Configuration template
 * 
 * Author: Mad Tinker
 * Project: Madness Interactive - Whispermind_Conduit
 */

const mqtt = require('mqtt');
const axios = require('axios');
const winston = require('winston');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Load environment configuration
dotenv.config();

// 🎭 Mad Tinker Logger Configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, ...meta }) =>
        {
            return `${timestamp} [${level.toUpperCase()}] 🧠 ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
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
            filename: path.join(__dirname, '../logs/conduit.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

/**
 * 🌟 Whispermind_Conduit - The Neural Bridge Service
 */
class WhispermindConduit
{
    constructor()
    {
        this.config = {
            mqtt: {
                broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
                clientId: `whispermind-conduit-${uuidv4()}`,
                topics: {
                    request: process.env.MQTT_REQUEST_TOPIC || 'chat/request',
                    response: process.env.MQTT_RESPONSE_TOPIC || 'chat/response',
                    status: process.env.MQTT_STATUS_TOPIC || 'conduit/status'
                }
            },
            lmStudio: {
                baseUrl: process.env.LM_STUDIO_URL || 'http://localhost:1234',
                model: process.env.LM_STUDIO_MODEL || 'local-model',
                timeout: parseInt(process.env.LM_STUDIO_TIMEOUT) || 30000
            },
            service: {
                name: 'Whispermind_Conduit',
                version: '1.0.0',
                madnessLevel: 'controlled_chaos'
            }
        };

        this.mqttClient = null;
        this.isConnected = false;
        this.processingQueue = new Map();

        logger.info('🧠 Whispermind_Conduit initialized with mad tinker precision!', {
            config: this.config
        });
    }

    /**
     * 🚀 Start the neural bridge service
     */
    async start()
    {
        try
        {
            logger.info('🌟 Starting Whispermind_Conduit neural bridge...');

            await this.connectMQTT();
            await this.verifyLMStudio();

            // Publish startup status
            await this.publishStatus('ONLINE', 'Neural bridge activated - Ready for mad queries!');

            logger.info('🎭 Whispermind_Conduit is LIVE and channeling the madness!');

        } catch (error)
        {
            logger.error('💥 Failed to start Whispermind_Conduit:', error);
            process.exit(1);
        }
    }

    /**
     * 🔌 Connect to MQTT broker
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
                        logger.info('👂 Listening for chat requests on:', this.config.mqtt.topics.request);
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
     * 🤖 Verify LM Studio connection
     */
    async verifyLMStudio()
    {
        try
        {
            logger.info('🤖 Verifying LM Studio connection...');

            const response = await axios.get(`${this.config.lmStudio.baseUrl}/v1/models`, {
                timeout: 5000
            });

            logger.info('✅ LM Studio connection verified!', {
                models: response.data.data?.length || 0
            });

        } catch (error)
        {
            logger.error('❌ LM Studio connection failed:', error.message);
            throw new Error('LM Studio is not accessible - ensure it\'s running on ' + this.config.lmStudio.baseUrl);
        }
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

            logger.info('📨 Received chat request:', {
                requestId,
                user: request.user || 'anonymous',
                messageLength: request.message?.length || 0
            });

            // Add to processing queue
            this.processingQueue.set(requestId, {
                timestamp: new Date(),
                request
            });

            // Process the request
            await this.processChatRequest(requestId, request);

        } catch (error)
        {
            logger.error('💥 Error handling incoming message:', error);
        }
    }

    /**
     * 🧠 Process chat request through LM Studio
     */
    async processChatRequest(requestId, request)
    {
        try
        {
            logger.info('🧠 Processing chat request through neural bridge...', { requestId });

            const startTime = Date.now();

            // Prepare the chat completion request
            const chatRequest = {
                model: this.config.lmStudio.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant with a touch of mad tinker creativity. Embrace the madness while being helpful!"
                    },
                    {
                        role: "user",
                        content: request.message
                    }
                ],
                temperature: request.temperature || 0.7,
                max_tokens: request.max_tokens || 1000,
                stream: false
            };

            // Send to LM Studio
            const response = await axios.post(
                `${this.config.lmStudio.baseUrl}/v1/chat/completions`,
                chatRequest,
                {
                    timeout: this.config.lmStudio.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const processingTime = Date.now() - startTime;
            const aiResponse = response.data.choices[0]?.message?.content || 'No response generated';

            // Prepare response message
            const responseMessage = {
                id: requestId,
                user: request.user || 'anonymous',
                original_message: request.message,
                response: aiResponse,
                processing_time_ms: processingTime,
                timestamp: new Date().toISOString(),
                model: this.config.lmStudio.model,
                madness_level: this.config.service.madnessLevel
            };

            // Publish response
            this.mqttClient.publish(
                this.config.mqtt.topics.response,
                JSON.stringify(responseMessage),
                { qos: 1 }
            );

            logger.info('✅ Chat request processed successfully!', {
                requestId,
                processingTime: `${processingTime}ms`,
                responseLength: aiResponse.length
            });

            // Remove from processing queue
            this.processingQueue.delete(requestId);

        } catch (error)
        {
            logger.error('💥 Error processing chat request:', error);

            // Send error response
            const errorResponse = {
                id: requestId,
                user: request.user || 'anonymous',
                error: 'Processing failed',
                error_details: error.message,
                timestamp: new Date().toISOString()
            };

            this.mqttClient.publish(
                this.config.mqtt.topics.response,
                JSON.stringify(errorResponse),
                { qos: 1 }
            );

            this.processingQueue.delete(requestId);
        }
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
            madness_level: this.config.service.madnessLevel
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
        logger.info('🛑 Shutting down Whispermind_Conduit...');

        await this.publishStatus('OFFLINE', 'Neural bridge deactivating...');

        if (this.mqttClient)
        {
            this.mqttClient.end();
        }

        logger.info('👋 Whispermind_Conduit has been deactivated. The madness sleeps...');
        process.exit(0);
    }
}

// 🎭 Handle graceful shutdown
process.on('SIGINT', async () =>
{
    logger.info('🛑 Received SIGINT, initiating graceful shutdown...');
    if (global.conduitInstance)
    {
        await global.conduitInstance.shutdown();
    }
});

process.on('SIGTERM', async () =>
{
    logger.info('🛑 Received SIGTERM, initiating graceful shutdown...');
    if (global.conduitInstance)
    {
        await global.conduitInstance.shutdown();
    }
});

// 🚀 Start the service if run directly
if (require.main === module)
{
    logger.info('🎭 Welcome to the Madness! Starting Whispermind_Conduit...');

    const conduit = new WhispermindConduit();
    global.conduitInstance = conduit;

    conduit.start().catch((error) =>
    {
        logger.error('💥 Fatal error starting service:', error);
        process.exit(1);
    });
}

module.exports = WhispermindConduit; 
