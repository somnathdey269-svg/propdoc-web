// Lynqly Data Acquisition Companion Content Script
(function () {
  const channel = new BroadcastChannel('lynqly_live_stream_channel');
  let isPickingActive = true;

  // Send heartbeat connection signal to Lynqly Admin Panel
  function sendHeartbeat() {
    channel.postMessage({
      type: 'LYNQLY_TAB_HEARTBEAT',
      url: window.location.href,
      title: document.title,
      timestamp: Date.now()
    });
  }

  sendHeartbeat();
  setInterval(sendHeartbeat, 3000);

  // Element hover highlight
  document.addEventListener('mouseover', function (e) {
    if (!isPickingActive) return;
    if (e.target.id === 'lynqly-toast') return;
    e.target.style.outline = '2px dashed #4f46e5';
    e.target.style.outlineOffset = '2px';
  }, true);

  document.addEventListener('mouseout', function (e) {
    if (!isPickingActive) return;
    if (e.target.id === 'lynqly-toast') return;
    e.target.style.outline = '';
  }, true);

  // Element click recorder
  document.addEventListener('click', function (e) {
    if (!isPickingActive) return;
    if (e.target.id === 'lynqly-toast') return;

    const text = (e.target.innerText || e.target.textContent || '').trim().substring(0, 100);
    const tagName = e.target.tagName;
    const className = e.target.className || '';
    const href = e.target.getAttribute('href') || '';

    // Broadcast to Lynqly Admin Panel tab
    const payload = {
      type: 'LYNQLY_ELEMENT_RECORDED',
      url: window.location.href,
      tagName: tagName,
      text: text || 'Selected Element',
      className: className,
      href: href,
      timestamp: Date.now()
    };

    channel.postMessage(payload);

    try {
      chrome.runtime.sendMessage(payload);
    } catch (err) {
      // Ignore extension context invalidated errors
    }

    // Show visual toast confirmation on site
    showToast(`Captured: "${text.substring(0, 30) || tagName}" → Synced to Admin Panel`);
  }, true);

  function showToast(message) {
    let toast = document.getElementById('lynqly-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'lynqly-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.zIndex = '999999';
      toast.style.padding = '12px 18px';
      toast.style.background = 'linear-gradient(to right, #4f46e5, #0284c7)';
      toast.style.color = '#ffffff';
      toast.style.fontSize = '12px';
      toast.style.fontWeight = 'bold';
      toast.style.fontFamily = 'sans-serif';
      toast.style.borderRadius = '12px';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }
    toast.innerText = '⚡ ' + message;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  }
})();
