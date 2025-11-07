# 🤖 Ollama Setup Guide

This guide will help you set up Ollama for local AI-powered itinerary generation.

## Why Ollama?

✅ **Free** - No API costs, no usage limits  
✅ **Private** - Your data never leaves your machine  
✅ **Fast** - Low latency for local processing  
✅ **Offline** - Works without internet connection  
✅ **Open Source** - Transparent and customizable  

## Installation

### Windows
1. Download from https://ollama.ai/download/windows
2. Run the installer
3. Ollama will start automatically

### macOS
```bash
curl https://ollama.ai/install.sh | sh
```

### Linux
```bash
curl https://ollama.ai/install.sh | sh
```

## Quick Start

### 1. Start Ollama Server
```bash
ollama serve
```
Keep this terminal running in the background.

### 2. Pull a Model

**Recommended models:**

```bash
# Llama 2 (7B) - Good balance of speed and quality
ollama pull llama2

# Llama 3 (8B) - Better quality, slightly slower
ollama pull llama3

# Mistral (7B) - Fast and efficient
ollama pull mistral

# Phi-3 (3.8B) - Lightweight, very fast
ollama pull phi3
```

### 3. Test Your Setup
```bash
ollama run llama2 "Plan a 2-day trip to Paris"
```

If you see a response, Ollama is working! Press `Ctrl+D` to exit.

## Configuration

Your `server/.env` should have:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Change the Model

To use a different model, update `OLLAMA_MODEL` in `server/.env`:

```env
OLLAMA_MODEL=llama3    # or mistral, phi3, etc.
```

## Available Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| phi3 | 3.8B | ⚡⚡⚡ | ⭐⭐⭐ | Quick responses |
| llama2 | 7B | ⚡⚡ | ⭐⭐⭐⭐ | General use (recommended) |
| llama3 | 8B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Best quality |
| mistral | 7B | ⚡⚡ | ⭐⭐⭐⭐ | Fast and accurate |

## Commands Reference

```bash
# List installed models
ollama list

# Pull a new model
ollama pull <model-name>

# Remove a model
ollama rm <model-name>

# Run a model interactively
ollama run <model-name>

# Start the server
ollama serve

# Check version
ollama --version
```

## Troubleshooting

### "Connection refused" error
**Solution:** Make sure Ollama is running
```bash
ollama serve
```

### "Model not found"
**Solution:** Pull the model first
```bash
ollama pull llama2
```

### Slow responses
**Solutions:**
- Try a smaller model: `ollama pull phi3`
- Update `OLLAMA_MODEL=phi3` in server/.env
- Close other resource-intensive applications

### Port already in use
**Solution:** Ollama uses port 11434 by default. Make sure nothing else is using it.

## Advanced Configuration

### Custom Port
```bash
# Start Ollama on a different port
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```

Update server/.env:
```env
OLLAMA_BASE_URL=http://localhost:8080
```

### GPU Acceleration

Ollama automatically uses GPU if available (NVIDIA CUDA or Apple Metal).

**Check GPU usage:**
```bash
# While Ollama is running
nvidia-smi  # On NVIDIA GPUs
```

## Switching Between Ollama and OpenAI

### Use Ollama (Default)
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Switch to OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

Just change `AI_PROVIDER` and restart the server!

## Performance Tips

1. **First run is slower** - Models need to load into memory
2. **Keep Ollama running** - Subsequent requests are much faster
3. **Use smaller models** for faster responses (phi3, mistral)
4. **Use larger models** for better quality (llama3)
5. **Close unused models** to free RAM: `ollama rm <model-name>`

## Getting Help

- **Ollama Docs:** https://github.com/ollama/ollama
- **Model Library:** https://ollama.ai/library
- **Discord:** https://discord.gg/ollama

## Next Steps

Once Ollama is set up:

1. ✅ Ensure `ollama serve` is running
2. ✅ Verify model is pulled: `ollama list`
3. ✅ Check `server/.env` has correct settings
4. 🚀 Start the Travel Assistant app!

---

**Using Ollama means you have a powerful AI assistant running entirely on your machine - no cloud, no costs, no limits!** 🚀
