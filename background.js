// Pomodoro Timer Background Service Worker
class PomodoroBackground {
  constructor() {
    this.timeLeft = 0;
    this.defaultTime = 25 * 60; // 25 minutes in seconds
    this.timerInterval = null;
    this.isRunning = false;
    this.startTime = null;
    
    this.setupMessageListener();
    this.setupNotificationListener();
    this.loadSettings();
    console.log("Pomodoro extension background script loaded");
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Background received message:', message);
      
      switch (message.action) {
        case 'getTimerState':
          sendResponse({
            timeLeft: this.timeLeft,
            defaultTime: this.defaultTime,
            isRunning: this.isRunning
          });
          break;
          
        case 'startTimer':
          this.startTimer(message.minutes);
          sendResponse({ success: true });
          break;
          
        case 'pauseTimer':
          this.pauseTimer();
          sendResponse({ success: true });
          break;
          
        case 'resetTimer':
          this.resetTimer(message.minutes);
          sendResponse({ success: true });
          break;
          
        case 'updateMinutes':
          this.updateDefaultTime(message.minutes);
          sendResponse({ success: true });
          break;
      }
      return true;
    });
  }

  loadSettings() {
    chrome.storage.sync.get(['pomodoroMinutes'], (result) => {
      const minutes = result.pomodoroMinutes || 25;
      this.defaultTime = minutes * 60;
      this.timeLeft = this.defaultTime;
    });
  }

  saveSettings(minutes) {
    chrome.storage.sync.set({ pomodoroMinutes: minutes });
  }

  updateDefaultTime(minutes) {
    this.defaultTime = minutes * 60;
    if (!this.isRunning) {
      this.timeLeft = this.defaultTime;
    }
    this.saveSettings(minutes);
    this.notifyPopupUpdate();
  }

  startTimer(minutes) {
    if (this.isRunning) return;
    
    if (minutes) {
      this.defaultTime = minutes * 60;
      this.saveSettings(minutes);
    }
    
    if (this.timeLeft <= 0) {
      this.timeLeft = this.defaultTime;
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.notifyPopupUpdate();
      
      if (this.timeLeft <= 0) {
        this.completeTimer();
      }
    }, 1000);
    
    this.notifyPopupUpdate();
  }

  pauseTimer() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.notifyPopupUpdate();
  }

  resetTimer(minutes) {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    
    if (minutes) {
      this.defaultTime = minutes * 60;
      this.saveSettings(minutes);
    }
    
    this.timeLeft = this.defaultTime;
    this.notifyPopupUpdate();
  }

  completeTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    
    const minutes = Math.floor(this.defaultTime / 60);
    
    // Show notification
    this.showCompletionNotification(minutes);
    
    // Reset for next session
    this.timeLeft = this.defaultTime;
    this.notifyPopupUpdate();
  }

  showCompletionNotification(minutes) {
    const notificationId = `pomodoro-${Date.now()}`;
    
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: '🍅 Pomodoro Complete!',
      message: `Great job! You completed a ${minutes}-minute focus session. Time for a break!`,
      buttons: [
        { title: 'Start Another Session' }
      ],
      requireInteraction: true,
      priority: 2
    });
    
    // Clear the notification after 30 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 30000);
  }

  notifyPopupUpdate() {
    // Send message to popup if it's open
    chrome.runtime.sendMessage({
      action: 'timerUpdate',
      timeLeft: this.timeLeft,
      isRunning: this.isRunning,
      defaultTime: this.defaultTime
    }).catch(() => {
      // Popup might be closed, ignore error
    });
  }

  setupNotificationListener() {
    chrome.notifications.onClicked.addListener((notificationId) => {
      if (notificationId.startsWith('pomodoro-')) {
        chrome.action.openPopup?.();
        chrome.notifications.clear(notificationId);
      }
    });

    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      if (notificationId.startsWith('pomodoro-')) {
        if (buttonIndex === 0) {
          // "Start Another" button clicked
          this.startTimer();
          chrome.action.openPopup?.();
        }
        chrome.notifications.clear(notificationId);
      }
    });
  }
}

// Initialize the background service
new PomodoroBackground();