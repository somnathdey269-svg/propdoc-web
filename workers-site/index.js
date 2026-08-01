import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';

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
    mapRequestToAsset: serveSinglePageApp,
  };

  try {
    const page = await getAssetFromKV(event, options);

    const headers = new Headers(page.headers);
    if (url.pathname === '/' || url.pathname === '/index.html' || !url.pathname.includes('.')) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    }

    return new Response(page.body, {
      status: page.status,
      statusText: page.statusText,
      headers,
    });
  } catch (e) {
    try {
      const fallback = await getAssetFromKV(event, {
        cacheControl: { bypassKVCloudflareCache: true, edgeTTL: 0, browserTTL: 0 }
      });
      return fallback;
    } catch (err) {
      return new Response(`Resource not found: ${url.pathname}`, { status: 404 });
    }
  }
}
