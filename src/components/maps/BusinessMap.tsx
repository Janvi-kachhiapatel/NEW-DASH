"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Filter, Search, Navigation, Star, Phone, Globe, ChevronDown, X, Layers, Target, Navigation as Compass } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  location_lat: number;
  location_lng: number;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  review_count: number;
  price_range: string;
  is_verified: boolean;
  is_featured: boolean;
  logo_url?: string;
  cover_image_url?: string;
  operating_hours?: any;
  distance?: number;
  offers?: Array<{
    id: string;
    title: string;
    discount_percent: number;
  }>;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface BusinessMapProps {
  businesses: Business[];
  userLocation?: { lat: number; lng: number };
  onBusinessSelect?: (business: Business) => void;
  height?: string;
  className?: string;
}

export default function BusinessMap({ 
  businesses, 
  userLocation, 
  onBusinessSelect, 
  height = '500px',
  className = '' 
}: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [customLocation, setCustomLocation] = useState({ lat: '', lng: '' });
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    rating: 0,
    priceRange: 'All',
    verified: false,
    offers: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState('roadmap');
  const [isLoading, setIsLoading] = useState(true);
  const [userMarker, setUserMarker] = useState<any>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Categories for filtering
  const categories = [
    'All', 'Restaurant', 'Shopping', 'Healthcare', 'Beauty', 'Fitness', 
    'Education', 'Entertainment', 'Automotive', 'Professional', 'Home', 'Other'
  ];

  // Price ranges (displayed in ₹ but compatible with existing $-based data)
  const priceRanges = [
    { label: 'All', value: 'All' },
    { label: '₹', value: '$' },
    { label: '₹₹', value: '$$' },
    { label: '₹₹₹', value: '$$$' },
    { label: '₹₹₹₹', value: '$$$$' }
  ];

  // Initialize map (using Leaflet as it's already in package.json)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || isMapInitialized) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        // Dynamic import for Leaflet with timeout
        const L = await Promise.race([
          import('leaflet'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Map loading timeout')), 5000))
        ]) as any;
        
        // Fix Leaflet default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Check if container is already initialized
        if (mapInstanceRef.current) {
          console.log('Map already initialized, skipping...');
          setIsLoading(false);
          return;
        }

        // Center map on user location or first business
        const center = userLocation 
          ? [userLocation.lat, userLocation.lng]
          : businesses.length > 0 
            ? [businesses[0].location_lat, businesses[0].location_lng]
            : [20.5937, 78.9629]; // Default to India center

        const leafletMap = L.map(mapRef.current, {
          center,
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        // Add tile layer with caching
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          className: 'map-tiles'
        }).addTo(leafletMap);

        // Add attribution separately
        leafletMap.attributionControl.setPrefix('<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');

        // Add user location marker
        if (userLocation) {
          const userIcon = L.divIcon({
            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
            className: 'user-location-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const userMarkerInstance = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(leafletMap)
            .bindPopup('Your Location');
          
          setUserMarker(userMarkerInstance);
        }

        mapInstanceRef.current = leafletMap;
        setMap(leafletMap);
        setIsMapInitialized(true);
        setIsLoading(false);

        console.log('Map initialized successfully');

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setIsLoading(false);
        // Show error message to user
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
              <div class="text-center p-4">
                <div class="text-red-500 mb-2">⚠️</div>
                <p class="text-gray-600 dark:text-gray-400">Unable to load map</p>
                <button onclick="window.location.reload()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
              </div>
            </div>
          `;
        }
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, [userLocation, businesses.length]); // Reduced dependencies for better performance

  // Helper to filter businesses based on current filters & search
  const getFilteredBusinesses = () => {
    return businesses.filter(business => {
      if (filters.category !== 'All' && business.category !== filters.category) return false;
      if (filters.rating > 0 && business.rating < filters.rating) return false;
      if (filters.priceRange !== 'All' && business.price_range !== filters.priceRange) return false;
      if (filters.verified && !business.is_verified) return false;
      if (filters.offers && (!business.offers || business.offers.length === 0)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return business.name.toLowerCase().includes(query) ||
               business.category.toLowerCase().includes(query) ||
               business.address.toLowerCase().includes(query);
      }
      return true;
    });
  };

  const filteredBusinesses = getFilteredBusinesses();

  // Update markers when businesses or filters change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    setMarkers([]);

    // Create custom icons for different business types
    const createCustomIcon = (business: Business) => {
      const L = require('leaflet');
      
      const colors = {
        'Restaurant': '#ef4444',
        'Shopping': '#3b82f6', 
        'Healthcare': '#10b981',
        'Beauty': '#ec4899',
        'Fitness': '#f59e0b',
        'Education': '#8b5cf6',
        'Entertainment': '#06b6d4',
        'Automotive': '#6b7280',
        'Professional': '#84cc16',
        'Home': '#f97316',
        'Other': '#64748b'
      };

      const color = colors[business.category as keyof typeof colors] || '#64748b';
      
      return L.divIcon({
        html: `
          <div class="relative">
            <div class="w-8 h-8 bg-white rounded-full shadow-lg border-2 border-${color} flex items-center justify-center">
              ${business.is_featured 
                ? `<div class="w-6 h-6 bg-${color} rounded-full flex items-center justify-center">
                     <span class="text-white text-xs font-bold">${business.name.charAt(0)}</span>
                   </div>`
                : `<div class="w-6 h-6 bg-${color} rounded-full flex items-center justify-center">
                     <span class="text-white text-xs font-bold">${business.name.charAt(0)}</span>
                   </div>`
              }
            </div>
            ${business.offers && business.offers.length > 0 
              ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>`
              : ''
            }
          </div>
        `,
        className: 'custom-business-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    };

    // Add markers for filtered businesses
    const newMarkers = filteredBusinesses.map(business => {
      const marker = require('leaflet').marker(
        [business.location_lat, business.location_lng],
        { icon: createCustomIcon(business) }
      );

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <div class="flex items-center gap-2 mb-2">
            ${business.logo_url 
              ? `<img src="${business.logo_url}" alt="${business.name}" class="w-8 h-8 rounded-full object-cover">`
              : `<div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                   <span class="text-xs font-bold">${business.name.charAt(0)}</span>
                 </div>`
            }
            <div class="flex-1">
              <h3 class="font-semibold text-sm">${business.name}</h3>
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-600">${business.category}</span>
                ${business.is_verified 
                  ? '<span class="text-xs bg-blue-100 text-blue-600 px-1 rounded">Verified</span>' 
                  : ''
                }
              </div>
            </div>
          </div>
          
          <div class="text-xs text-gray-600 mb-2">${business.address}</div>
          
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1">
              <span class="text-yellow-500">★</span>
              <span class="text-sm font-medium">${business.rating}</span>
              <span class="text-xs text-gray-500">(${business.review_count})</span>
            </div>
            <span class="text-xs text-gray-600">${business.price_range}</span>
          </div>
          
          ${business.offers && business.offers.length > 0 
            ? `<div class="bg-red-50 text-red-600 text-xs p-2 rounded mb-2">
                 🔥 ${business.offers[0].title}
               </div>`
            : ''
          }
          
          <div class="flex gap-2">
            <button onclick="window.selectBusiness('${business.id}')" 
                    class="flex-1 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">
              View Details
            </button>
            ${business.phone 
              ? `<button onclick="window.callBusiness('${business.phone}')" 
                      class="bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700">
                   Call
                 </button>`
              : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        setSelectedBusiness(business);
        onBusinessSelect?.(business);
      });

      marker.addTo(map);
      return marker;
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const group = new (require('leaflet')).featureGroup(newMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [map, businesses, filters, searchQuery, onBusinessSelect]);

  // Handle business selection from outside component
  useEffect(() => {
    (window as any).selectBusiness = (businessId: string) => {
      const business = businesses.find(b => b.id === businessId);
      if (business) {
        setSelectedBusiness(business);
        onBusinessSelect?.(business);
      }
    };

    (window as any).callBusiness = (phone: string) => {
      window.open(`tel:${phone}`);
    };

    return () => {
      delete (window as any).selectBusiness;
      delete (window as any).callBusiness;
    };
  }, [businesses, onBusinessSelect]);

  // Handle map controls
  const handleLocateMe = useCallback(() => {
    if (!map || !userLocation) return;

    map.setView([userLocation.lat, userLocation.lng], 15);
    
    // Pulse user marker
    if (userMarker) {
      userMarker.openPopup();
      setTimeout(() => userMarker.closePopup(), 2000);
    }
  }, [map, userLocation, userMarker]);

  const handleAddCustomLocation = () => {
    const lat = parseFloat(customLocation.lat);
    const lng = parseFloat(customLocation.lng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180)');
      return;
    }

    setIsAddingLocation(true);
    
    // Add marker for custom location
    const L = require('leaflet');
    const customIcon = L.divIcon({
      html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
               <span class="text-white text-xs font-bold">📍</span>
             </div>`,
      className: 'custom-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`Custom Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    setMarkers(prev => [...prev, marker]);
    map.setView([lat, lng], 15);
    
    // Reset form
    setCustomLocation({ lat: '', lng: '' });
    setShowLocationInput(false);
    setIsAddingLocation(false);
  };

  const handleMapClick = (e: any) => {
    if (!map || !isAddingLocation) return;
    
    const { lat, lng } = e.latlng;
    
    // Add marker at clicked location
    const L = require('leaflet');
    const clickIcon = L.divIcon({
      html: `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
               <span class="text-white text-xs font-bold">✓</span>
             </div>`,
      className: 'click-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { icon: clickIcon })
      .addTo(map)
      .bindPopup(`Selected Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    setMarkers(prev => [...prev, marker]);
    setCustomLocation({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
    setIsAddingLocation(false);
  };

  // Add map click handler when in adding location mode
  useEffect(() => {
    if (map && isAddingLocation) {
      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [map, isAddingLocation]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      rating: 0,
      priceRange: 'All',
      verified: false,
      offers: false
    });
    setSearchQuery('');
  };

  // When selecting a business from the list within filters
  const handleSelectFromList = (business: Business) => {
    if (map) {
      map.setView([business.location_lat, business.location_lng], 15);
    }
    setSelectedBusiness(business);
    onBusinessSelect?.(business);
  };

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowLocationInput(!showLocationInput)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showLocationInput || isAddingLocation
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <MapPin size={20} />
              {isAddingLocation ? 'Click on Map' : 'Add Location'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                Object.values(filters).some(v => v !== 0 && v !== 'All' && v !== false) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter size={20} />
              Filters
              {Object.values(filters).some(v => v !== 0 && v !== 'All' && v !== false) && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={handleLocateMe}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Show my location"
            >
              <Target size={20} />
            </button>
          </div>

          {/* Location Input Panel */}
          {showLocationInput && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Add Custom Location
              </h4>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 23.0225"
                    value={customLocation.lat}
                    onChange={(e) => setCustomLocation(prev => ({ ...prev, lat: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 72.5714"
                    value={customLocation.lng}
                    onChange={(e) => setCustomLocation(prev => ({ ...prev, lng: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustomLocation}
                  disabled={!customLocation.lat || !customLocation.lng}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Location
                </button>
                <button
                  onClick={() => {
                    setIsAddingLocation(true);
                    setShowLocationInput(false);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Click on Map
                </button>
                <button
                  onClick={() => {
                    setShowLocationInput(false);
                    setIsAddingLocation(false);
                    setCustomLocation({ lat: '', lng: '' });
                  }}
                  className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
              {isAddingLocation && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Click anywhere on the map to add a location marker
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price Range (₹)
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Additional Filters */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    More Filters
                  </label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => handleFilterChange('verified', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      Verified Only
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.offers}
                        onChange={(e) => handleFilterChange('offers', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      Has Offers
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredBusinesses.length} businesses found
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear Filters
                </button>
              </div>
              
              {/* Filtered businesses list */}
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                {filteredBusinesses.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No shops match these filters yet.
                  </p>
                ) : (
                  filteredBusinesses.map((business) => (
                    <button
                      key={business.id}
                      type="button"
                      onClick={() => handleSelectFromList(business)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          {business.category} • {business.price_range} • ⭐ {business.rating}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {business.distance ? `${business.distance.toFixed(1)} km` : ''}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Style Toggle */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
          <button
            onClick={() => setMapStyle(mapStyle === 'roadmap' ? 'satellite' : 'roadmap')}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle map style"
          >
            <Layers size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Selected Business Details */}
      {selectedBusiness && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedBusiness.logo_url ? (
                  <img
                    src={selectedBusiness.logo_url}
                    alt={selectedBusiness.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 dark:text-gray-400 font-bold">
                    {selectedBusiness.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {selectedBusiness.name}
                  </h3>
                  {selectedBusiness.is_verified && (
                    <Star size={16} className="text-blue-500 fill-blue-500" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedBusiness.address}
                </p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{selectedBusiness.rating}</span>
                    <span className="text-gray-500">({selectedBusiness.review_count})</span>
                  </div>
                  <span className="text-gray-500">{selectedBusiness.price_range}</span>
                  <span className="text-gray-500">{selectedBusiness.category}</span>
                </div>

                {selectedBusiness.offers && selectedBusiness.offers.length > 0 && (
                  <div className="mt-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-2 rounded">
                    🔥 {selectedBusiness.offers[0].title}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedBusiness(null)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => window.open(`tel:${selectedBusiness.phone}`)}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                Call
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${selectedBusiness.phone?.replace(/[^0-9]/g, '')}`)}
                className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                WhatsApp
              </button>
              <button
                onClick={() => window.open(`/${selectedBusiness.slug}`)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
