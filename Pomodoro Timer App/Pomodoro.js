// Timer State
let workDuration = 1.00* 60//seconds
let breakDuration = 0*60 // seconds
let timeRemaining = workDuration;
let totalDuration = workDuration;
let isWorking = true;
let isRunning = false;
let timerInterval = null;
let sessionsCompleted = 0;
let totalFocusTime = 0; // in seconds


// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const phaseStatus = document.getElementById('phase-status');
const phaseMessage = document.getElementById('phase-message');
const timerBox = document.getElementById('timer-box');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const sessionCount = document.getElementById('session-count');
const totalTime = document.getElementById('total-time');
const progressFill = document.getElementById('progress-fill');
const timeInfo = document.getElementById('time-info');
const tipText = document.getElementById('tip-text');
const setupSection = document.getElementById('setup-section');
const themeToggle = document.getElementById('theme-toggle');

// Theme handling
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
        themeToggle.textContent = '🌞';
    } else {
        document.body.classList.remove('light');
        themeToggle.textContent = '🌙';
    }
    try { localStorage.setItem('pomodoro-theme', theme); } catch (e) {}
}

// Initialize theme from localStorage or prefer dark
(function initTheme(){
    const saved = (localStorage.getItem('pomodoro-theme')) || 'dark';
    applyTheme(saved);
})();

// Toggle theme on button click
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light');
        applyTheme(isLight ? 'dark' : 'light');
    });
}

// Tips for motivation
const tips = [
    '💡 Tip: Turn off notifications for better focus!',
    '🚶 Tip: Stretch during your break!',
    '💧 Tip: Stay hydrated during work sessions!',
    '🎧 Tip: Try focus music or white noise!',
    '📵 Tip: Put your phone away!',
    '🎯 Tip: Break large tasks into smaller ones!',
    '☕ Tip: Have a drink ready before starting!',
    '⚡ Tip: Start with your hardest task!',
    // Add more tips here if desired
    '🧘 Tip: Practice deep breathing during breaks! Dont be lazy!',
    'Listen to your favorite upbeat song to boost your energy!',
    'BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA.BL ABL ABL ABL ABL ABL ABL ABL ABL ABL ABL ABL ABL ABL',
];

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Format hours and minutes
function formatHoursMinutes(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Update display
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
    updateProgressBar();
}

// Make timer display clickable to change time
timerDisplay.addEventListener('click', function() {
    if (isRunning) {
        alert('⏸️ Please pause the timer first!');
        return;
    }
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const currentTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const newTime = prompt(`Edit time (MM:SS format):\nCurrent: ${currentTime}`, currentTime);
    
    if (newTime !== null && newTime.trim() !== '') {
        const timeParts = newTime.split(':');
        if (timeParts.length === 2) {
            const newMinutes = parseInt(timeParts[0]);
            const newSeconds = parseInt(timeParts[1]);
            
            if (!isNaN(newMinutes) && !isNaN(newSeconds) && newMinutes >= 0 && newSeconds >= 0 && newSeconds < 60) {
                timeRemaining = newMinutes * 60 + newSeconds;
                totalDuration = timeRemaining;
                updateDisplay();
            } else {
                alert('❌ Invalid format! Use MM:SS (e.g., 05:30)');
            }
        } else {
            alert('❌ Invalid format! Use MM:SS (e.g., 05:30)');
        }
    }
});

// Add more time to the remaining timer
function addTime(seconds) {
    timeRemaining += seconds;
    totalDuration += seconds;
    updateDisplay();
}

// Update progress bar
function updateProgressBar() {
    const percentage = (timeRemaining / totalDuration) * 100;
    progressFill.style.width = percentage + '%';
    // Move emoji along with progress
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.setProperty('--emoji-position', percentage + '%');
}

// Show random tip
function showRandomTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipText.textContent = randomTip;
}

// Set custom duration from user input
function setCustomDuration() {
    const workInput = parseFloat(document.getElementById('work-duration').value);
    const breakInput = parseFloat(document.getElementById('break-duration').value);

    if (workInput >= 0.1 && workInput <= 60 && breakInput >= 0 && breakInput <= 30) {
        workDuration = workInput * 60;
        breakDuration = breakInput * 60;
        resetTimer();
        startTimer();
        setupSection.classList.add('hidden');
    } else {
        alert('⚠️ Work: 0.1-60 minutes, Break: 0.5-30 minutes');
    }
}

// Start timer
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = '⏳ Running...';
    pauseBtn.disabled = false;

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (isWorking) totalFocusTime++;

        if (timeRemaining < 0) {
            clearInterval(timerInterval);
            completePhase();
            return;
        }

        updateDisplay();
    }, 1000);
}

// Pause timer
function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    startBtn.textContent = '▶️ Resume';
    pauseBtn.disabled = true;
}

// Reset timer
function resetTimer() {
    pauseTimer();
    isWorking = true;
    timeRemaining = workDuration;
    totalDuration = workDuration;
    updateDisplay();
    updatePhaseDisplay();
    startBtn.textContent = '▶️ Start Session';
    setupSection.classList.remove('hidden');
    showRandomTip();
}

// Complete work/break phase
function completePhase() {
    const sound = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
    sound.play().catch(() => {});

    if (isWorking) {
        sessionsCompleted++;
        sessionCount.textContent = sessionsCompleted;
        totalTime.textContent = formatHoursMinutes(totalFocusTime);
        
        // Auto-proceed to break (or show celebration if no break)
        if (breakDuration > 0) {
            isWorking = false;
            timeRemaining = breakDuration;
            totalDuration = breakDuration;
            updatePhaseDisplay();
            updateDisplay();
            startTimer();
        } else {
            showFinalMessage();
        }
    } else {
        // Break finished - show celebration
        showFinalMessage();
    }

    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Update phase display
function updatePhaseDisplay() {
    if (isWorking) {
        timerBox.classList.remove('phase-break');
        timerBox.classList.add('phase-work');
        phaseStatus.textContent = '💪 Work Session';
        phaseMessage.textContent = 'Focus and stay productive!';
        timeInfo.textContent = 'Stay focused, you can do it! ⚡';
    } else {
        timerBox.classList.remove('phase-work');
        timerBox.classList.add('phase-break');
        phaseStatus.textContent = '☕ Break Time';
        phaseMessage.textContent = 'Take a moment to recharge!';
        timeInfo.textContent = 'Relax and prepare for the next session 🧘';
    }
}

// Show a celebratory final message with party popper and animation
function showFinalMessage() {
    // Play a cheerful sound (may be blocked by browser autoplay rules)
    try {
        const cheer = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
        cheer.play().catch(() => {});
    } catch (e) {}

    // Visual celebration on timer box
    timerBox.classList.add('celebrate');
    phaseStatus.textContent = '🎉 Congratulations!';
    phaseMessage.textContent = `You completed ${sessionsCompleted} session(s)! Total focus: ${formatHoursMinutes(totalFocusTime)}`;

    // Create confetti/party popper effect
    function createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    createConfetti();

    // Brief delay so user sees celebration, then reset
    setTimeout(() => {
        timerBox.classList.remove('celebrate');
        resetTimer();
    }, 2500);
}

// Initialize
updateDisplay();
updatePhaseDisplay();
showRandomTip();
