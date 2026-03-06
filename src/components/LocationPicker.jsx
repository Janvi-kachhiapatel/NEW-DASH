"use client";
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function LocationPicker({ onLocationSelect, initialLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [location, setLocation] = useState(initialLocation || { lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeMap = async () => {
      // Dynamically import Leaflet only on client side
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Fix Leaflet's default icon issue with webpack
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        const map = L.map(mapRef.current).setView([location.lat, location.lng], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add click listener to map
        map.on('click', (e) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          updateLocation(lat, lng);
        });

        // Add initial marker if location exists
        if (location.lat !== 28.6139 || location.lng !== 77.2090) {
          updateLocation(location.lat, location.lng);
        }
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  const updateLocation = async (lat, lng) => {
    if (!isClient) return;
    
    const L = (await import('leaflet')).default;
    
    const newLocation = { lat, lng };
    setLocation(newLocation);
    
    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        draggable: true,
      }).addTo(mapInstanceRef.current);

      markerRef.current.on('dragend', async (e) => {
        const lat = e.target.getLatLng().lat;
        const lng = e.target.getLatLng().lng;
        updateLocation(lat, lng);
      });
    }

    // Reverse geocoding using Nominatim (free)
    await reverseGeocode(lat, lng);

    // Notify parent component
    onLocationSelect(newLocation);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BizGallery App' // Be a good citizen
          }
        }
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'BizGallery App'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Center map on new location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        await updateLocation(lat, lng);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
          }
          await updateLocation(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your current location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  // Show loading state while initializing on client side
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <MapPin size={16} />
          Select Shop Location (Loading map...)
        </div>
        <div className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <MapPin size={16} />
        Select Shop Location (Click on map or search)
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📍
        </button>
      </form>
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700"
      />
      
      {/* Address Display */}
      {address && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">{address}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      {/* Instructions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>💡 Tip: You can drag the marker to adjust the exact location</p>
        <p>🔍 Search for any address or place name</p>
        <p>📍 Click the location button to use your current location</p>
      </div>
    </div>
  );
}
