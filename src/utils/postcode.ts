export async function validatePostcode(postcode: string): Promise<boolean> {
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
}

export async function getCoordinates(postcode: string): Promise<[number, number]> {
  const response = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
  );
  
  if (!response.ok) {
    throw new Error('Invalid postcode');
  }

  const data = await response.json();
  return [data.result.latitude, data.result.longitude];
}