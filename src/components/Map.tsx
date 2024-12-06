import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { ParkingMarker } from './ParkingMarker';
import { fetchNearbyParking } from '../utils/parking';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapProps {
  center: [number, number];
}

export function Map({ center }: MapProps) {
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadParkingSpaces = async () => {
      try {
        setLoading(true);
        const spaces = await fetchNearbyParking(center[0], center[1]);
        setParkingSpaces(spaces);
      } catch (error) {
        console.error('Failed to load parking spaces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParkingSpaces();
  }, [center]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={defaultIcon} />
        
        {/* Search radius indicator */}
        <CircleMarker
          center={center}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1 }}
          radius={100}
        />

        {parkingSpaces.map((space) => (
          <ParkingMarker
            key={space.id}
            position={[space.lat, space.lon]}
            name={space.name}
            type={space.type}
            capacity={space.capacity}
            restrictions={space.restrictions}
          />
        ))}
      </MapContainer>
      
      {loading && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-md shadow-md">
          Loading parking spaces...
        </div>
      )}
    </div>
  );
}