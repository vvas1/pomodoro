document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("openModal").addEventListener("click", () => {
    console.log("Open modal button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        console.log("Found active tab:", tabs[0].id);
        
        // Direct injection approach - most reliable
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: showPomodoroModal
        }).then(() => {
          console.log("Script injected successfully");
        }).catch((error) => {
          console.error("Injection failed:", error);
          // Fallback: try content script message
          chrome.tabs.sendMessage(tabs[0].id, { action: "showModal" });
        });
      }
    });
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: hidePomodoroModal
        });
      }
    });
  });
});

function showPomodoroModal() {
  // Check if modal already exists
  let existingModal = document.getElementById("pomodoroModal");
  if (existingModal) {
    existingModal.style.display = "block";
    return;
  }

  // Create modal
  const modal = document.createElement("div");
  modal.id = "pomodoroModal";
  modal.style.cssText = `
    display: block !important;
    position: fixed !important;
    top: 50px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: white !important;
    padding: 20px !important;
    z-index: 999999 !important;
    border: 2px solid #333 !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
    font-family: Arial, sans-serif !important;
    min-width: 280px !important;
    text-align: center !important;
  `;
  
  modal.innerHTML = `
    <div style="color: #333 !important;">
      <h2 style="margin: 0 0 15px 0 !important; color: #333 !important;">🍅 Pomodoro Timer</h2>
      <div id="pomodoroTimerDisplay" style="font-size: 36px !important; margin: 20px 0 !important; font-weight: bold !important; color: #e74c3c !important;">25:00</div>
      <div style="margin: 15px 0 !important;">
        <button id="pomodoroStartBtn" style="margin: 5px !important; padding: 12px 20px !important; background: #27ae60 !important; color: white !important; border: none !important; border-radius: 4px !important; cursor: pointer !important; font-size: 14px !important;">Start</button>
        <button id="pomodoroResetBtn" style="margin: 5px !important; padding: 12px 20px !important; background: #f39c12 !important; color: white !important; border: none !important; border-radius: 4px !important; cursor: pointer !important; font-size: 14px !important;">Reset</button>
      </div>
      <button id="pomodoroCloseBtn" style="margin: 10px 5px 0 5px !important; padding: 8px 16px !important; background: #e74c3c !important; color: white !important; border: none !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important;">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Timer variables
  let timeLeft = 25 * 60; // 25 minutes in seconds
  let timerInterval = null;
  let isRunning = false;
  
  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    const display = document.getElementById('pomodoroTimerDisplay');
    if (display) {
      display.textContent = `${minutes}:${seconds}`;
    }
  }
  
  // Start/Pause button
  document.getElementById('pomodoroStartBtn').onclick = function() {
    if (!isRunning) {
      // Start timer
      isRunning = true;
      this.textContent = 'Pause';
      this.style.background = '#e67e22';
      
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          alert('🎉 Pomodoro completed! Time for a break!');
          timeLeft = 25 * 60;
          updateTimerDisplay();
          document.getElementById('pomodoroStartBtn').textContent = 'Start';
          document.getElementById('pomodoroStartBtn').style.background = '#27ae60';
        }
      }, 1000);
    } else {
      // Pause timer
      isRunning = false;
      clearInterval(timerInterval);
      this.textContent = 'Start';
      this.style.background = '#27ae60';
    }
  };
  
  // Reset button
  document.getElementById('pomodoroResetBtn').onclick = function() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    const startBtn = document.getElementById('pomodoroStartBtn');
    startBtn.textContent = 'Start';
    startBtn.style.background = '#27ae60';
  };
  
  // Close button
  document.getElementById('pomodoroCloseBtn').onclick = function() {
    clearInterval(timerInterval);
    modal.remove();
  };
  
  updateTimerDisplay();
  console.log("Pomodoro modal created and displayed");
}

function hidePomodoroModal() {
  const modal = document.getElementById("pomodoroModal");
  if (modal) {
    modal.style.display = "none";
  }
}
