/**
 * 🧠⚡ Whispermind_Conduit - Windows Service Uninstaller
 * "Disconnecting the neural bridge from the Windows realm!"
 */

const Service = require('node-windows').Service;
const path = require('path');
require('dotenv').config();

// Define the service (same configuration as installer)
const svc = new Service({
    name: process.env.SERVICE_NAME || 'WhispermindConduit',
    script: path.join(__dirname, '..', 'src', 'conduit.js')
});

// Listen for the "uninstall" event
svc.on('uninstall', function ()
{
    console.log('🎭 Whispermind_Conduit service uninstalled successfully!');
    console.log('🧠 The neural bridge has been disconnected from the Windows realm.');
    console.log('');
    console.log('🧹 Cleanup complete! The madness has been contained... for now.');
});

svc.on('error', function (err)
{
    console.error('💀 Service uninstallation error:', err);
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

console.log('🧠⚡ Whispermind_Conduit Service Uninstaller');
console.log('============================================');

if (!isAdmin())
{
    console.error('❌ Error: This script must be run as Administrator!');
    console.log('');
    console.log('🔧 To uninstall the service:');
    console.log('1. Right-click Command Prompt or PowerShell');
    console.log('2. Select "Run as administrator"');
    console.log('3. Navigate to this directory');
    console.log('4. Run: npm run uninstall-service');
    process.exit(1);
}

console.log('🔧 Uninstalling Whispermind_Conduit Windows Service...');
console.log(`📍 Service Name: ${svc.name}`);
console.log('');

// Check if service exists
try
{
    const { execSync } = require('child_process');
    const result = execSync(`sc query "${svc.name}"`, { encoding: 'utf8' });

    if (result.includes('does not exist'))
    {
        console.log('ℹ️ Service is not installed or already removed.');
        process.exit(0);
    }
} catch (error)
{
    console.log('ℹ️ Service is not installed or already removed.');
    process.exit(0);
}

// Stop the service first if it's running
try
{
    console.log('🛑 Stopping service if running...');
    const { execSync } = require('child_process');
    execSync(`sc stop "${svc.name}"`, { stdio: 'ignore' });
    console.log('✅ Service stopped');

    // Wait a moment for service to fully stop
    setTimeout(() =>
    {
        console.log('🗑️ Uninstalling service...');
        svc.uninstall();
    }, 2000);

} catch (error)
{
    // Service might not be running, continue with uninstall
    console.log('🗑️ Uninstalling service...');
    svc.uninstall();
} 
