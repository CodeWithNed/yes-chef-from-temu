import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './components/Map';
import BusinessList from './components/BusinessList';
import BusinessDetails from './components/BusinessDetails';
import ProposalGenerator from './components/ProposalGenerator';
import Sidebar from './components/Sidebar';
import { Business } from './types';

function App() {
  const [selectedArea, setSelectedArea] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Store businesses in localStorage whenever they change
  useEffect(() => {
    if (businesses.length > 0) {
      localStorage.setItem('businesses', JSON.stringify(businesses));
    }
  }, [businesses]);

  const handleAreaSelect = async (area: number, bounds: any) => {
    setSelectedArea(area);
    setLoading(true);

    try {
      // Fetch restaurants and hotels in the selected area using detailed parameters
      // Using more detailed amenity parameters to get better restaurant results
      const restaurantsPromise = fetch(
          `https://overpass-api.de/api/interpreter?data=[out:json];
        (
          node["amenity"="restaurant"]["name"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          node["amenity"="cafe"]["name"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          node["amenity"="fast_food"]["name"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          node["tourism"="hotel"]["name"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        );
        out body;`
      );

      const response = await restaurantsPromise;

      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();

      // Transform the data to match our Business type
      const businessData = data.elements.map((item: any) => {
        // Determine the type based on the amenity tag
        let type = 'restaurant';
        if (item.tags.amenity === 'cafe') type = 'cafe';
        if (item.tags.amenity === 'fast_food') type = 'fast_food';
        if (item.tags.tourism === 'hotel') type = 'hotel';

        // Construct an address from available tags
        let address = '';
        if (item.tags.name) address = item.tags.name;
        if (item.tags['addr:street']) {
          address += address ? ', ' + item.tags['addr:street'] : item.tags['addr:street'];
        }
        if (item.tags['addr:city']) {
          address += address ? ', ' + item.tags['addr:city'] : item.tags['addr:city'];
        }

        return {
          id: item.id.toString(),
          name: item.tags.name || 'Unnamed Business',
          type: type,
          address: address || 'No address available',
          location: {
            lat: item.lat,
            lon: item.lon
          }
        };
      });

      // Filter out businesses without names
      const validBusinesses = businessData.filter(
          (business: Business) => business.name !== 'Unnamed Business'
      );

      setBusinesses(validBusinesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      alert('Failed to fetch businesses in this area. Try a smaller region or different location.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    // Also store the selected business in localStorage for the proposal generator
    localStorage.setItem('selectedBusiness', JSON.stringify(business));
  };

  return (
      <Router>
        <div className="flex">
          <Sidebar />

          <div className="flex-1 min-h-screen bg-gray-100 p-6">
            <Routes>
              <Route
                  path="/"
                  element={
                    <div className="max-w-7xl mx-auto space-y-6">
                      <header className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <MapPin className="h-8 w-8 text-blue-600" />
                          <h1 className="text-3xl font-bold text-gray-900">Business Finder</h1>
                        </div>
                        <p className="text-gray-600">
                          Select an area on the map to find restaurants and hotels
                        </p>
                      </header>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Map
                              onAreaSelect={handleAreaSelect}
                              businesses={businesses}
                              selectedBusiness={selectedBusiness}
                          />
                        </div>
                        <div>
                          <BusinessList
                              businesses={businesses}
                              loading={loading}
                              selectedArea={selectedArea}
                              onSelectBusiness={handleSelectBusiness}
                          />
                        </div>
                      </div>
                    </div>
                  }
              />
              <Route
                  path="/business/:id"
                  element={<BusinessDetails />}
              />
              <Route
                  path="/generate-proposal/:id"
                  element={<ProposalGenerator />}
              />
            </Routes>
          </div>
        </div>
      </Router>
  );
}

export default App;