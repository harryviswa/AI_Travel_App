# AI Travel Assistant - Environment Setup Script
# Run this script to create your .env files

Write-Host "🗺️ AI Travel Assistant - Environment Setup" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Get API Keys from user
Write-Host "Please enter your API keys:`n" -ForegroundColor Yellow

$googleMapsKey = Read-Host "Google Maps API Key"

# Ask about AI provider preference
Write-Host "`nChoose AI Provider:" -ForegroundColor Yellow
Write-Host "1. Ollama (Local, Free, Private) - Recommended" -ForegroundColor Green
Write-Host "2. OpenAI (Cloud, Requires API Key)" -ForegroundColor Cyan
$aiChoice = Read-Host "Enter choice (1 or 2)"

$aiProvider = "ollama"
$openAiKey = ""

if ($aiChoice -eq "2") {
    $aiProvider = "openai"
    $openAiKey = Read-Host "OpenAI API Key"
    
    if ([string]::IsNullOrWhiteSpace($openAiKey)) {
        Write-Host "`n❌ OpenAI API Key is required when using OpenAI!" -ForegroundColor Red
        exit 1
    }
}

# Validate Google Maps key
if ([string]::IsNullOrWhiteSpace($googleMapsKey)) {
    Write-Host "`n❌ Google Maps API Key is required!" -ForegroundColor Red
    exit 1
}

# Create client .env file
$clientEnv = @"
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=$googleMapsKey
"@

# Create server .env file
if ($aiProvider -eq "ollama") {
    $serverEnv = @"
# Server Port
PORT=5000

# Google Maps API Key
GOOGLE_MAPS_API_KEY=$googleMapsKey

# AI Configuration - Using Ollama (Local LLM)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Optional: Switch to OpenAI by changing AI_PROVIDER to 'openai' and adding key below
# OPENAI_API_KEY=your_openai_api_key_here
"@
} else {
    $serverEnv = @"
# Server Port
PORT=5000

# Google Maps API Key
GOOGLE_MAPS_API_KEY=$googleMapsKey

# AI Configuration - Using OpenAI (Cloud)
AI_PROVIDER=openai
OPENAI_API_KEY=$openAiKey

# Optional: Switch to Ollama (local, free)
# AI_PROVIDER=ollama
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama2
"@
}

# Write files
try {
    $clientEnv | Out-File -FilePath "client\.env" -Encoding UTF8 -Force
    $serverEnv | Out-File -FilePath "server\.env" -Encoding UTF8 -Force
    
    Write-Host "`n✅ Environment files created successfully!" -ForegroundColor Green
    Write-Host "`n📁 Created files:" -ForegroundColor Cyan
    Write-Host "  - client\.env" -ForegroundColor White
    Write-Host "  - server\.env" -ForegroundColor White
    
    if ($aiProvider -eq "ollama") {
        Write-Host "`n🤖 Using Ollama (Local AI)" -ForegroundColor Green
        Write-Host "`n⚠️  Before running the app:" -ForegroundColor Yellow
        Write-Host "  1. Install Ollama: https://ollama.ai/" -ForegroundColor White
        Write-Host "  2. Start Ollama: ollama serve" -ForegroundColor White
        Write-Host "  3. Pull model: ollama pull llama2" -ForegroundColor White
    } else {
        Write-Host "`n🤖 Using OpenAI (Cloud AI)" -ForegroundColor Cyan
    }
    
    Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
    if ($aiProvider -eq "ollama") {
        Write-Host "  1. Start Ollama: ollama serve (in a terminal)" -ForegroundColor White
        Write-Host "  2. Terminal 1: cd server && npm run dev" -ForegroundColor White
        Write-Host "  3. Terminal 2: cd client && npm run dev" -ForegroundColor White
        Write-Host "  4. Open http://localhost:3000" -ForegroundColor White
    } else {
        Write-Host "  1. Open TWO terminal windows" -ForegroundColor White
        Write-Host "  2. Terminal 1: cd server && npm run dev" -ForegroundColor White
        Write-Host "  3. Terminal 2: cd client && npm run dev" -ForegroundColor White
        Write-Host "  4. Open http://localhost:3000" -ForegroundColor White
    }
    
    Write-Host "`n✨ Happy traveling! 🗺️`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error creating files: $_" -ForegroundColor Red
    exit 1
}
