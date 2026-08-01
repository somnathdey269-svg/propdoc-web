import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  const url = new URL(event.request.url);

  // Configure cache control: NEVER cache index.html or root requests
  const options = {
    cacheControl: {
      bypassKVCloudflareCache: true,
      edgeTTL: 0,
      browserTTL: 0
    },
  };

  try {
    const response = await getAssetFromKV(event, options);

    // If serving index.html directly, set anti-caching headers
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  } catch (e) {
    try {
      // Single Page Application (SPA) fallback: route client-side paths (/admin, /dashboard, etc.) to index.html
      const spaFallback = await getAssetFromKV(event, {
        ...options,
        mapRequestToAsset: (req) => {
          const indexUrl = new URL(req.url);
          indexUrl.pathname = '/index.html';
          return mapRequestToAsset(new Request(indexUrl.toString(), req));
        },
      });

      const headers = new Headers(spaFallback.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');

      return new Response(spaFallback.body, {
        status: 200,
        headers,
      });
    } catch (err) {
      return new Response(`Resource not found: ${url.pathname}`, { status: 404 });
    }
  }
}
