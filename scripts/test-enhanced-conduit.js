#!/usr/bin/env node

/**
 * 🧪 Enhanced Whispermind_Conduit Test Script - Redis Edition
 * 
 * Test the agentic capabilities of the enhanced conduit by sending
 * various types of requests through Redis and observing the responses.
 * 
 * This script demonstrates:
 * - Standard chat responses
 * - Agentic tool use with .act() API
 * - Structured output validation
 * - Multi-round autonomous execution
 * - Conversation history persistence
 * - User session management
 */

const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

class ConduitTester
{
    constructor()
    {
        this.redis = null;
        this.redisSub = null;
        this.testResults = new Map();

        this.config = {
            host: 'localhost',
            port: 6379,
            channels: {
                request: 'whispermind:request',
                response: 'whispermind:response',
                status: 'whispermind:status',
                agent_activity: 'whispermind:agent'
            }
        };
    }

    async connect()
    {
        try
        {
            console.log('🔌 Connecting to Redis for testing...');

            // Main Redis connection
            this.redis = new Redis({
                host: this.config.host,
                port: this.config.port
            });

            // Subscription Redis connection
            this.redisSub = new Redis({
                host: this.config.host,
                port: this.config.port
            });

            await new Promise((resolve, reject) =>
            {
                this.redis.on('connect', () =>
                {
                    console.log('✅ Test client connected to Redis');
                    resolve();
                });

                this.redis.on('error', reject);
            });

            // Subscribe to response channels
            await this.redisSub.subscribe([
                this.config.channels.response,
                this.config.channels.status,
                this.config.channels.agent_activity
            ]);

            console.log('👂 Subscribed to response channels');

            this.redisSub.on('message', (channel, message) =>
            {
                this.handleResponse(channel, message);
            });

        } catch (error)
        {
            console.error('💥 Redis connection failed:', error);
            throw error;
        }
    }

    handleResponse(channel, message)
    {
        try
        {
            const data = JSON.parse(message);

            if (channel === this.config.channels.response)
            {
                console.log('\n📨 Response received:');
                console.log('ID:', data.id);
                console.log('Response:', data.response?.substring(0, 100) + '...');
                console.log('Processing time:', data.processing_time_ms + 'ms');
                console.log('Agent rounds:', data.agent_rounds || 0);
                console.log('Tools used:', data.tools_used || []);

                this.testResults.set(data.id, {
                    ...data,
                    received_at: new Date()
                });
            }
            else if (channel === this.config.channels.agent_activity)
            {
                console.log('🤖 Agent activity:', data.activity);
            }
            else if (channel === this.config.channels.status)
            {
                console.log('📊 Service status:', data.status, '-', data.message);
                if (data.redis_features)
                {
                    console.log('🚀 Redis features enabled:', Object.keys(data.redis_features));
                }
            }
        } catch (error)
        {
            console.error('Error parsing response:', error);
        }
    }

    async sendTestRequest(message, agentMode = 'standard', description = '', userId = 'test-user')
    {
        const requestId = uuidv4();
        const request = {
            id: requestId,
            user: userId,
            message,
            agent_mode: agentMode,
            temperature: 0.7,
            max_tokens: 1000
        };

        console.log(`\n🧪 ${description}`);
        console.log('Request ID:', requestId);
        console.log('User ID:', userId);
        console.log('Message:', message.substring(0, 50) + '...');
        console.log('Agent Mode:', agentMode);

        await this.redis.publish(
            this.config.channels.request,
            JSON.stringify(request)
        );

        return requestId;
    }

    async runTestSuite()
    {
        console.log('🎭 Starting Enhanced Whispermind_Conduit Test Suite - Redis Edition!');

        // Wait a moment for connections to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 1: Standard chat
        await this.sendTestRequest(
            "Hello! Can you tell me about the weather today?",
            "standard",
            "Testing standard chat response",
            "user1"
        );

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 2: Agentic mode with system analysis
        await this.sendTestRequest(
            "Analyze the system information and calculate how long this process has been running",
            "autonomous",
            "Testing agentic tool use with system_info tool",
            "user1"
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Test 3: Math problem solving
        await this.sendTestRequest(
            "Solve this calculation: What is 42 * 137 + 256?",
            "autonomous",
            "Testing agentic tool use with mad_calculator",
            "user2"
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Test 4: File analysis
        await this.sendTestRequest(
            "Analyze the structure of src/enhanced-conduit.js file",
            "autonomous",
            "Testing agentic file analysis",
            "user2"
        );

        await new Promise(resolve => setTimeout(resolve, 8000));

        // Test 5: Conversation history (new Redis feature!)
        await this.sendTestRequest(
            "What did I ask you before? Use conversation_history tool to check",
            "autonomous",
            "Testing conversation history retrieval",
            "user1"
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Test 6: Complex multi-step task
        await this.sendTestRequest(
            "First get system information, then calculate the memory usage in MB, and finally tell me if the system is healthy",
            "autonomous",
            "Testing multi-round agentic execution",
            "user3"
        );

        // Wait for all responses
        await new Promise(resolve => setTimeout(resolve, 10000));

        await this.printResults();
        await this.printRedisData();
    }

    printResults()
    {
        console.log('\n🎯 Test Results Summary:');
        console.log('='.repeat(50));

        for (const [id, result] of this.testResults)
        {
            console.log(`\nTest ID: ${id}`);
            console.log(`Status: ${result.error ? '❌ ERROR' : '✅ SUCCESS'}`);
            console.log(`Processing Time: ${result.processing_time_ms}ms`);
            console.log(`Agent Rounds: ${result.agent_rounds || 0}`);
            console.log(`Tools Used: ${(result.tools_used || []).join(', ') || 'None'}`);
            console.log(`Response Length: ${(result.response || result.error_details || '').length} chars`);
        }

        console.log(`\n📊 Total Tests: ${this.testResults.size}`);
        console.log(`✅ Successful: ${Array.from(this.testResults.values()).filter(r => !r.error).length}`);
        console.log(`❌ Failed: ${Array.from(this.testResults.values()).filter(r => r.error).length}`);
    }

    async printRedisData()
    {
        console.log('\n💾 Redis Data Summary:');
        console.log('='.repeat(50));

        try
        {
            // Check conversation history
            const users = ['user1', 'user2', 'user3'];
            for (const userId of users)
            {
                const conversationKey = `conversations:${userId}`;
                const conversationCount = await this.redis.llen(conversationKey);
                console.log(`👤 ${userId}: ${conversationCount} conversations stored`);

                if (conversationCount > 0)
                {
                    const latestConversation = await this.redis.lrange(conversationKey, 0, 0);
                    const conversation = JSON.parse(latestConversation[0]);
                    console.log(`   Latest: "${conversation.userMessage.substring(0, 30)}..."`);
                }
            }

            // Check user sessions
            for (const userId of users)
            {
                const sessionKey = `sessions:${userId}`;
                const session = await this.redis.get(sessionKey);
                if (session)
                {
                    const parsed = JSON.parse(session);
                    console.log(`🔄 ${userId} session: ${parsed.conversationCount} messages, last active: ${parsed.lastActivity}`);
                }
            }

            // Check agent logs
            const agentLogsCount = await this.redis.xlen('agent_logs');
            console.log(`🤖 Agent logs: ${agentLogsCount} entries`);

            // Check service status
            const serviceStatus = await this.redis.get('service:status');
            if (serviceStatus)
            {
                const status = JSON.parse(serviceStatus);
                console.log(`📊 Service: ${status.status} (${status.madness_level})`);
            }

        } catch (error)
        {
            console.error('❌ Error reading Redis data:', error.message);
        }
    }

    async disconnect()
    {
        if (this.redisSub)
        {
            this.redisSub.disconnect();
        }
        if (this.redis)
        {
            this.redis.disconnect();
        }
        console.log('\n👋 Test client disconnected from Redis');
    }
}

// Run the test suite
async function main()
{
    const tester = new ConduitTester();

    try
    {
        await tester.connect();
        await tester.runTestSuite();
    } catch (error)
    {
        console.error('💥 Test suite failed:', error);
    } finally
    {
        await tester.disconnect();
        process.exit(0);
    }
}

if (require.main === module)
{
    main();
}

module.exports = ConduitTester; 
