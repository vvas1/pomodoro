// Create modal element
let modal = null;
let timer = 25 * 60;
let interval = null;

function createModal() {
  if (modal) return; // Modal already exists

  modal = document.createElement("div");
  modal.id = "pomodoroModal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "10%";
  modal.style.left = "50%";
  modal.style.transform = "translateX(-50%)";
  modal.style.background = "#fff";
  modal.style.padding = "20px";
  modal.style.zIndex = "10000";
  modal.style.border = "2px solid #333";
  modal.style.borderRadius = "8px";
  modal.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  modal.innerHTML = `
    <h2>Pomodoro Timer</h2>
    <div id="pomodoroTimer" style="font-size:24px; margin:10px 0;">25:00</div>
    <button id="pomodoroStartBtn">Start</button>
    <button id="pomodoroResetBtn">Reset</button>
    <button id="pomodoroCloseBtn">Close</button>
  `;
  document.body.appendChild(modal);

  // Setup event listeners
  document.getElementById("pomodoroStartBtn").onclick = startTimer;
  document.getElementById("pomodoroResetBtn").onclick = resetTimer;
  document.getElementById("pomodoroCloseBtn").onclick = hideModal;

  updateDisplay();
}

function updateDisplay() {
  const timerElement = document.getElementById("pomodoroTimer");
  if (timerElement) {
    const minutes = Math.floor(timer / 60).toString().padStart(2, "0");
    const seconds = (timer % 60).toString().padStart(2, "0");
    timerElement.textContent = `${minutes}:${seconds}`;
  }
}

function startTimer() {
  if (!interval) {
    interval = setInterval(() => {
      if (timer > 0) {
        timer--;
        updateDisplay();
      } else {
        clearInterval(interval);
        interval = null;
        alert("Pomodoro finished!");
        timer = 25 * 60;
        updateDisplay();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  timer = 25 * 60;
  updateDisplay();
}

function showModal() {
  createModal();
  if (modal) {
    modal.style.display = "block";
  }
}

function hideModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  if (request.action === "showModal") {
    showModal();
    sendResponse({ success: true });
  } else if (request.action === "hideModal") {
    hideModal();
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});
