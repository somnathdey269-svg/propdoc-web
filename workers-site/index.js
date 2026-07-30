import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event);
  } catch (e) {
    try {
      // Single Page Application (SPA) fallback: route client-side paths like /admin to index.html
      const spaFallback = await getAssetFromKV(event, {
        mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req),
      });
      return new Response(spaFallback.body, { ...spaFallback, status: 200 });
    } catch (err) {
      let pathname = new URL(event.request.url).pathname;
      return new Response(`Resource not found: ${pathname}`, { status: 404 });
    }
  }
}
