# 🗺️ AI Travel Assistant Companion

An intelligent web application that helps users plan optimized car travel itineraries using Google Maps APIs and AI-powered recommendations.

## ✨ Features

- **🔍 Place Search**: Search for locations and add them to your itinerary
- **📍 Interactive Map**: Visualize your route with markers and directions
- **🎯 Smart Recommendations**: Get AI-powered suggestions for nearby attractions and restaurants
- **🚗 Route Optimization**: Calculate the most efficient driving routes
- **✨ Multiple Itineraries**: Generate different itinerary options for the same destinations
- **📊 Trip Analytics**: View total distance and travel time

## 🏗️ Project Structure

```
AI_Travel_App/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── MapView.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ItineraryPanel.tsx
│   │   │   └── RecommendationsPanel.tsx
│   │   ├── store/         # Zustand state management
│   │   │   └── itineraryStore.ts
│   │   ├── services/      # API client
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── places.ts      # Places API routes
│   │   │   └── itinerary.ts   # Itinerary API routes
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Maps API Key** with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Places API (Nearby Search)
- **Ollama** (for local AI - recommended) OR **OpenAI API Key** (optional cloud AI)
  - Install Ollama: https://ollama.ai/
  - Default model: llama2 (or llama3, mistral, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI_Travel_App
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Configuration

1. **Configure Client Environment Variables**
   
   Create `client/.env` file:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

2. **Configure Server Environment Variables**
   
   Create `server/.env` file:
   ```env
   PORT=5000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   
   # AI Configuration - Use Ollama (local) by default
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   
   # Optional: Use OpenAI instead (requires API key and credits)
   # AI_PROVIDER=openai
   # OPENAI_API_KEY=your_openai_api_key_here
   ```

### Getting API Keys

#### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Go to **Credentials** and create an API key
5. Restrict the API key to your domain (recommended for production)

#### OpenAI API Key (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Update `server/.env`: Set `AI_PROVIDER=openai` and add your key

#### Ollama Setup (Recommended - Free & Local)

1. Install Ollama from https://ollama.ai/
2. Start Ollama: `ollama serve`
3. Pull a model: `ollama pull llama2` (or llama3, mistral, etc.)
4. Server will automatically use Ollama by default
5. No API key needed - runs completely locally!

## 🎮 Running the Application

### Development Mode

You need to run both the client and server simultaneously.

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```
Server will start at `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
Client will start at `http://localhost:3000`

### Production Build

**Build Client:**
```bash
cd client
npm run build
```

**Build Server:**
```bash
cd server
npm run build
```

**Run Production Server:**
```bash
cd server
npm start
```

## 📖 Usage Guide

### 1. Search and Add Places

- Use the search bar to find locations
- Click on search results to add them to your itinerary
- Places will appear in the left panel and as markers on the map

### 2. View Recommendations

- Click on any place in your itinerary
- The right panel will show nearby attractions and restaurants
- Add recommended places to your itinerary with one click

### 3. Optimize Your Route

- Once you have 2+ places, click **"Optimize Route"**
- The system calculates the most efficient driving route
- View total distance and travel time

### 4. Generate AI Itineraries

- Click **"Generate Plans"** to create multiple itinerary options
- AI considers logical sequencing and nearby attractions
- Review different options in the bottom panel

### 5. Manage Your Itinerary

- Drag markers on the map to visualize your route
- Remove places by clicking the ✕ button
- Clear all places with the "Clear All" button

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Google Maps React** - Map integration
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Google Maps Services** - Places, Directions APIs
- **Ollama** - Local AI/LLM (default)
- **OpenAI** - Cloud AI (optional alternative)
- **tsx** - TypeScript execution

## 🔌 API Endpoints

### Places API

- `GET /api/places/search?query=<query>` - Search for places
- `GET /api/places/details/:placeId` - Get place details
- `GET /api/places/nearby?location=<lat,lng>&radius=<meters>` - Get nearby places

### Itinerary API

- `POST /api/itinerary/optimize-route` - Optimize route for multiple places
- `POST /api/itinerary/generate` - Generate AI-powered itineraries
- `POST /api/itinerary/recommendations` - Get recommendations for a place

## 🤝 Core Responsibilities

The AI Travel Assistant performs the following tasks:

1. **Place Search & Add**: Suggests relevant places from Google Maps
2. **Nearby Recommendations**: Finds must-visit attractions and hidden gems
3. **Itinerary Planning**: Generates multiple itinerary options
4. **Route Optimization**: Calculates optimal driving routes
5. **User Experience**: Clear, structured presentation of travel plans

## 🎨 Key Features Explained

### Smart Route Optimization
Uses Google Directions API with waypoint optimization to minimize driving time and distance.

### AI-Powered Itineraries
Leverages **Ollama (local LLM)** by default or **OpenAI GPT** (optional) to create logical, time-efficient travel plans considering:
- Proximity of attractions
- Optimal visiting sequence
- Time allocation for each location
- Nearby points of interest

**Benefits of Ollama (default):**
- ✅ Free - no API costs
- ✅ Private - data stays on your machine
- ✅ Fast - local processing
- ✅ Works offline

**Optional OpenAI:**
- More advanced language understanding
- Cloud-based processing
- Requires API key and credits

### Real-time Map Integration
Interactive Google Maps with:
- Numbered markers for each destination
- Route polylines showing the driving path
- Bounds fitting to show all locations
- Marker animations for selected places

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep API keys secure and rotate them regularly
- Implement rate limiting for production use
- Add authentication for user-specific itineraries
- Restrict Google Maps API key to your domain

## 🐛 Troubleshooting

**Map not loading?**
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Check browser console for API errors
- Ensure Maps JavaScript API is enabled

**Places search not working?**
- Check `GOOGLE_MAPS_API_KEY` in server `.env`
- Verify Places API is enabled in Google Cloud Console
- Check server logs for error messages

**AI recommendations failing?**
- **Using Ollama (default):**
  - Ensure Ollama is running: `ollama serve`
  - Check if model is installed: `ollama list`
  - Pull model if needed: `ollama pull llama2`
  - Verify `OLLAMA_BASE_URL` in server `.env`
- **Using OpenAI:**
  - Verify `OPENAI_API_KEY` is valid
  - Check OpenAI account has available credits
  - Ensure `AI_PROVIDER=openai` in server `.env`
- Review server logs for API errors

## 📝 Future Enhancements

- [ ] User authentication and saved itineraries
- [ ] Multi-day trip planning
- [ ] Budget estimation for trips
- [ ] Weather integration
- [ ] Sharing itineraries with friends
- [ ] Export to Google Maps or PDF
- [ ] Real-time traffic updates
- [ ] Hotel and restaurant booking integration

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google Maps Platform for location services
- OpenAI for AI-powered recommendations
- React and Vite communities

---

**Built with ❤️ for travelers who love road trips**
