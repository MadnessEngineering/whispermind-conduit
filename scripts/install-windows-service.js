/**
 * 🧠⚡ Whispermind_Conduit - Windows Service Installer
 * "Installing the neural bridge into the Windows realm!"
 */

const Service = require('node-windows').Service;
const path = require('path');
require('dotenv').config();

// Define the service
const svc = new Service({
    name: process.env.SERVICE_NAME || 'WhispermindConduit',
    description: process.env.SERVICE_DESCRIPTION || 'Neural bridge between MQTT chat requests and LM Studio AI models',
    script: path.join(__dirname, '..', 'src', 'conduit.js'),
    nodeOptions: [
        '--max_old_space_size=4096'
    ],
    env: [
        {
            name: "NODE_ENV",
            value: "production"
        },
        {
            name: "LOG_LEVEL",
            value: process.env.LOG_LEVEL || "info"
        }
    ],
    workingDirectory: path.join(__dirname, '..'),
    allowServiceLogon: true
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', function ()
{
    console.log('🎭 Whispermind_Conduit service installed successfully!');
    console.log('⚡ Starting the neural bridge...');
    svc.start();
});

svc.on('start', function ()
{
    console.log('✅ Whispermind_Conduit service started!');
    console.log('🧠 The neural bridge is now active and ready to channel the madness!');
    console.log('');
    console.log('📊 Service Details:');
    console.log(`   Name: ${svc.name}`);
    console.log(`   Description: ${svc.description}`);
    console.log(`   Script: ${svc.script}`);
    console.log(`   Working Directory: ${svc.workingDirectory}`);
    console.log('');
    console.log('🎮 Management Commands:');
    console.log('   View Logs: Event Viewer > Windows Logs > Application');
    console.log('   Stop Service: sc stop WhispermindConduit');
    console.log('   Start Service: sc start WhispermindConduit');
    console.log('   Uninstall: npm run uninstall-service');
});

svc.on('error', function (err)
{
    console.error('💀 Service installation error:', err);
    process.exit(1);
});

// Check if running as administrator
function isAdmin()
{
    try
    {
        require('child_process').execSync('net session', { stdio: 'ignore' });
        return true;
    } catch (e)
    {
        return false;
    }
}

console.log('🧠⚡ Whispermind_Conduit Service Installer');
console.log('==========================================');

if (!isAdmin())
{
    console.error('❌ Error: This script must be run as Administrator!');
    console.log('');
    console.log('🔧 To install the service:');
    console.log('1. Right-click Command Prompt or PowerShell');
    console.log('2. Select "Run as administrator"');
    console.log('3. Navigate to this directory');
    console.log('4. Run: npm run install-service');
    process.exit(1);
}

// Validate environment
const requiredEnvVars = ['MQTT_HOST', 'LM_STUDIO_HOST'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0)
{
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName =>
    {
        console.error(`   - ${varName}`);
    });
    console.log('');
    console.log('🔧 Please create a .env file with the required configuration.');
    console.log('   Use .env.example as a template.');
    process.exit(1);
}

console.log('🔧 Installing Whispermind_Conduit as Windows Service...');
console.log(`📍 Service Name: ${svc.name}`);
console.log(`📄 Description: ${svc.description}`);
console.log(`📂 Working Directory: ${svc.workingDirectory}`);
console.log(`🎯 Script Path: ${svc.script}`);
console.log('');

// Install the service
svc.install();
