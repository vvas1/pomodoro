// Pomodoro Timer Content Script
// This script is now minimal since we moved to notification-based alerts
// We keep it in case we need to add page-specific features in the future

console.log('Pomodoro Timer content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  
  if (request.action === "showNotification") {
    // We could add custom page notifications here if needed
    // For now, we rely on browser notifications from the background script
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});
