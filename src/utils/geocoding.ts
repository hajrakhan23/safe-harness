// Reverse geocoding using OpenStreetMap Nominatim (free, no API key)
// Cached to reduce requests (Nominatim allows 1 req/sec).

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;

  const promise = (async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error('geocode failed');
      const data = await res.json();
      const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      cache.set(key, address);
      return address;
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      cache.set(key, fallback);
      return fallback;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
