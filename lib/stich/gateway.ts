/**
 * Stich Gateway
 * Interceptor and request orchestrator for the Stich backend processes.
 */

const STICH_API_ENDPOINT = process.env.STICH_API_ENDPOINT;
const STICH_API_KEY = process.env.STICH_API_KEY;

export async function fetchStich(endpoint: string, options: RequestInit = {}) {
  const url = `${STICH_API_ENDPOINT}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${STICH_API_KEY}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Stich Gateway Error: ${response.statusText}`);
  }

  return response.json();
}
