import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, Thermometer, Eye, Wind, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSkills } from '@/hooks/useSkills';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
  feelsLike: number;
}

export function WeatherSkill() {
  const { getWeather, preferences, updatePreferences } = useSkills();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load weather for default location if set
    if (preferences.weather_location) {
      loadWeather(preferences.weather_location);
    }
  }, [preferences.weather_location]);

  const loadWeather = async (weatherLocation?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWeather(weatherLocation);
      if (data) {
        setWeather(data);
      } else {
        setError('Failed to load weather data');
      }
    } catch (err) {
      setError('Weather service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    await loadWeather(location.trim());
  };

  const handleSetDefault = async () => {
    if (weather?.location) {
      await updatePreferences({ weather_location: weather.location });
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    // Simple weather icon mapping
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Cloud className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Weather</h3>
            <p className="text-muted-foreground text-sm">Current conditions and forecast</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card className="glass-panel p-4">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city name or 'current' for your location"
            className="glass-panel flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Get Weather'}
          </Button>
        </form>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="glass-panel p-4 border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Weather Display */}
      {weather && (
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <h4 className="text-lg font-medium">{weather.location}</h4>
            </div>
            {weather.location !== preferences.weather_location && (
              <Button onClick={handleSetDefault} variant="outline" size="sm">
                Set as Default
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Main Weather Info */}
            <div className="text-center space-y-2">
              <div className="text-6xl">{getWeatherIcon(weather.icon)}</div>
              <div className="text-4xl font-light">{Math.round(weather.temperature)}°</div>
              <div className="text-muted-foreground capitalize">{weather.description}</div>
              <div className="text-sm text-muted-foreground">
                Feels like {Math.round(weather.feelsLike)}°
              </div>
            </div>

            {/* Weather Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Droplets className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Humidity</div>
                  <div className="font-medium">{weather.humidity}%</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Wind className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Wind Speed</div>
                  <div className="font-medium">{weather.windSpeed} mph</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Visibility</div>
                  <div className="font-medium">{weather.visibility} miles</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No Weather Data */}
      {!weather && !loading && !error && (
        <Card className="glass-panel p-8 text-center">
          <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No weather data</p>
          <p className="text-sm text-muted-foreground mt-1">
            Search for a location to see current conditions
          </p>
        </Card>
      )}
    </div>
  );
}