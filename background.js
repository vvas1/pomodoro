// Pomodoro Timer Background Service Worker
class PomodoroBackground {
  constructor() {
    this.setupMessageListener();
    this.setupNotificationListener();
    console.log("Pomodoro extension background script loaded");
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'pomodoroComplete') {
        this.handlePomodoroComplete(message.minutes);
        sendResponse({ success: true });
      }
      return true;
    });
  }

  setupNotificationListener() {
    // Handle notification clicks
    chrome.notifications.onClicked.addListener((notificationId) => {
      if (notificationId.startsWith('pomodoro-')) {
        // Open the extension popup
        chrome.action.openPopup?.();
        chrome.notifications.clear(notificationId);
      }
    });

    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      if (notificationId.startsWith('pomodoro-')) {
        if (buttonIndex === 0) {
          // "Start Another" button clicked
          chrome.action.openPopup?.();
        }
        chrome.notifications.clear(notificationId);
      }
    });
  }

  handlePomodoroComplete(minutes) {
    const notificationId = `pomodoro-${Date.now()}`;
    
    // Create a rich notification
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: '🍅 Pomodoro Complete!',
      message: `Congratulations! You completed a ${minutes}-minute focus session. Time for a well-deserved break!`,
      buttons: [
        { title: 'Start Another Session' }
      ],
      requireInteraction: true,
      priority: 2
    });

    // Play system notification sound (if available)
    this.playSystemSound();
    
    // Clear the notification after 30 seconds if user hasn't interacted
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 30000);
  }

  playSystemSound() {
    // For Chrome extensions, we rely on the Web Audio API in the popup
    // The background script has limited audio capabilities
    console.log('Pomodoro completed - sound should play from popup');
  }
}

// Initialize the background service
new PomodoroBackground();