// Game state
let targetNumber = '';
let currentGuess = '';
let guesses = [];
let currentRow = 0;
let gameOver = false;
const MAX_GUESSES = 9;
const NUMBER_LENGTH = 4;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Always show landing page on load
    document.getElementById('playBtn').addEventListener('click', () => {
        showLoadingScreen();
    });
});

function showLoadingScreen() {
    // Hide landing page and show loading screen
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('loading-screen').style.display = 'flex';
    
    // Start countdown from 5
    let countdown = 5;
    const countdownElement = document.getElementById('countdown');
    
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            showGame();
        }
    }, 1000);
}

function showGame() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Initialize game and setup listeners now that DOM is ready
    initGame();
    setupEventListeners();
    loadStats();
    
    // If game is already over, show stats modal immediately
    if (gameOver) {
        setTimeout(() => {
            updateStatsDisplay();
            document.getElementById('statsModal').style.display = 'block';
        }, 500);
    } else {
        // New user - show help modal
        setTimeout(() => {
            document.getElementById('helpModal').style.display = 'block';
        }, 500);
    }
}

function initGame() {
    targetNumber = getDailyNumber();
    createGameBoard();
    loadGameState();
}

// Generate daily number based on date (same for everyone each day)
function getDailyNumber() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Simple seeded random number generator
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
        seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
        seed = seed & seed;
    }
    
    // Generate 4 unique digits
    const digits = [];
    const random = (max) => {
        seed = (seed * 9301 + 49297) % 233280;
        return Math.floor((seed / 233280) * max);
    };
    
    while (digits.length < NUMBER_LENGTH) {
        const digit = random(10);
        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }
    
    return digits.join('');
}

function createGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'guess-row';
        row.id = `row-${i}`;
        
        for (let j = 0; j < NUMBER_LENGTH; j++) {
            const cell = document.createElement('div');
            cell.className = 'digit-cell';
            cell.id = `cell-${i}-${j}`;
            row.appendChild(cell);
        }
        
        const resultIndicator = document.createElement('div');
        resultIndicator.className = 'result-indicator';
        resultIndicator.id = `result-${i}`;
        row.appendChild(resultIndicator);
        
        board.appendChild(row);
    }
}

function setupEventListeners() {
    // Keyboard clicks
    document.querySelectorAll('.key[data-key]').forEach(key => {
        key.addEventListener('click', () => {
            handleNumberInput(key.dataset.key);
        });
    });
    
    document.getElementById('enterBtn').addEventListener('click', handleEnter);
    document.getElementById('backspaceBtn').addEventListener('click', handleBackspace);
    
    // Physical keyboard
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        
        if (e.key >= '0' && e.key <= '9') {
            handleNumberInput(e.key);
        } else if (e.key === 'Enter') {
            handleEnter();
        } else if (e.key === 'Backspace') {
            handleBackspace();
        }
    });
    
    // Mobile input handler - auto focus on mobile devices
    const mobileInput = document.getElementById('mobileInput');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && mobileInput) {
        // Keep input focused to show keyboard
        mobileInput.addEventListener('blur', () => {
            if (!gameOver) {
                setTimeout(() => mobileInput.focus(), 0);
            }
        });
        
        // Handle input from mobile keyboard
        mobileInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && !gameOver) {
                const lastChar = value[value.length - 1];
                if (lastChar >= '0' && lastChar <= '9') {
                    handleNumberInput(lastChar);
                }
                mobileInput.value = ''; // Clear for next input
            }
        });
        
        // Focus on game start
        setTimeout(() => mobileInput.focus(), 500);
    }
    
    // Modal handlers
    const helpBtn = document.getElementById('helpBtn');
    const statsBtn = document.getElementById('statsBtn');
    const helpModal = document.getElementById('helpModal');
    const statsModal = document.getElementById('statsModal');
    const closeButtons = document.querySelectorAll('.close');
    
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });
    
    statsBtn.addEventListener('click', () => {
        updateStatsDisplay();
        statsModal.style.display = 'block';
    });
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            helpModal.style.display = 'none';
            statsModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
        if (e.target === statsModal) {
            statsModal.style.display = 'none';
        }
    });
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareResults);
}

function handleNumberInput(digit) {
    if (gameOver || currentGuess.length >= NUMBER_LENGTH) return;
    
    // Check if digit already used in current guess
    if (currentGuess.includes(digit)) {
        showToast('Digit already used! All digits must be unique.', 'error');
        return;
    }
    
    currentGuess += digit;
    updateCurrentRow();
}

function handleBackspace() {
    if (gameOver || currentGuess.length === 0) return;
    
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentRow();
}

function handleEnter() {
    if (gameOver) return;
    
    if (currentGuess.length !== NUMBER_LENGTH) {
        showToast('Please enter 4 digits', 'error');
        return;
    }
    
    // Check if this guess was already tried
    if (guesses.includes(currentGuess)) {
        showToast('You already tried this combination!', 'error');
        return;
    }
    
    submitGuess();
}

function updateCurrentRow() {
    for (let i = 0; i < NUMBER_LENGTH; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        if (i < currentGuess.length) {
            cell.textContent = currentGuess[i];
            cell.classList.add('filled');
        } else {
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    }
}

function submitGuess() {
    const guess = currentGuess;
    guesses.push(guess);
    
    const result = evaluateGuess(guess);
    displayGuessResult(currentRow, guess, result);
    updateKeyboard(guess, result);
    
    if (result.correct === NUMBER_LENGTH) {
        // Win
        gameOver = true;
        saveGameState();
        setTimeout(() => {
            showToast('🎉 Congratulations! You guessed it!', 'success');
            updateStats(true, currentRow + 1);
            showStatsModal();
        }, 1500);
    } else if (currentRow === MAX_GUESSES - 1) {
        // Loss
        gameOver = true;
        saveGameState();
        setTimeout(() => {
            showToast(`Game Over! The number was ${targetNumber}`, 'error');
            updateStats(false, 0);
            showStatsModal();
        }, 1500);
    } else {
        currentRow++;
        currentGuess = '';
        saveGameState();
    }
}

function evaluateGuess(guess) {
    let correct = 0;
    let present = 0;
    const evaluation = [];
    
    for (let i = 0; i < NUMBER_LENGTH; i++) {
        if (guess[i] === targetNumber[i]) {
            correct++;
            evaluation[i] = 'correct';
        } else if (targetNumber.includes(guess[i])) {
            present++;
            evaluation[i] = 'present';
        } else {
            evaluation[i] = 'absent';
        }
    }
    
    return { correct, present, evaluation };
}

function displayGuessResult(row, guess, result) {
    // Mark cells as submitted (no color coding)
    for (let i = 0; i < NUMBER_LENGTH; i++) {
        const cell = document.getElementById(`cell-${row}-${i}`);
        setTimeout(() => {
            cell.classList.remove('filled');
            cell.classList.add('submitted');
        }, i * 100);
    }
    
    // Display result indicator
    const resultDiv = document.getElementById(`result-${row}`);
    setTimeout(() => {
        // Always show both green and yellow indicators
        const greenIndicator = document.createElement('div');
        greenIndicator.className = result.correct > 0 ? 'indicator green' : 'indicator green dimmed';
        greenIndicator.textContent = result.correct;
        resultDiv.appendChild(greenIndicator);
        
        const yellowIndicator = document.createElement('div');
        yellowIndicator.className = result.present > 0 ? 'indicator yellow' : 'indicator yellow dimmed';
        yellowIndicator.textContent = result.present;
        resultDiv.appendChild(yellowIndicator);
    }, NUMBER_LENGTH * 100);
}

function updateKeyboard(guess, result) {
    for (let i = 0; i < NUMBER_LENGTH; i++) {
        const digit = guess[i];
        const key = document.querySelector(`.key[data-key="${digit}"]`);
        
        if (!key) continue;
        
        // Simply mark key as used
        if (!key.classList.contains('used')) {
            key.classList.add('used');
        }
    }
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Local storage functions
function saveGameState() {
    const today = getDateString();
    const state = {
        date: today,
        guesses: guesses,
        currentRow: currentRow,
        gameOver: gameOver,
        targetNumber: targetNumber
    };
    localStorage.setItem('numberguess-state', JSON.stringify(state));
}

function loadGameState() {
    const today = getDateString();
    const saved = localStorage.getItem('numberguess-state');
    
    if (!saved) return;
    
    const state = JSON.parse(saved);
    
    // Check if it's the same day
    if (state.date !== today) {
        // New day, clear old state
        localStorage.removeItem('numberguess-state');
        return;
    }
    
    // Restore state
    guesses = state.guesses;
    currentRow = state.currentRow;
    gameOver = state.gameOver;
    
    // Replay guesses without animations
    guesses.forEach((guess, index) => {
        const result = evaluateGuess(guess);
        
        // Display the guess in cells
        for (let i = 0; i < NUMBER_LENGTH; i++) {
            const cell = document.getElementById(`cell-${index}-${i}`);
            cell.textContent = guess[i];
            cell.classList.add('submitted');
        }
        
        // Display result indicators
        const resultDiv = document.getElementById(`result-${index}`);
        
        // Always show both green and yellow indicators
        const greenIndicator = document.createElement('div');
        greenIndicator.className = result.correct > 0 ? 'indicator green' : 'indicator green dimmed';
        greenIndicator.textContent = result.correct;
        resultDiv.appendChild(greenIndicator);
        
        const yellowIndicator = document.createElement('div');
        yellowIndicator.className = result.present > 0 ? 'indicator yellow' : 'indicator yellow dimmed';
        yellowIndicator.textContent = result.present;
        resultDiv.appendChild(yellowIndicator);
        
        // Update keyboard
        updateKeyboard(guess, result);
    });
    
    if (!gameOver) {
        currentRow = guesses.length;
    }
}

function loadStats() {
    const stats = getStats();
    return stats;
}

function getStats() {
    const saved = localStorage.getItem('numberguess-stats');
    if (!saved) {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            lastPlayedDate: null
        };
    }
    return JSON.parse(saved);
}

function updateStats(won, guessCount) {
    const stats = getStats();
    const today = getDateString();
    
    stats.gamesPlayed++;
    
    if (won) {
        stats.gamesWon++;
        
        // Update streak
        if (stats.lastPlayedDate === getYesterday()) {
            stats.currentStreak++;
        } else {
            stats.currentStreak = 1;
        }
        
        if (stats.currentStreak > stats.maxStreak) {
            stats.maxStreak = stats.currentStreak;
        }
    } else {
        stats.currentStreak = 0;
    }
    
    stats.lastPlayedDate = today;
    
    localStorage.setItem('numberguess-stats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    const stats = getStats();
    
    document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
    document.getElementById('winPercentage').textContent = 
        stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    document.getElementById('currentStreak').textContent = stats.currentStreak;
    document.getElementById('maxStreak').textContent = stats.maxStreak;
    
    // Show share button and start countdown if game is over
    if (gameOver) {
        document.getElementById('shareSection').style.display = 'block';
        startNextNumberCountdown();
    }
}

let countdownInterval = null;

function startNextNumberCountdown() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    updateCountdown();
    
    // Update every second
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    
    // Get next midnight IST
    const nextMidnightIST = new Date(istTime);
    nextMidnightIST.setUTCHours(24 - 5, -30, 0, 0); // Set to next 00:00 IST in UTC
    
    // If we're already past midnight today, it means next midnight is tomorrow
    if (nextMidnightIST <= now) {
        nextMidnightIST.setUTCDate(nextMidnightIST.getUTCDate() + 1);
    }
    
    // Calculate time remaining
    const timeRemaining = nextMidnightIST - now;
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Format with leading zeros
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const timerElement = document.getElementById('nextNumberTimer');
    if (timerElement) {
        timerElement.textContent = formattedTime;
    }
}

function showStatsModal() {
    updateStatsDisplay();
    setTimeout(() => {
        document.getElementById('statsModal').style.display = 'block';
    }, 2000);
}

function shareResults() {
    const today = getDateString();
    const won = guesses[guesses.length - 1] === targetNumber;
    
    let shareText = `Hardnumber ${today}\n`;
    shareText += won ? `${currentRow + 1}/${MAX_GUESSES}\n\n` : `X/${MAX_GUESSES}\n\n`;
    
    guesses.forEach(guess => {
        const result = evaluateGuess(guess);
        shareText += `🟢${result.correct} 🟡${result.present}\n`;
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
        showToast('Results copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy results', 'error');
    });
}

function getDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}
