# API Keys Setup Guide

The app now uses **non-Google**, free and open-source providers. You need to obtain free API keys for the following services:

## Required API Keys

### 1. OpenCage Geocoding (Search) - **REQUIRED**
- **Purpose**: Search for places by name
- **Sign up**: https://opencagedata.com/api
- **Free tier**: 2,500 requests/day
- **Add to**: `server/.env` as `OPENCAGE_API_KEY=your_key_here`

### 2. OpenRouteService (Route Optimization) - **REQUIRED**
- **Purpose**: Calculate optimal driving routes and distances
- **Sign up**: https://openrouteservice.org/dev/#/signup
- **Free tier**: 2,000 requests/day
- **Add to**: `server/.env` as `ORS_API_KEY=your_key_here`

### 3. OpenTripMap (Nearby Attractions) - **OPTIONAL**
- **Purpose**: Find nearby points of interest and attractions
- **Without API Key**: Works with IP-based rate limiting (100 requests/day)
- **With API Key**: 1,000 requests/day
- **Get API Key**: https://opentripmap.io/profile (requires GitHub login)
- **API Documentation**: https://opentripmap.io/docs
- **Add to**: `server/.env` as `OPENTRIPMAP_API_KEY=your_key_here` (or leave blank)

## Setup Steps

### Step 1: Create `server/.env` file
Copy the example file:
```powershell
Copy-Item server\.env.example server\.env
```

### Step 2: Get your API keys

**Required:**
1. **OpenCage** - Visit https://opencagedata.com/api and sign up
2. **OpenRouteService** - Visit https://openrouteservice.org/dev/#/signup and sign up

**Optional (for higher rate limits):**
3. **OpenTripMap** - Visit https://opentripmap.io/profile (GitHub login required)
   - Without key: 100 requests/day per IP
   - With key: 1,000 requests/day

### Step 3: Add keys to `server/.env`
Open `server/.env` and add your keys:

**Required:**
```bash
OPENCAGE_API_KEY=your_opencage_key_here
ORS_API_KEY=your_openrouteservice_key_here
```

**Optional:**
```bash
OPENTRIPMAP_API_KEY=your_opentripmap_key_here
# Or leave blank to use IP-based rate limiting (100 req/day)
```

### Step 4: Restart the backend server
The server will automatically pick up the new keys.

## Verify Setup

Once you've added your keys and restarted the server:

1. Open http://localhost:3000
2. Search for a place (e.g., "San Francisco")
3. If results appear, your OPENCAGE_API_KEY is working ✓
4. Add 2+ places and click "Optimize Route"
5. If you see distance/duration, your ORS_API_KEY is working ✓
6. Click on a place in your itinerary
7. If recommendations appear in the right panel, your OPENTRIPMAP_API_KEY is working ✓

## AI Features (Optional)

The app uses **Ollama** (local LLM) by default for generating itinerary suggestions. This runs completely offline and requires no API key.

### Option 1: Use Ollama (Recommended - Free & Local)
1. Install Ollama: https://ollama.ai
2. Run: `ollama pull llama2`
3. Start: `ollama serve`
4. The app will automatically use it (already configured in `.env`)

### Option 2: Use OpenAI (Cloud - Requires API Key)
1. Get key from: https://platform.openai.com/api-keys
2. Add to `server/.env`:
   ```bash
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_key_here
   ```

## Troubleshooting

### "Search service not configured"
- Check that `OPENCAGE_API_KEY` is set in `server/.env`
- Restart the backend server

### "Route optimization not configured"
- Check that `ORS_API_KEY` is set in `server/.env`
- Restart the backend server

### "Recommendations not configured"
- Check that `OPENTRIPMAP_API_KEY` is set in `server/.env`
- Restart the backend server

### Check server logs
The server will log which keys are missing when you make requests. Check the terminal running the backend for error messages.

## Free Tier Limits

All providers offer generous free tiers suitable for development and personal use:

| Provider | Free Tier | Limit Type |
|----------|-----------|------------|
| OpenCage | 2,500/day | Per account |
| OpenRouteService | 2,000/day | Per account |
| OpenTripMap | 1,000/day | Per IP (no key required for basic use) |
| Ollama | Unlimited | Local - no API |

For production use, you may need to upgrade or implement caching to stay within limits.
