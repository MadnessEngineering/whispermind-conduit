#!/usr/bin/env node

/**
 * 🧪 Enhanced Whispermind_Conduit Test Script
 * 
 * Test the agentic capabilities of the enhanced conduit by sending
 * various types of requests through MQTT and observing the responses.
 * 
 * This script demonstrates:
 * - Standard chat responses
 * - Agentic tool use with .act() API
 * - Structured output validation
 * - Multi-round autonomous execution
 */

const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

class ConduitTester
{
    constructor()
    {
        this.mqttClient = null;
        this.testResults = new Map();

        this.config = {
            broker: 'mqtt://localhost:1883',
            clientId: `conduit-tester-${uuidv4()}`,
            topics: {
                request: 'chat/request',
                response: 'chat/response',
                status: 'conduit/status',
                agent_activity: 'conduit/agent'
            }
        };
    }

    async connect()
    {
        return new Promise((resolve, reject) =>
        {
            console.log('🔌 Connecting to MQTT broker for testing...');

            this.mqttClient = mqtt.connect(this.config.broker, {
                clientId: this.config.clientId,
                clean: true,
                connectTimeout: 10000
            });

            this.mqttClient.on('connect', () =>
            {
                console.log('✅ Test client connected to MQTT');

                // Subscribe to response topics
                this.mqttClient.subscribe([
                    this.config.topics.response,
                    this.config.topics.status,
                    this.config.topics.agent_activity
                ], (err) =>
                {
                    if (err)
                    {
                        reject(err);
                    } else
                    {
                        console.log('👂 Subscribed to response topics');
                        resolve();
                    }
                });
            });

            this.mqttClient.on('message', (topic, message) =>
            {
                this.handleResponse(topic, message);
            });

            this.mqttClient.on('error', reject);
        });
    }

    handleResponse(topic, message)
    {
        try
        {
            const data = JSON.parse(message.toString());

            if (topic === this.config.topics.response)
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
            else if (topic === this.config.topics.agent_activity)
            {
                console.log('🤖 Agent activity:', data.activity);
            }
            else if (topic === this.config.topics.status)
            {
                console.log('📊 Service status:', data.status, '-', data.message);
            }
        } catch (error)
        {
            console.error('Error parsing response:', error);
        }
    }

    async sendTestRequest(message, agentMode = 'standard', description = '')
    {
        const requestId = uuidv4();
        const request = {
            id: requestId,
            user: 'test-user',
            message,
            agent_mode: agentMode,
            temperature: 0.7,
            max_tokens: 1000
        };

        console.log(`\n🧪 ${description}`);
        console.log('Request ID:', requestId);
        console.log('Message:', message.substring(0, 50) + '...');
        console.log('Agent Mode:', agentMode);

        this.mqttClient.publish(
            this.config.topics.request,
            JSON.stringify(request),
            { qos: 1 }
        );

        return requestId;
    }

    async runTestSuite()
    {
        console.log('🎭 Starting Enhanced Whispermind_Conduit Test Suite!');

        // Wait a moment for connections to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 1: Standard chat
        await this.sendTestRequest(
            "Hello! Can you tell me about the weather today?",
            "standard",
            "Testing standard chat response"
        );

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 2: Agentic mode with system analysis
        await this.sendTestRequest(
            "Analyze the system information and calculate how long this process has been running",
            "autonomous",
            "Testing agentic tool use with system_info tool"
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Test 3: Math problem solving
        await this.sendTestRequest(
            "Solve this calculation: What is 42 * 137 + 256?",
            "autonomous",
            "Testing agentic tool use with mad_calculator"
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Test 4: File analysis (if conduit.js exists)
        await this.sendTestRequest(
            "Analyze the structure of src/conduit.js file",
            "autonomous",
            "Testing agentic file analysis"
        );

        await new Promise(resolve => setTimeout(resolve, 8000));

        // Test 5: Complex multi-step task
        await this.sendTestRequest(
            "First get system information, then calculate the memory usage in MB, and finally tell me if the system is healthy",
            "autonomous",
            "Testing multi-round agentic execution"
        );

        // Wait for all responses
        await new Promise(resolve => setTimeout(resolve, 10000));

        this.printResults();
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

    async disconnect()
    {
        if (this.mqttClient)
        {
            this.mqttClient.end();
        }
        console.log('\n👋 Test client disconnected');
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
