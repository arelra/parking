import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { PostcodeForm } from './components/PostcodeForm';
import { Map } from './components/Map';
import { getCoordinates } from './utils/postcode';

function App() {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePostcodeSubmit = async (postcode: string) => {
    try {
      setLoading(true);
      setError('');
      const coords = await getCoordinates(postcode);
      setCoordinates(coords);
    } catch (err) {
      setError('Could not find location for this postcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">UK Postcode Map</h1>
          </div>
          <p className="text-gray-600">Enter a UK postcode to view its location on the map</p>
        </div>

        <div className="flex justify-center">
          <PostcodeForm onSubmit={handlePostcodeSubmit} />
        </div>

        {loading && (
          <div className="text-center text-gray-600">Loading map...</div>
        )}

        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}

        {coordinates && !loading && (
          <Map center={coordinates} />
        )}
      </div>
    </div>
  );
}

export default App;