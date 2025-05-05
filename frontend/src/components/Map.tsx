import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Marker, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Search } from 'lucide-react';
import area from '@turf/area';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Business } from '../types';

interface MapProps {
  onAreaSelect: (area: number, bounds: any) => void;
  businesses?: Business[];
  selectedBusiness?: Business | null;
}

function SearchControl() {
  const map = useMap();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery + ', Sri Lanka'
          )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsSearching(false);
  };

  const handleResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    map.setView([lat, lon], 15);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
      <div className="leaflet-top leaflet-left mt-1 ml-20">
        <div className="leaflet-control leaflet-bar bg-white shadow-lg rounded-lg p-2">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSearching}
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-md shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                    <button
                        key={result.place_id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      {result.display_name}
                    </button>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}

function BusinessMarkers({
                           businesses,
                           selectedBusiness
                         }: {
  businesses: Business[];
  selectedBusiness?: Business | null;
}) {
  const map = useMap();

  // Function to create custom icon for markers
  const createCustomIcon = (isSelected: boolean) => {
    return (window as any).L.divIcon({
      html: `<div class="${isSelected ? 'bg-blue-500' : 'bg-red-500'} p-1 rounded-full">
               <div class="h-3 w-3 rounded-full ${isSelected ? 'bg-white' : 'bg-red-200'}"></div>
             </div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  useEffect(() => {
    // If there's a selected business, center the map on it
    if (selectedBusiness) {
      map.setView(
          [selectedBusiness.location.lat, selectedBusiness.location.lon],
          16
      );
    }
  }, [selectedBusiness, map]);

  return (
      <>
        {businesses.map((business) => (
            <Marker
                key={business.id}
                position={[business.location.lat, business.location.lon]}
                icon={createCustomIcon(selectedBusiness?.id === business.id)}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-lg">{business.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {business.type.charAt(0).toUpperCase() + business.type.slice(1)}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{business.address}</p>
                </div>
              </Popup>
            </Marker>
        ))}
      </>
  );
}

export default function Map({ onAreaSelect, businesses = [], selectedBusiness }: MapProps) {
  const featureGroupRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet icons
    delete (window as any).L.Icon.Default.prototype._getIconUrl;
    (window as any).L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    const calculatedArea = area(geoJson);

    // Get the bounds of the drawn shape
    const bounds = layer.getBounds();

    // Pass both area and bounds to the parent component
    onAreaSelect(calculatedArea / 1000000, bounds); // Convert to square kilometers
  };

  return (
      <MapContainer
          center={[7.8731, 80.7718]} // Center of Sri Lanka
          zoom={8}
          className="h-[500px] w-full rounded-lg shadow-lg"
      >
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <SearchControl />

        {businesses.length > 0 && (
            <BusinessMarkers
                businesses={businesses}
                selectedBusiness={selectedBusiness}
            />
        )}

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
              position="topright"
              onCreated={handleCreated}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
          />
        </FeatureGroup>
      </MapContainer>
  );
}