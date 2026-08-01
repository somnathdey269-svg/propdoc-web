import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  const url = new URL(event.request.url);

  // 1. PROXY STREAM ENDPOINT FOR BYPASSING X-FRAME-OPTIONS & EMBEDDING ANY WEBSITE
  if (url.pathname === '/api/proxy-stream') {
    const targetUrlParam = url.searchParams.get('url');
    if (!targetUrlParam) {
      return new Response('Missing url parameter', { status: 400 });
    }

    try {
      let validTargetUrl = targetUrlParam;
      if (!validTargetUrl.startsWith('http://') && !validTargetUrl.startsWith('https://')) {
        validTargetUrl = 'https://' + validTargetUrl;
      }

      const targetOrigin = new URL(validTargetUrl).origin;

      const res = await fetch(validTargetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const contentType = res.headers.get('content-type') || 'text/html';

      if (contentType.includes('text/html')) {
        let html = await res.text();

        // Inject <base> tag so all relative assets (images, CSS, JS) resolve to original site
        const baseTag = `<base href="${targetOrigin}/" />`;
        
        // Inject interactive element picker script that communicates with parent window
        const pickerScript = `
          <script>
            (function() {
              document.addEventListener('mouseover', function(e) {
                e.target.style.outline = '2px dashed #4f46e5';
              }, true);
              document.addEventListener('mouseout', function(e) {
                e.target.style.outline = '';
              }, true);
              document.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var text = e.target.innerText || e.target.textContent || '';
                window.parent.postMessage({
                  type: 'UD_ELEMENT_CLICKED',
                  tagName: e.target.tagName,
                  text: text.substring(0, 100),
                  className: e.target.className
                }, '*');
              }, true);
            })();
          </script>
        `;

        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${baseTag}${pickerScript}`);
        } else {
          html = baseTag + pickerScript + html;
        }

        const headers = new Headers();
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(html, { status: 200, headers });
      }

      // Return non-HTML assets directly
      return new Response(res.body, { status: res.status, headers: res.headers });
    } catch (err) {
      return new Response(`Proxy Error: ${err ? err.message : 'Failed to fetch'}`, { status: 500 });
    }
  }

  // 2. SPA ROUTING & ASSET HANDLER
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
