// Game state
const gameState = {
    isPlaying: false,
    combo: 0,
    health: 100
};

// DOM Elements
const startButton = document.getElementById('startBattle');
const scanButton = document.getElementById('scanObject');
const gameArea = document.getElementById('gameArea');
const healthBar = document.querySelector('.health-bar-fill');
const comboCounter = document.querySelector('.combo-counter');

// Initialize game
function initGame() {
    gameState.isPlaying = true;
    gameState.combo = 0;
    gameState.health = 100;
    
    updateUI();
    
    // Show game area
    gameArea.classList.remove('hidden');
    gameArea.classList.add('flex');
    
    // Announce game start
    if (window.voiceSystem) {
        window.voiceSystem.announceStart();
    }
}

// Update UI
function updateUI() {
    if (healthBar) {
        healthBar.style.width = `${gameState.health}%`;
    }
    if (comboCounter) {
        comboCounter.textContent = `COMBO: ${gameState.combo}`;
    }
}

// Handle combat actions
function handleAction(type) {
    if (!gameState.isPlaying) return;
    
    switch(type) {
        case 'block':
            gameState.combo++;
            if (window.voiceSystem) {
                window.voiceSystem.announceAction('block');
            }
            break;
        case 'special':
            gameState.combo += 2;
            if (window.voiceSystem) {
                window.voiceSystem.announceAction('special');
            }
            break;
        case 'combo':
            gameState.combo++;
            if (gameState.combo > 2 && window.voiceSystem) {
                window.voiceSystem.announceAction('combo');
            }
            break;
    }
    
    updateUI();
}

// Event Listeners
if (startButton) {
    startButton.addEventListener('click', initGame);
}

if (scanButton) {
    scanButton.addEventListener('click', () => {
        if (window.voiceSystem) {
            window.voiceSystem.speak("Scanning for compatible objects...", true);
        }
    });
}

// Combat controls
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) return;
    
    switch (e.key) {
        case ' ': // Spacebar
            handleAction('block');
            break;
        case 'e':
            handleAction('special');
            break;
        case 'q':
            handleAction('combo');
            break;
    }
});

// Game over handling
function gameOver(victory = false) {
    gameState.isPlaying = false;
    
    if (window.voiceSystem) {
        if (victory) {
            window.voiceSystem.announceVictory();
        } else {
            window.voiceSystem.announceDefeat();
        }
    }
    
    setTimeout(() => {
        gameArea.classList.add('hidden');
        gameArea.classList.remove('flex');
    }, 2000);
}
