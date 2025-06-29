# 🧠 Redis Installation Script for Windows - Whispermind Conduit
# 
# This script installs Redis on Windows using multiple methods:
# 1. Windows Package Manager (winget) - Preferred
# 2. Chocolatey - If available
# 3. Manual download and installation - Fallback
# 4. WSL2 installation guide - Advanced users
#
# Author: Mad Tinker
# Project: Madness Interactive - Whispermind Conduit

param(
    [Parameter(Mandatory=$false)]
    [string]$Method = "auto",  # auto, winget, chocolatey, manual, wsl
    
    [Parameter(Mandatory=$false)]
    [string]$RedisVersion = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "$env:ProgramFiles\Redis",
    
    [Parameter(Mandatory=$false)]
    [switch]$StartService = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$ConfigureFirewall = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false
)

# 🎭 Mad Tinker's colorful output functions
function Write-MadMessage {
    param([string]$Message, [string]$Type = "Info")
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Type) {
        "Success" { Write-Host "[$timestamp] 🎉 $Message" -ForegroundColor Green }
        "Warning" { Write-Host "[$timestamp] ⚠️  $Message" -ForegroundColor Yellow }
        "Error"   { Write-Host "[$timestamp] 💥 $Message" -ForegroundColor Red }
        "Info"    { Write-Host "[$timestamp] 🧠 $Message" -ForegroundColor Cyan }
        "Step"    { Write-Host "[$timestamp] 🔧 $Message" -ForegroundColor Magenta }
        default   { Write-Host "[$timestamp] $Message" }
    }
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-RedisInstalled {
    try {
        $redisVersion = redis-server --version 2>$null
        if ($redisVersion) {
            Write-MadMessage "Redis is already installed: $redisVersion" "Success"
            return $true
        }
    }
    catch {
        # Redis not in PATH, check common installation locations
        $commonPaths = @(
            "$env:ProgramFiles\Redis",
            "$env:ProgramFiles(x86)\Redis",
            "$env:LOCALAPPDATA\Programs\Redis",
            "C:\tools\redis"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path "$path\redis-server.exe") {
                Write-MadMessage "Redis found at: $path" "Info"
                # Add to PATH for current session
                $env:PATH += ";$path"
                return $true
            }
        }
    }
    return $false
}

function Install-RedisViaWinget {
    Write-MadMessage "Attempting to install Redis via Windows Package Manager (winget)..." "Step"
    
    try {
        # Check if winget is available
        $wingetVersion = winget --version 2>$null
        if (-not $wingetVersion) {
            Write-MadMessage "Windows Package Manager (winget) not available" "Warning"
            return $false
        }
        
        Write-MadMessage "Using winget version: $wingetVersion" "Info"
        
        # Search for Redis packages
        Write-MadMessage "Searching for Redis packages..." "Info"
        $redisPackages = winget search Redis 2>$null
        
        # Install Redis (try multiple package sources)
        $packageIds = @("Redis.Redis", "redis")
        
        foreach ($packageId in $packageIds) {
            Write-MadMessage "Trying to install package: $packageId" "Info"
            $result = winget install $packageId --accept-package-agreements --accept-source-agreements 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-MadMessage "Successfully installed Redis via winget!" "Success"
                
                # Refresh environment variables
                $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
                
                return $true
            }
        }
        
        Write-MadMessage "Failed to install via winget" "Warning"
        return $false
    }
    catch {
        Write-MadMessage "Error installing via winget: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Install-RedisViaChocolatey {
    Write-MadMessage "Attempting to install Redis via Chocolatey..." "Step"
    
    try {
        # Check if Chocolatey is available
        $chocoVersion = choco --version 2>$null
        if (-not $chocoVersion) {
            Write-MadMessage "Chocolatey not available" "Warning"
            return $false
        }
        
        Write-MadMessage "Using Chocolatey version: $chocoVersion" "Info"
        
        # Install Redis
        Write-MadMessage "Installing Redis via Chocolatey..." "Info"
        $result = choco install redis-64 -y 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-MadMessage "Successfully installed Redis via Chocolatey!" "Success"
            
            # Refresh environment variables
            refreshenv 2>$null
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
            
            return $true
        }
        else {
            Write-MadMessage "Failed to install via Chocolatey" "Warning"
            return $false
        }
    }
    catch {
        Write-MadMessage "Error installing via Chocolatey: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Install-RedisManually {
    Write-MadMessage "Attempting manual Redis installation..." "Step"
    
    try {
        # Create installation directory
        if (-not (Test-Path $InstallPath)) {
            New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
            Write-MadMessage "Created installation directory: $InstallPath" "Info"
        }
        
        # Download Redis for Windows
        $downloadUrl = "https://github.com/tporadowski/redis/releases/latest/download/Redis-x64-5.0.14.1.zip"
        $zipFile = Join-Path $env:TEMP "redis-windows.zip"
        
        Write-MadMessage "Downloading Redis from GitHub..." "Info"
        Write-MadMessage "URL: $downloadUrl" "Info"
        
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
        
        Write-MadMessage "Extracting Redis to $InstallPath..." "Info"
        Expand-Archive -Path $zipFile -DestinationPath $InstallPath -Force
        
        # Add to PATH
        $machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        if ($machinePath -notlike "*$InstallPath*") {
            [Environment]::SetEnvironmentVariable("PATH", "$machinePath;$InstallPath", "Machine")
            Write-MadMessage "Added Redis to system PATH" "Success"
        }
        
        # Update current session PATH
        $env:PATH += ";$InstallPath"
        
        # Clean up
        Remove-Item $zipFile -Force
        
        Write-MadMessage "Successfully installed Redis manually!" "Success"
        return $true
    }
    catch {
        Write-MadMessage "Error during manual installation: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Configure-RedisService {
    Write-MadMessage "Configuring Redis as a Windows service..." "Step"
    
    try {
        # Find redis-server.exe
        $redisServerPath = $null
        $searchPaths = @(
            "$InstallPath\redis-server.exe",
            "$env:ProgramFiles\Redis\redis-server.exe",
            "$env:ProgramFiles(x86)\Redis\redis-server.exe",
            "C:\tools\redis\redis-server.exe"
        )
        
        foreach ($path in $searchPaths) {
            if (Test-Path $path) {
                $redisServerPath = $path
                break
            }
        }
        
        if (-not $redisServerPath) {
            # Try to find in PATH
            $redisServerPath = (Get-Command redis-server.exe -ErrorAction SilentlyContinue).Source
        }
        
        if (-not $redisServerPath) {
            Write-MadMessage "Could not find redis-server.exe" "Warning"
            return $false
        }
        
        Write-MadMessage "Found Redis server at: $redisServerPath" "Info"
        
        # Create Redis configuration file
        $configPath = Join-Path (Split-Path $redisServerPath) "redis.windows.conf"
        $redisConfig = @"
# Redis configuration for Whispermind Conduit
bind 127.0.0.1
port 6379
timeout 0
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir ./
maxmemory-policy allkeys-lru
"@
        
        Set-Content -Path $configPath -Value $redisConfig
        Write-MadMessage "Created Redis configuration: $configPath" "Info"
        
        # Install as Windows service
        $serviceName = "Redis"
        $existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        
        if ($existingService) {
            Write-MadMessage "Redis service already exists, removing old service..." "Info"
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            & sc.exe delete $serviceName
            Start-Sleep -Seconds 2
        }
        
        Write-MadMessage "Installing Redis Windows service..." "Info"
        $serviceArgs = "--service-install --service-name $serviceName --service-display-name `"Redis Server`" --conf `"$configPath`""
        
        Start-Process -FilePath $redisServerPath -ArgumentList $serviceArgs -Wait -NoNewWindow
        
        # Start the service
        if ($StartService) {
            Write-MadMessage "Starting Redis service..." "Info"
            Start-Service -Name $serviceName
            
            # Wait a moment and check status
            Start-Sleep -Seconds 3
            $serviceStatus = Get-Service -Name $serviceName
            Write-MadMessage "Redis service status: $($serviceStatus.Status)" "Info"
        }
        
        return $true
    }
    catch {
        Write-MadMessage "Error configuring Redis service: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Configure-WindowsFirewall {
    if (-not $ConfigureFirewall) {
        return
    }
    
    Write-MadMessage "Configuring Windows Firewall for Redis..." "Step"
    
    try {
        # Allow Redis through Windows Firewall (localhost only by default)
        $ruleName = "Redis Server - Whispermind Conduit"
        
        # Remove existing rule if it exists
        Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
        
        # Add new rule for local connections
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 6379 -Action Allow -LocalAddress 127.0.0.1
        
        Write-MadMessage "Configured firewall rule for Redis (localhost only)" "Success"
    }
    catch {
        Write-MadMessage "Warning: Could not configure firewall - $($_.Exception.Message)" "Warning"
    }
}

function Test-RedisConnection {
    Write-MadMessage "Testing Redis connection..." "Step"
    
    try {
        # Wait for Redis to start
        Start-Sleep -Seconds 5
        
        # Test connection using redis-cli
        $testResult = redis-cli ping 2>$null
        
        if ($testResult -eq "PONG") {
            Write-MadMessage "Redis is running and responding to ping!" "Success"
            return $true
        }
        else {
            Write-MadMessage "Redis is not responding to ping commands" "Warning"
            return $false
        }
    }
    catch {
        Write-MadMessage "Error testing Redis connection: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Show-WSLInstallationGuide {
    Write-MadMessage "WSL2 Redis Installation Guide:" "Info"
    Write-Host ""
    Write-Host "For advanced users who prefer Linux Redis in WSL2:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install WSL2 (if not already installed):" -ForegroundColor White
    Write-Host "   wsl --install" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Install Redis in Ubuntu WSL:" -ForegroundColor White
    Write-Host "   sudo apt update" -ForegroundColor Gray
    Write-Host "   sudo apt install redis-server" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Start Redis:" -ForegroundColor White
    Write-Host "   sudo service redis-server start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Test connection:" -ForegroundColor White
    Write-Host "   redis-cli ping" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Access from Windows:" -ForegroundColor White
    Write-Host "   Use localhost:6379 or WSL IP address" -ForegroundColor Gray
    Write-Host ""
}

function Show-CompletionMessage {
    Write-Host ""
    Write-Host "🎉 Redis Installation Complete! 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps for Whispermind Conduit:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Verify Redis is running:" -ForegroundColor White
    Write-Host "   redis-cli ping" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Create your .env file:" -ForegroundColor White
    Write-Host "   cp .env.example .env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Configure Redis settings in .env:" -ForegroundColor White
    Write-Host "   REDIS_HOST=localhost" -ForegroundColor Gray
    Write-Host "   REDIS_PORT=6379" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Start the enhanced Whispermind Conduit:" -ForegroundColor White
    Write-Host "   npm run start:enhanced" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Test the installation:" -ForegroundColor White
    Write-Host "   npm run test:enhanced" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧠 The neural bridge awaits your madness! 🎭" -ForegroundColor Magenta
    Write-Host ""
}

# 🚀 Main Installation Logic
function Main {
    Write-Host ""
    Write-Host "🧠 Redis Installation Script for Whispermind Conduit 🧠" -ForegroundColor Magenta
    Write-Host "========================================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Check admin rights
    if (-not (Test-AdminRights)) {
        Write-MadMessage "This script requires administrator privileges for service installation" "Warning"
        Write-MadMessage "Please run PowerShell as Administrator and try again" "Error"
        Write-Host ""
        Write-Host "To run as administrator:" -ForegroundColor Yellow
        Write-Host "1. Right-click PowerShell" -ForegroundColor White
        Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
        Write-Host "3. Navigate to this directory and run the script again" -ForegroundColor White
        exit 1
    }
    
    # Check if Redis is already installed
    if (Test-RedisInstalled) {
        Write-MadMessage "Redis appears to be already installed!" "Success"
        
        if (Test-RedisConnection) {
            Write-MadMessage "Redis is running and ready for Whispermind Conduit!" "Success"
            Show-CompletionMessage
            return
        }
        else {
            Write-MadMessage "Redis is installed but not running. Attempting to start service..." "Warning"
            Start-Service -Name "Redis" -ErrorAction SilentlyContinue
            
            if (Test-RedisConnection) {
                Show-CompletionMessage
                return
            }
        }
    }
    
    Write-MadMessage "Starting Redis installation process..." "Step"
    
    $installationSuccess = $false
    
    # Choose installation method
    switch ($Method) {
        "winget" {
            $installationSuccess = Install-RedisViaWinget
        }
        "chocolatey" {
            $installationSuccess = Install-RedisViaChocolatey
        }
        "manual" {
            $installationSuccess = Install-RedisManually
        }
        "wsl" {
            Show-WSLInstallationGuide
            return
        }
        "auto" {
            # Try methods in order of preference
            Write-MadMessage "Auto-detecting best installation method..." "Info"
            
            $installationSuccess = Install-RedisViaWinget
            if (-not $installationSuccess) {
                $installationSuccess = Install-RedisViaChocolatey
            }
            if (-not $installationSuccess) {
                $installationSuccess = Install-RedisManually
            }
        }
        default {
            Write-MadMessage "Unknown installation method: $Method" "Error"
            Write-MadMessage "Valid methods: auto, winget, chocolatey, manual, wsl" "Info"
            exit 1
        }
    }
    
    if (-not $installationSuccess) {
        Write-MadMessage "All installation methods failed!" "Error"
        Write-Host ""
        Write-Host "Manual alternatives:" -ForegroundColor Yellow
        Write-Host "1. Try WSL2 installation: .\install-redis-windows.ps1 -Method wsl" -ForegroundColor White
        Write-Host "2. Download Redis manually from: https://github.com/tporadowski/redis/releases" -ForegroundColor White
        Write-Host "3. Use Docker: docker run -d -p 6379:6379 redis:latest" -ForegroundColor White
        exit 1
    }
    
    # Configure Redis as a service
    Configure-RedisService
    
    # Configure Windows Firewall
    Configure-WindowsFirewall
    
    # Test the installation
    if (Test-RedisConnection) {
        Show-CompletionMessage
    }
    else {
        Write-MadMessage "Redis installation completed but connection test failed" "Warning"
        Write-MadMessage "You may need to manually start the Redis service" "Info"
        Write-Host ""
        Write-Host "To start Redis manually:" -ForegroundColor Yellow
        Write-Host "net start Redis" -ForegroundColor White
        Write-Host "or" -ForegroundColor Yellow
        Write-Host "redis-server" -ForegroundColor White
    }
}

# Execute main function
Main 
