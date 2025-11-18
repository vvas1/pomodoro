class PomodoroPopup {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.setupMessageListener();
    this.loadTimerState();
    this.createAlarmSound();
    
    // Request notification permission on load
    this.requestNotificationPermission();
  }

  initializeElements() {
    this.minutesInput = document.getElementById('minutesInput');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.timerStatus = document.getElementById('timerStatus');
    this.startBtn = document.getElementById('startTimer');
    this.pauseBtn = document.getElementById('pauseTimer');
    this.resetBtn = document.getElementById('resetTimer');
  }

  createAlarmSound() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }

  requestNotificationPermission() {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }

  setupEventListeners() {
    this.minutesInput.addEventListener('change', () => {
      const minutes = parseInt(this.minutesInput.value) || 25;
      chrome.runtime.sendMessage({
        action: 'updateMinutes',
        minutes: minutes
      });
    });

    this.startBtn.addEventListener('click', () => {
      const minutes = parseInt(this.minutesInput.value) || 25;
      chrome.runtime.sendMessage({
        action: 'startTimer',
        minutes: minutes
      });
    });

    this.pauseBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'pauseTimer' });
    });

    this.resetBtn.addEventListener('click', () => {
      const minutes = parseInt(this.minutesInput.value) || 25;
      chrome.runtime.sendMessage({
        action: 'resetTimer',
        minutes: minutes
      });
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'timerUpdate') {
        this.updateDisplay(message.timeLeft, message.isRunning);
        
        // Play sound when timer completes (timeLeft is 0 and was just running)
        if (message.timeLeft === message.defaultTime && !message.isRunning) {
          this.playAlarmSound();
        }
      }
    });
  }

  loadTimerState() {
    chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
      if (response) {
        const minutes = Math.floor(response.defaultTime / 60);
        this.minutesInput.value = minutes;
        this.updateDisplay(response.timeLeft, response.isRunning);
      }
    });
  }

  updateDisplay(timeLeft, isRunning) {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${minutes}:${seconds}`;
    
    // Update button states
    this.startBtn.disabled = isRunning;
    this.pauseBtn.disabled = !isRunning;
    
    // Update status
    if (isRunning) {
      this.timerStatus.textContent = 'Running';
    } else if (timeLeft === 0) {
      this.timerStatus.textContent = 'Completed!';
      setTimeout(() => {
        this.timerStatus.textContent = 'Ready';
      }, 3000);
    } else if (timeLeft < parseInt(this.minutesInput.value) * 60) {
      this.timerStatus.textContent = 'Paused';
    } else {
      this.timerStatus.textContent = 'Ready';
    }
  }

  playAlarmSound() {
    if (!this.audioContext) return;
    
    // Play three beeps
    this.playBeep();
    setTimeout(() => this.playBeep(), 600);
    setTimeout(() => this.playBeep(), 1200);
  }

  playBeep() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}

// Initialize the popup when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  new PomodoroPopup();
});
