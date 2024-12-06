import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { Car, Clock, PoundSterling } from 'lucide-react';

interface ParkingMarkerProps {
  position: [number, number];
  name: string;
  type: string;
  capacity?: number;
  restrictions?: string[];
}

const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'underground':
      return '#4C51BF';
    case 'multi-storey':
      return '#2B6CB0';
    case 'surface':
      return '#2F855A';
    case 'street':
      return '#D97706'; // Amber color for street parking
    default:
      return '#4A5568';
  }
};

const getMarkerIcon = (type: string): string => {
  return type === 'street' ? '🅿️' : 'P';
};

export function ParkingMarker({ position, name, type, capacity, restrictions }: ParkingMarkerProps) {
  const color = getMarkerColor(type);
  const icon = getMarkerIcon(type);
  
  const customIcon = new DivIcon({
    className: 'custom-parking-marker',
    html: `<div style="
      background-color: ${color};
      width: ${type === 'street' ? '24px' : '32px'};
      height: ${type === 'street' ? '24px' : '32px'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${type === 'street' ? '12px' : '14px'};
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">${icon}</div>`,
    iconSize: type === 'street' ? [24, 24] : [32, 32],
    iconAnchor: type === 'street' ? [12, 12] : [16, 16],
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>Type: {type.charAt(0).toUpperCase() + type.slice(1)}</p>
            {capacity && <p>Capacity: {capacity} spaces</p>}
            {restrictions && restrictions.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Restrictions:</p>
                <ul className="list-disc list-inside">
                  {restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}