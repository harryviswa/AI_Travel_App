# Quick Start Guide - AI Travel Assistant

## What You're Running

Your AI Travel Assistant app is now running with:
- ✅ **Frontend**: React + MapLibre GL at http://localhost:3000
- ✅ **Backend**: Express API on port 5000
- ✅ **Map**: OpenStreetMap tiles (no API key needed)
- ⚠️ **Search/Routes/POIs**: Require free API keys (see below)

## Current Status

The app loads successfully but **search functionality requires API keys**. When you try to search, you'll see:
```
Search service not configured. Please add OPENCAGE_API_KEY to server/.env
```

## Get Started in 3 Steps

### Step 1: Get Free API Keys (5 minutes)

**Required (for core functionality):**

1. **OpenCage** (for place search): https://opencagedata.com/api
   - Free: 2,500 requests/day
   
2. **OpenRouteService** (for route optimization): https://openrouteservice.org/dev/#/signup
   - Free: 2,000 requests/day

**Optional (nearby attractions work without key at 100 req/day):**
   
3. **OpenTripMap** (for nearby attractions): https://opentripmap.io/profile
   - Without key: 100 requests/day per IP
   - With key: 1,000 requests/day (requires GitHub login)

### Step 2: Add Keys to `.env`

Open `server/.env` and add your **required** keys:

```bash
OPENCAGE_API_KEY=paste_your_opencage_key_here
ORS_API_KEY=paste_your_ors_key_here
```

**Optional** (leave blank to use IP-based limit):
```bash
OPENTRIPMAP_API_KEY=paste_your_opentripmap_key_here_or_leave_blank
```

### Step 3: Restart Backend

The backend server will automatically reload and pick up your keys. You'll see:
```
🚀 Server is running on port 5000
```

## Try It Out

Once your keys are configured:

1. **Search for a place**: Type "San Francisco" → Click Search → Click a result to add it
2. **Add more places**: Search for "Golden Gate Bridge", "Fisherman's Wharf", etc.
3. **Optimize route**: Click "🚗 Optimize Route" to calculate the best driving order
4. **View on map**: See numbered markers and route line on the interactive map
5. **Get recommendations**: Click any place in your itinerary to see nearby attractions in the right panel
6. **Generate AI itineraries**: Click "✨ Generate Plans" for AI-powered trip suggestions (requires Ollama)

## AI Features (Optional)

The app uses **Ollama** for local, offline AI features:

```powershell
# Install Ollama
winget install Ollama.Ollama

# Pull the model
ollama pull llama2

# Start the service (runs in background)
ollama serve
```

Ollama is completely free and runs locally—no cloud API needed!

Alternatively, use OpenAI by setting `AI_PROVIDER=openai` and adding your `OPENAI_API_KEY` in `server/.env`.

## Troubleshooting

### Port 5000 in use
If you see "EADDRINUSE" error:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process -Force
```
Then restart via the VS Code tasks.

### Map not showing
- Check browser console for errors
- Ensure http://localhost:3000 is accessible
- The map uses free OpenStreetMap tiles—no key needed

### Search returns error
- Verify `OPENCAGE_API_KEY` is in `server/.env`
- Check the backend terminal for error messages
- Restart the backend server

## File Structure

```
AI_Travel_App/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # MapView, SearchBar, etc.
│   │   ├── services/    # API client
│   │   └── store/       # Zustand state
│   └── .env            # (optional) VITE_MAP_STYLE_URL
├── server/             # Express backend
│   ├── src/
│   │   ├── routes/     # places.ts, itinerary.ts
│   │   └── index.ts    # Server entry
│   └── .env           # API keys go here! ⚠️
└── README.md
```

## Running the Application (Already Running!)

The app should already be running via VS Code tasks:
- Backend: Check "Start Backend Server" task
- Frontend: Check "Start Frontend Client" task

To manually start:

```powershell
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev
```

## Next Steps

- ✅ Frontend & backend running
- ⏳ Add API keys to `server/.env`
- ⏳ Test search, optimize, and recommendations
- 🎯 Optional: Set up Ollama for AI features
- 🎯 Optional: Customize map style with `VITE_MAP_STYLE_URL`

## Need Help?

Check these docs:
- `API_KEYS_SETUP.md` - Detailed key setup instructions
- `OLLAMA_SETUP.md` - Ollama installation and configuration
- `README.md` - Full project overview

---

**Ready to travel?** Add your API keys and start planning your next road trip! 🗺️✨
