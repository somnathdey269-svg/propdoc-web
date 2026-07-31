import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  const url = new URL(event.request.url);

  const options = {
    cacheControl: {
      bypassKVCloudflareCache: true,
    },
  };

  try {
    return await getAssetFromKV(event, options);
  } catch (e) {
    try {
      // Single Page Application (SPA) fallback: route client-side paths like /admin to index.html
      const spaFallback = await getAssetFromKV(event, {
        ...options,
        mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req),
      });

      const headers = new Headers(spaFallback.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

      return new Response(spaFallback.body, {
        status: 200,
        headers,
      });
    } catch (err) {
      return new Response(`Resource not found: ${url.pathname}`, { status: 404 });
    }
  }
}
