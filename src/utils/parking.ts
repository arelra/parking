interface ParkingSpace {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  capacity?: number;
  type: 'surface' | 'underground' | 'multi-storey' | 'street' | 'unknown';
  restrictions?: string[];
}

export async function fetchNearbyParking(lat: number, lon: number, radius: number = 1000): Promise<ParkingSpace[]> {
  const query = `
    [out:json][timeout:25];
    (
      // Regular parking facilities
      way["amenity"="parking"](around:${radius},${lat},${lon});
      relation["amenity"="parking"](around:${radius},${lat},${lon});
      
      // Street parking
      way["parking:lane"](around:${radius},${lat},${lon});
      way["parking:lane:both"](around:${radius},${lat},${lon});
      way["parking:lane:right"](around:${radius},${lat},${lon});
      way["parking:lane:left"](around:${radius},${lat},${lon});
      way["parking:condition"](around:${radius},${lat},${lon});
      way["parking:lane:both:parallel"](around:${radius},${lat},${lon});
      way["parking:lane:both:diagonal"](around:${radius},${lat},${lon});
      way["parking:lane:both:perpendicular"](around:${radius},${lat},${lon});
    );
    out body geom;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch parking data');
  }

  const data = await response.json();
  const parkingSpaces: ParkingSpace[] = [];
  
  data.elements.forEach((element: any) => {
    const isStreetParking = hasStreetParkingTags(element.tags);
    
    if (element.type === 'way' && element.geometry) {
      // For street parking, create multiple markers along the street
      if (isStreetParking) {
        // Take points at regular intervals along the street
        const points = element.geometry;
        const interval = Math.max(1, Math.floor(points.length / 3)); // Show 3 markers per street segment
        
        for (let i = 0; i < points.length; i += interval) {
          parkingSpaces.push({
            id: element.id * 1000 + i, // Create unique IDs for each point
            lat: points[i].lat,
            lon: points[i].lon,
            name: getLocationName(element.tags, true),
            type: 'street',
            restrictions: getRestrictions(element.tags)
          });
        }
      } else {
        // For regular parking, use the center point
        const centerPoint = getCenterPoint(element.geometry);
        parkingSpaces.push({
          id: element.id,
          lat: centerPoint[0],
          lon: centerPoint[1],
          name: getLocationName(element.tags, false),
          capacity: element.tags?.capacity ? parseInt(element.tags.capacity) : undefined,
          type: getParkingType(element.tags?.parking || 'surface'),
          restrictions: getRestrictions(element.tags)
        });
      }
    }
  });

  return parkingSpaces;
}

function hasStreetParkingTags(tags: any): boolean {
  return !!(
    tags['parking:lane'] ||
    tags['parking:lane:both'] ||
    tags['parking:lane:right'] ||
    tags['parking:lane:left'] ||
    tags['parking:condition'] ||
    tags['parking:lane:both:parallel'] ||
    tags['parking:lane:both:diagonal'] ||
    tags['parking:lane:both:perpendicular']
  );
}

function getCenterPoint(geometry: any[]): [number, number] {
  const midPoint = Math.floor(geometry.length / 2);
  return [geometry[midPoint].lat, geometry[midPoint].lon];
}

function getLocationName(tags: any, isStreetParking: boolean): string {
  if (tags?.name) return tags.name;
  if (isStreetParking) {
    const streetName = tags?.['addr:street'] || tags?.highway || 'Street';
    const parkingType = getParkingArrangement(tags);
    return `${streetName} (${parkingType} parking)`;
  }
  return 'Parking Space';
}

function getParkingArrangement(tags: any): string {
  if (tags['parking:lane:both:parallel']) return 'Parallel';
  if (tags['parking:lane:both:diagonal']) return 'Diagonal';
  if (tags['parking:lane:both:perpendicular']) return 'Perpendicular';
  return 'Street';
}

function getRestrictions(tags: any): string[] {
  const restrictions: string[] = [];

  if (tags?.['parking:condition']) {
    restrictions.push(tags['parking:condition']);
  }
  if (tags?.['parking:maxstay']) {
    restrictions.push(`Max stay: ${tags['parking:maxstay']}`);
  }
  if (tags?.['parking:fee'] === 'yes') {
    restrictions.push('Paid parking');
  }
  if (tags?.['parking:lane:both:maxstay']) {
    restrictions.push(`Max stay: ${tags['parking:lane:both:maxstay']}`);
  }
  if (tags?.['parking:lane:both:restriction']) {
    restrictions.push(tags['parking:lane:both:restriction']);
  }

  return restrictions;
}

function getParkingType(type: string): ParkingSpace['type'] {
  switch (type) {
    case 'underground':
      return 'underground';
    case 'multi-storey':
      return 'multi-storey';
    case 'surface':
      return 'surface';
    case 'street':
      return 'street';
    default:
      return 'unknown';
  }
}