import { Router } from 'express';
import axios from 'axios';
import { Ollama } from 'ollama';
import OpenAI from 'openai';
import polyline from '@mapbox/polyline';

const router = Router();

// Initialize AI client based on environment variable
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama';

let ollamaClient: Ollama | null = null;
let openaiClient: OpenAI | null = null;

if (AI_PROVIDER === 'ollama') {
  ollamaClient = new Ollama({
    host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
  console.log('🤖 Using Ollama (local LLM) for AI features');
} else if (AI_PROVIDER === 'openai') {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('🤖 Using OpenAI for AI features');
}

interface Place {
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
}

// Calculate optimal route
router.post('/optimize-route', async (req, res) => {
  try {
    const { places } = req.body as { places: Place[] };

    if (!places || places.length < 2) {
      return res.status(400).json({ error: 'At least 2 places are required' });
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      console.error('ORS_API_KEY not configured');
      return res.status(503).json({ 
        error: 'Route optimization not configured. Please add ORS_API_KEY to server/.env'
      });
    }


    // If only 2 places, just return as is
    if (places.length === 2) {
      const optimizedPlaces = [places[0], places[1]];
      // ...existing code for directions request and response...
      // (copy-paste from below, but with optimizedPlaces)
      const directionsResp = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
          coordinates: optimizedPlaces.map((p) => [p.location.lng, p.location.lat]),
          format: 'geojson',
        },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      // ...existing code for parsing response...
      const route = directionsResp.data.routes?.[0];
      const feature = directionsResp.data.features?.[0];
      let geometry, summary, segments;
      if (route) {
        geometry = route.geometry;
        summary = route.summary;
        segments = route.segments || [];
      } else if (feature) {
        geometry = feature.geometry;
        const props = feature.properties;
        summary = props?.summary;
        segments = props?.segments || [];
      }
      if (!geometry || !summary) {
        console.error('Invalid ORS response structure:', directionsResp.data);
        return res.status(500).json({
          error: 'Invalid response from routing service',
          debug: directionsResp.data,
        });
      }
      let routeGeoJson = geometry;
      if (typeof geometry === 'string') {
        const coordinates = polyline.decode(geometry).map(([lat, lng]) => [lng, lat]);
        routeGeoJson = {
          type: 'LineString',
          coordinates,
        };
      }
      return res.json({
        optimizedPlaces,
        totalDistance: summary.distance ?? 0,
        totalDuration: summary.duration ?? 0,
        routeGeoJson,
        legs: segments.map((s: any) => ({
          distance: `${(s.distance / 1000).toFixed(1)} km`,
          duration: `${Math.round(s.duration / 60)} mins`,
          startAddress: '',
          endAddress: '',
        })),
      });
    }

    // For 3+ places: fix first, brute-force all permutations of the rest (TSP with fixed start)
    const start = places[0];
    const rest = places.slice(1);
    let bestOrder = rest.map((_, i) => i);
    let bestDist = Number.POSITIVE_INFINITY;
    if (rest.length > 1 && rest.length <= 8) {
      // Get distance matrix for all rest
      const matrixResp = await axios.post(
        'https://api.openrouteservice.org/v2/matrix/driving-car',
        {
          locations: rest.map((p) => [p.location.lng, p.location.lat]),
          metrics: ['distance'],
        },
        { headers: { Authorization: apiKey } }
      );
      const distances: number[][] = matrixResp.data.distances;
      // Brute-force all permutations
      function permute(arr: number[]): number[][] {
        if (arr.length <= 1) return [arr];
        const result: number[][] = [];
        for (let i = 0; i < arr.length; i++) {
          const restArr = arr.slice(0, i).concat(arr.slice(i + 1));
          for (const perm of permute(restArr)) {
            result.push([arr[i], ...perm]);
          }
        }
        return result;
      }
      const perms = permute(rest.map((_, i) => i));
      for (const perm of perms) {
        let dist = 0;
        for (let i = 0; i < perm.length - 1; i++) {
          dist += distances[perm[i]][perm[i + 1]];
        }
        // Add distance from start to first in perm
        // (start is not in matrix, so get from ORS matrix)
        const startToFirstResp = await axios.post(
          'https://api.openrouteservice.org/v2/matrix/driving-car',
          {
            locations: [
              [start.location.lng, start.location.lat],
              [rest[perm[0]].location.lng, rest[perm[0]].location.lat],
            ],
            metrics: ['distance'],
          },
          { headers: { Authorization: apiKey } }
        );
        dist += startToFirstResp.data.distances[0][1];
        if (dist < bestDist) {
          bestDist = dist;
          bestOrder = perm;
        }
      }
    }
    const optimizedPlaces: Place[] = [
      start,
      ...bestOrder.map((idx) => rest[idx]),
    ];

    // Request route geometry and legs from ORS
    const directionsResp = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        coordinates: optimizedPlaces.map((p) => [p.location.lng, p.location.lat]),
        format: 'geojson',
      },
      { 
        headers: { 
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log('ORS Response status:', directionsResp.status);
    console.log('ORS Response data:', JSON.stringify(directionsResp.data).substring(0, 500));

    // ORS v2 returns different formats:
    // - format=json: { routes: [...] }
    // - format=geojson: { features: [...] }
    // Try both structures
    const route = directionsResp.data.routes?.[0];
    const feature = directionsResp.data.features?.[0];
    
    let geometry, summary, segments;
    
    if (route) {
      // Standard JSON format
      geometry = route.geometry;
      summary = route.summary;
      segments = route.segments || [];
    } else if (feature) {
      // GeoJSON format
      geometry = feature.geometry;
      const props = feature.properties;
      summary = props?.summary;
      segments = props?.segments || [];
    }

    if (!geometry || !summary) {
      console.error('Invalid ORS response structure:', directionsResp.data);
      return res.status(500).json({ 
        error: 'Invalid response from routing service',
        debug: directionsResp.data 
      });
    }

    // Convert geometry if it's an encoded polyline string to GeoJSON
    let routeGeoJson = geometry;
    if (typeof geometry === 'string') {
      // Geometry is encoded polyline - decode to GeoJSON LineString
      const coordinates = polyline.decode(geometry).map(([lat, lng]) => [lng, lat]);
      routeGeoJson = {
        type: 'LineString',
        coordinates,
      };
    }

    res.json({
      optimizedPlaces,
      totalDistance: summary.distance ?? 0,
      totalDuration: summary.duration ?? 0,
      routeGeoJson,
      legs: segments.map((s: any) => ({
        distance: `${(s.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(s.duration / 60)} mins`,
        startAddress: '',
        endAddress: '',
      })),
    });
  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({ error: 'Failed to optimize route' });
  }
});

// Generate itinerary variations with AI
router.post('/generate', async (req, res) => {
  try {
    const { places, startDate, endDate, preferences } = req.body;

    if (!places || places.length === 0) {
      return res.status(400).json({ error: 'Places are required' });
    }

    const placesInfo = places
      .map((p: Place, i: number) => `${i + 1}. ${p.name} (${p.address})`)
      .join('\n');

    const prompt = `You are a travel planning expert. Create 3 different optimized car travel itineraries for the following places:

${placesInfo}

Travel Dates: ${startDate || 'Flexible'} to ${endDate || 'Flexible'}
Preferences: ${preferences || 'None specified'}

For each itinerary:
1. Suggest a logical order of visits
2. Recommend optimal time to spend at each location
3. Include suggestions for nearby must-visit attractions
4. Consider driving time and minimize backtracking

Format your response as a JSON array with 3 itinerary objects. Each should have:
- title: A catchy name for the itinerary
- description: Brief overview
- days: Array of day objects with { dayNumber, places: Array of { placeId, name, suggestedDuration, timeSlot, nearbyRecommendations } }

Keep it concise and practical. ONLY respond with valid JSON, no other text.`;

    let itineraries;

    // Use Ollama or OpenAI based on configuration
    if (AI_PROVIDER === 'ollama' && ollamaClient) {
      try {
        const response = await ollamaClient.generate({
          model: process.env.OLLAMA_MODEL || 'llama2',
          prompt: prompt,
          stream: false,
        });

        const responseText = response.response;
        
        try {
          // Try to parse JSON from the response
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          itineraries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (parseError) {
          console.error('Error parsing Ollama response:', parseError);
          itineraries = createFallbackItineraries(places);
        }
      } catch (error) {
        console.error('Ollama error:', error);
        itineraries = createFallbackItineraries(places);
      }
    } else if (AI_PROVIDER === 'openai' && openaiClient) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 2000,
        });

        const responseText = completion.choices[0].message.content;

        try {
          // Try to parse JSON from the response
          const jsonMatch = responseText?.match(/\[[\s\S]*\]/);
          itineraries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          itineraries = createFallbackItineraries(places);
        }
      } catch (error) {
        console.error('OpenAI error:', error);
        itineraries = createFallbackItineraries(places);
      }
    } else {
      // No AI provider configured, use fallback
      console.warn('No AI provider configured, using fallback itineraries');
      itineraries = createFallbackItineraries(places);
    }

    res.json({ itineraries });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// Helper function to create fallback itineraries when AI is unavailable
function createFallbackItineraries(places: Place[]) {
  // Simple mock data for highlights, cost, distance, and time
  const highlightsList = [
    'Iconic landmark',
    'Scenic viewpoint',
    'Local cuisine',
    'Historic site',
    'Nature walk',
    'Cultural experience',
    'Shopping district',
    'Beach access',
    'Family friendly',
    'Adventure spot',
  ];
  function enrichPlace(p: Place, i: number, mode: 'classic' | 'relaxed' | 'express') {
    return {
      placeId: p.placeId,
      name: p.name,
      address: p.address,
      highlights: highlightsList[i % highlightsList.length],
      estimatedCost: 200 + 100 * (i % 3),
      distance: `${(20 + 10 * i).toFixed(1)} km`,
      estimatedTime:
        mode === 'classic'
          ? '2-3 hours'
          : mode === 'relaxed'
          ? '3-4 hours'
          : '1-2 hours',
      suggestedDuration:
        mode === 'classic'
          ? '2-3 hours'
          : mode === 'relaxed'
          ? '3-4 hours'
          : '1-2 hours',
      timeSlot:
        mode === 'classic'
          ? 'Morning'
          : mode === 'relaxed'
          ? 'Full Day'
          : 'Afternoon',
      nearbyRecommendations: [],
    };
  }
  return [
    {
      title: 'Classic Route',
      description: 'Visit all locations in the order provided',
      days: [
        {
          dayNumber: 1,
          places: places.map((p: Place, i: number) => enrichPlace(p, i, 'classic')),
        },
      ],
    },
    {
      title: 'Relaxed Tour',
      description: 'Take your time at each location with extended breaks',
      days: [
        {
          dayNumber: 1,
          places: places.slice(0, Math.ceil(places.length / 2)).map((p: Place, i: number) => enrichPlace(p, i, 'relaxed')),
        },
      ],
    },
    {
      title: 'Efficient Express',
      description: 'Quick visits to maximize coverage',
      days: [
        {
          dayNumber: 1,
          places: places.map((p: Place, i: number) => enrichPlace(p, i, 'express')),
        },
      ],
    },
  ];
}

// Get recommendations for nearby attractions
router.post('/recommendations', async (req, res) => {
  try {
    const { place } = req.body as { place: Place };

    if (!place || !place.location) {
      return res.status(400).json({ error: 'Place with location is required' });
    }

    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) {
      console.warn('OPENTRIPMAP_API_KEY not configured - using IP-based rate limiting (100 req/day)');
    }

    const lat = place.location.lat;
    const lon = place.location.lng;

    // OpenTripMap attractions
    const radius = 3000;
    const base = 'https://api.opentripmap.com/0.1/en/places/radius';
    
    const buildParams = (rad: number, kinds: string, limit: number) => {
      const params: any = { radius: rad, lon, lat, kinds, limit };
      if (apiKey) params.apikey = apiKey;
      return params;
    };
    
    const [attrResp, foodResp] = await Promise.all([
      axios.get(base, {
        params: buildParams(radius, 'interesting_places,tourist_facilities', 10),
      }),
      axios.get(base, {
        params: buildParams(2000, 'foods,restaurants', 6),
      }),
    ]);

    const mapFeature = (f: any, category: string) => {
      const props = f.properties || f;
      const pt = f.geometry?.coordinates || [props.lon, props.lat];
      return {
        placeId: props.xid || `${props.name}-${pt[1]},${pt[0]}`,
        name: props.name,
        address: props.name,
        location: { lat: pt[1], lng: pt[0] },
        rating: undefined,
        types: props.kinds ? props.kinds.split(',') : [],
        category,
      };
    };

    const attractions = (attrResp.data.features || []).slice(0, 6).map((f: any) => mapFeature(f, 'attraction'));
    const restaurants = (foodResp.data.features || []).slice(0, 6).map((f: any) => mapFeature(f, 'restaurant'));

    res.json({ recommendations: [...attractions, ...restaurants] });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
