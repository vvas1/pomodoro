class PomodoroTimer {
  constructor() {
    this.timeLeft = 25 * 60; // Default 25 minutes in seconds
    this.defaultTime = 25 * 60;
    this.timerInterval = null;
    this.isRunning = false;
    this.alarmSound = null;
    
    this.initializeElements();
    this.loadSettings();
    this.createAlarmSound();
    this.setupEventListeners();
    this.updateDisplay();
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
    // Create an audio context for the alarm sound
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }

  playAlarmSound() {
    if (!this.audioContext) return;
    
    // Create a simple beep sound using Web Audio API
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
    
    // Play multiple beeps
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

  setupEventListeners() {
    this.minutesInput.addEventListener('change', () => {
      const minutes = parseInt(this.minutesInput.value) || 25;
      this.defaultTime = minutes * 60;
      if (!this.isRunning) {
        this.timeLeft = this.defaultTime;
        this.updateDisplay();
      }
      this.saveSettings();
    });

    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
  }

  loadSettings() {
    chrome.storage.sync.get(['pomodoroMinutes'], (result) => {
      const minutes = result.pomodoroMinutes || 25;
      this.minutesInput.value = minutes;
      this.defaultTime = minutes * 60;
      this.timeLeft = this.defaultTime;
      this.updateDisplay();
    });
  }

  saveSettings() {
    const minutes = parseInt(this.minutesInput.value) || 25;
    chrome.storage.sync.set({ pomodoroMinutes: minutes });
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  startTimer() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;
    this.timerStatus.textContent = 'Running';
    
    // Request notification permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      
      if (this.timeLeft <= 0) {
        this.completeTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.timerStatus.textContent = 'Paused';
  }

  resetTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timeLeft = this.defaultTime;
    this.updateDisplay();
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.timerStatus.textContent = 'Ready';
  }

  completeTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.timerStatus.textContent = 'Completed!';
    
    // Play alarm sound
    this.playAlarmSound();
    
    // Show browser notification
    if (Notification.permission === 'granted') {
      const notification = new Notification('🍅 Pomodoro Complete!', {
        body: 'Great job! Time for a break. Click to start another session.',
        icon: 'icon48.png',
        requireInteraction: true
      });
      
      notification.onclick = () => {
        notification.close();
        // Focus the extension popup if possible
        chrome.action.openPopup?.();
      };
      
      // Auto-close notification after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
    
    // Also send message to background script for additional notification handling
    chrome.runtime.sendMessage({
      action: 'pomodoroComplete',
      minutes: Math.floor(this.defaultTime / 60)
    });
    
    // Reset timer for next session
    this.timeLeft = this.defaultTime;
    this.updateDisplay();
    setTimeout(() => {
      this.timerStatus.textContent = 'Ready';
    }, 3000);
  }
}

// Initialize the timer when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  new PomodoroTimer();
});
