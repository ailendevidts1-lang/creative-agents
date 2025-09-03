import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      throw new Error('Location is required');
    }

    // Use OpenWeatherMap API (free tier)
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      throw new Error('Weather API key not configured');
    }

    let weatherUrl: string;
    
    if (location.toLowerCase() === 'current') {
      // Use IP geolocation for current location (simplified)
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=San Francisco&appid=${apiKey}&units=imperial`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=imperial`;
    }

    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error('Weather service unavailable');
    }

    const data = await response.json();

    // Format the weather data
    const weatherData = {
      location: `${data.name}, ${data.sys.country}`,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      visibility: data.visibility ? Math.round(data.visibility * 0.000621371) : 10, // Convert meters to miles
      icon: data.weather[0].icon
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-weather function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to get weather data' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});