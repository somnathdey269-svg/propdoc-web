// Lynqly Data Acquisition Companion Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Lynqly Data Acquisition Companion Installed.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'LYNQLY_ELEMENT_RECORDED') {
    chrome.action.setBadgeText({ text: 'REC' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  }
  sendResponse({ status: 'ok' });
  return true;
});
