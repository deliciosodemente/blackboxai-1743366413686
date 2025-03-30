// Game state management
const gameState = {
    score: 0,
    isPlaying: false,
    isPaused: false,
    difficulty: 'medium',
    soundEnabled: true,
    musicEnabled: true,
    player: null,
    obstacles: [],
    animationFrame: null
};

// DOM Elements
const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('.nav-btn');
const startBtn = document.querySelector('.start-btn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const gameArea = document.getElementById('gameArea');
const difficultySelect = document.getElementById('difficulty');
const soundToggle = document.getElementById('soundToggle');
const musicToggle = document.getElementById('musicToggle');

// Navigation handling
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.getAttribute('data-section');
        showSection(sectionId);
        
        // Update active state of nav buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Show specific section
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    const activeSection = document.getElementById(sectionId);
    activeSection.classList.remove('hidden');
    setTimeout(() => activeSection.classList.add('active'), 10);
}

// Game initialization
function initGame() {
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.isPaused = false;
    gameState.obstacles = [];
    updateScore(0);
    
    // Clear and setup game area
    gameArea.innerHTML = '';
    gameArea.className = 'bg-gray-700 h-96 rounded-lg relative overflow-hidden';
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.className = 'absolute inset-0';
    gameContainer.id = 'gameContainer';
    gameArea.appendChild(gameContainer);
    
    // Create player element
    if (!gameState.player) {
        gameState.player = document.createElement('div');
        gameState.player.className = 'absolute w-8 h-8 bg-blue-500 rounded-full transition-all duration-100 shadow-lg';
        gameContainer.appendChild(gameState.player);
    }
    
    // Reset player position
    gameState.player.style.left = '50%';
    gameState.player.style.top = '75%';
    gameState.player.style.transform = 'translate(-50%, -50%)';
}

// Start game
function startGame() {
    if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        gameArea.classList.add('active');
        initGame();
        gameLoop();
        
        // Show game section
        showSection('game');
    }
}

// Pause game
function pauseGame() {
    if (gameState.isPlaying) {
        gameState.isPaused = !gameState.isPaused;
        pauseBtn.innerHTML = gameState.isPaused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
            
        if (gameState.isPaused) {
            cancelAnimationFrame(gameState.animationFrame);
        } else {
            gameLoop();
        }
    }
}

// Restart game
function restartGame() {
    cancelAnimationFrame(gameState.animationFrame);
    gameOver();  // Show game over screen first
    setTimeout(() => {
        initGame();
        startGame();
    }, 100);
}

// Update score
function updateScore(newScore) {
    gameState.score = newScore;
    scoreDisplay.textContent = newScore;
    scoreDisplay.classList.add('score-popup');
    setTimeout(() => scoreDisplay.classList.remove('score-popup'), 300);
}

// Game loop
function gameLoop() {
    if (!gameState.isPaused && gameState.isPlaying) {
        // Update game state
        updateGameState();
        
        // Check collisions
        checkCollisions();
        
        // Spawn obstacles
        if (Math.random() < getDifficultySpawnRate()) {
            spawnObstacle();
        }
        
        // Update player visual effects
        if (gameState.player) {
            gameState.player.style.boxShadow = '0 0 10px rgba(37, 99, 235, 0.5)';
            gameState.player.style.transform = 'translate(-50%, -50%) scale(1.05)';
            setTimeout(() => {
                if (gameState.player) {
                    gameState.player.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            }, 150);
        }
        
        // Request next frame
        gameState.animationFrame = requestAnimationFrame(gameLoop);
    }
}

// Update game state
function updateGameState() {
    // Update obstacles
    gameState.obstacles.forEach((obstacle, index) => {
        const obstacleEl = obstacle.element;
        obstacle.y += getDifficultySpeed();
        obstacleEl.style.top = `${obstacle.y}px`;
        
        // Remove obstacles that are off screen
        if (obstacle.y > gameArea.offsetHeight) {
            obstacleEl.remove();
            gameState.obstacles.splice(index, 1);
            updateScore(gameState.score + 1);
        }
    });
}

// Spawn obstacle
function spawnObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'absolute w-6 h-6 bg-red-500 rounded-full';
    
    const x = Math.random() * (gameArea.offsetWidth - 24);
    obstacle.style.left = `${x}px`;
    obstacle.style.top = '0';
    
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.appendChild(obstacle);
    
    gameState.obstacles.push({
        element: obstacle,
        x: x,
        y: 0
    });
}

// Check collisions
function checkCollisions() {
    const playerRect = gameState.player.getBoundingClientRect();
    
    gameState.obstacles.forEach(obstacle => {
        const obstacleRect = obstacle.element.getBoundingClientRect();
        
        if (isColliding(playerRect, obstacleRect)) {
            gameOver();
        }
    });
}

// Collision detection
function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

// Game over
function gameOver() {
    gameState.isPlaying = false;
    cancelAnimationFrame(gameState.animationFrame);
    
    // Clear game area and show game over screen with delay for smooth transition
    setTimeout(() => {
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) return;
        
        // Create overlay for game over screen
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 flex items-center justify-center p-4';
        overlay.style.cssText = `
            background: linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.95));
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Show game over message with image similarity option
        const gameOverMsg = document.createElement('div');
        gameOverMsg.className = 'text-center p-8 bg-gray-800/90 rounded-xl shadow-xl transform scale-0 max-w-md w-full mx-auto border border-gray-700';
        gameOverMsg.innerHTML = `
            <div class="animate-fadeIn">
                <h2 class="text-4xl font-bold mb-6 text-red-500">Game Over!</h2>
                <p class="text-2xl mb-8 text-blue-400">Final Score: ${gameState.score}</p>
                <div class="space-y-6">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full transform transition-all hover:scale-105 hover:shadow-lg" 
                            onclick="restartGame()">
                        <i class="fas fa-redo mr-2"></i>Play Again
                    </button>
                    <button class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl w-full transform transition-all hover:scale-105 hover:shadow-lg"
                            onclick="findSimilarImages('https://picsum.photos/200/200?random=' + Date.now())">
                        <i class="fas fa-images mr-2"></i>Find Similar Images
                    </button>
                </div>
            </div>
        `;
        
        overlay.appendChild(gameOverMsg);
        gameContainer.innerHTML = '';
        gameContainer.appendChild(overlay);
        
        // Trigger animations
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            setTimeout(() => {
                gameOverMsg.style.transform = 'scale(1)';
                gameOverMsg.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 100);
        });
    }, 100);
}

// Update findSimilarImages function to handle modal better
async function findSimilarImages(targetImageSrc) {
    try {
        const modal = document.getElementById('similarityModal');
        const resultsContainer = document.getElementById('similarityResults');
        
        // Show loading state with animation
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.style.opacity = '0';
        
        // Force reflow to ensure transition works
        modal.offsetHeight;
        
        modal.style.opacity = '1';
        modal.style.transition = 'opacity 0.3s ease';
        
        resultsContainer.innerHTML = `
            <div class="col-span-2 flex items-center justify-center p-8">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // Find similar images
        const result = await ImageSimilarity.findMostSimilarImage(targetImageSrc, gameImages);
        
        // Display results with animation
        if (result.image) {
            resultsContainer.innerHTML = `
                <div class="text-center transform transition-all duration-500 hover:scale-105">
                    <img src="${targetImageSrc}" class="w-full h-32 object-cover rounded-lg mb-2 shadow-lg" alt="Target image">
                    <p class="text-sm text-gray-400">Target Image</p>
                </div>
                <div class="text-center transform transition-all duration-500 hover:scale-105">
                    <img src="${result.image.src}" class="w-full h-32 object-cover rounded-lg mb-2 shadow-lg" alt="Similar image">
                    <p class="text-sm text-gray-400">Similarity: ${Math.round(result.similarity * 100)}%</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <p class="col-span-2 text-center text-red-500 p-4">
                    <i class="fas fa-exclamation-circle mr-2"></i>No similar images found
                </p>
            `;
        }
    } catch (error) {
        console.error('Error finding similar images:', error);
        resultsContainer.innerHTML = `
            <p class="col-span-2 text-center text-red-500 p-4">
                <i class="fas fa-exclamation-circle mr-2"></i>Error processing images
            </p>
        `;
    }
}

// Update close modal function with animation
function closeSimilarityModal() {
    const modal = document.getElementById('similarityModal');
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        modal.style.transition = '';
    }, 300);
}

// Add keydown event for quick restart
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying && e.key === 'Enter') {
        restartGame();
    }
});

// Add style for fade-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
    }
`;
document.hea
        animation: fadeIn 0.5s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Difficulty settings
function getDifficultySpeed() {
    switch (difficultySelect.value) {
        case 'easy': return 2;
        case 'hard': return 6;
        default: return 4;
    }
}

function getDifficultySpawnRate() {
    switch (difficultySelect.value) {
        case 'easy': return 0.02;
        case 'hard': return 0.05;
        default: return 0.03;
    }
}

// Player movement
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const speed = 20;
    const playerRect = gameState.player.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    let newX = playerRect.left - gameAreaRect.left;
    let newY = playerRect.top - gameAreaRect.top;
    
    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
            newX = Math.max(0, newX - speed);
            break;
        case 'ArrowRight':
        case 'd':
            newX = Math.min(gameAreaRect.width - playerRect.width, newX + speed);
            break;
        case 'ArrowUp':
        case 'w':
            newY = Math.max(0, newY - speed);
            break;
        case 'ArrowDown':
        case 's':
            newY = Math.min(gameAreaRect.height - playerRect.height, newY + speed);
            break;
    }
    
    gameState.player.style.left = `${newX}px`;
    gameState.player.style.top = `${newY}px`;
});

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

difficultySelect.addEventListener('change', () => {
    gameState.difficulty = difficultySelect.value;
});

soundToggle.addEventListener('change', () => {
    gameState.soundEnabled = soundToggle.checked;
});

musicToggle.addEventListener('change', () => {
    gameState.musicEnabled = musicToggle.checked;
});

// Initialize the game
initGame();

// Image similarity functionality
const gameImages = [
    { src: 'https://picsum.photos/200/200?random=1', id: 1 },
    { src: 'https://picsum.photos/200/200?random=2', id: 2 },
    { src: 'https://picsum.photos/200/200?random=3', id: 3 },
    { src: 'https://picsum.photos/200/200?random=4', id: 4 }
];
