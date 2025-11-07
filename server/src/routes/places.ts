import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Helper to standardize place object
function makePlace(item: any) {
  const lat = item.geometry?.lat ?? item.point?.lat ?? item.lat;
  const lng = item.geometry?.lng ?? item.point?.lon ?? item.lng;
  const id =
    item.place_id || item.xid || `${item.formatted || item.name}-${lat},${lng}`;
  return {
    placeId: id,
    name: item.name || item.components?.attraction || item.formatted || 'Place',
    address: item.formatted || item.address || item.display_name || '',
    location: { lat, lng },
    rating: undefined,
    photos: [],
    types: item.kinds ? item.kinds.split(',') : [],
  };
}

// Search for places using OpenCage Geocoding
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) {
      console.error('OPENCAGE_API_KEY not configured');
      return res.status(503).json({ 
        error: 'Search service not configured. Please add OPENCAGE_API_KEY to server/.env',
        results: []
      });
    }

    const response = await axios.get(
      'https://api.opencagedata.com/geocode/v1/json',
      {
        params: {
          q: query as string,
          key: apiKey,
          limit: 10,
        },
      }
    );

    const results = (response.data.results || []).map((r: any) =>
      makePlace({
        place_id: r.annotations?.what3words?.words || r.timestamp?.created_http,
        name: r.components?.tourism || r.components?.attraction || r.components?.road || r.components?.city || r.formatted,
        formatted: r.formatted,
        geometry: { lat: r.geometry.lat, lng: r.geometry.lng },
      })
    );

    res.json({ results });
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// Minimal details endpoint (returns the id and echoes basic data if needed)
router.get('/details/:placeId', async (req, res) => {
  try {
    // Without a unified place database, return minimal structure.
    const { placeId } = req.params;
    return res.json({ placeId, name: 'Place', address: '', location: null });
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Nearby places using OpenTripMap
router.get('/nearby', async (req, res) => {
  try {
    const { location, radius = 5000, type } = req.query;
    if (!location)
      return res.status(400).json({ error: 'Location parameter is required' });

    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) {
      console.warn('OPENTRIPMAP_API_KEY not configured - using IP-based rate limiting (100 req/day)');
    }

    const [latStr, lngStr] = (location as string).split(',');
    const lat = parseFloat(latStr);
    const lon = parseFloat(lngStr);

    // Determine kinds
    const kinds = type ? (type as string) : 'interesting_places,tourist_facilities';

    const url = 'https://api.opentripmap.com/0.1/en/places/radius';
    const params: any = {
      radius: parseInt(radius as string),
      lon,
      lat,
      kinds,
      limit: 20,
    };
    
    // Add apikey only if configured
    if (apiKey) {
      params.apikey = apiKey;
    }

    const resp = await axios.get(url, { params });

    const results = (resp.data.features || resp.data || [])
      .map((f: any) => {
        const props = f.properties || f;
        const pt = f.geometry?.coordinates || [props.lon, props.lat];
        return makePlace({
          xid: props.xid,
          name: props.name,
          formatted: props.name,
          point: { lat: pt[1], lon: pt[0] },
          kinds: props.kinds,
        });
      })
      .filter((p: any) => p.name);

    res.json({ results });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
});

export default router;
