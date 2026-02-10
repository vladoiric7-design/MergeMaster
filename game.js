/* ==========================================
   2048: MERGE MASTER - Game Logic
   ========================================== */

// Sound Manager
const SoundManager = {
    audioContext: null,
    enabled: true,
    muted: false,
    unlocked: false,

    init() {
        // Load mute preference
        this.muted = localStorage.getItem('mergeMasterMuted') === 'true';
        this.updateIcon();
    },

    unlock() {
        if (this.unlocked) return;

        try {
            // Create audio context on first user interaction (required for iOS)
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Resume if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Play silent sound to unlock iOS audio
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);

            this.unlocked = true;
        } catch (e) {
            this.enabled = false;
        }
    },

    toggle() {
        this.muted = !this.muted;
        localStorage.setItem('mergeMasterMuted', this.muted);
        this.updateIcon();
    },

    updateIcon() {
        const iconOn = document.getElementById('sound-icon-on');
        const iconOff = document.getElementById('sound-icon-off');
        if (iconOn && iconOff) {
            iconOn.style.display = this.muted ? 'none' : 'block';
            iconOff.style.display = this.muted ? 'block' : 'none';
        }
    },

    playMove() {
        if (!this.enabled || !this.audioContext || this.muted || !this.unlocked) return;
        this.playTone(300, 0.08, 'sine');
    },

    playMerge() {
        if (!this.enabled || !this.audioContext || this.muted || !this.unlocked) return;
        this.playTone(500, 0.12, 'sine');
    },

    playTone(frequency, duration, type) {
        if (!this.audioContext || this.muted) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Ignore errors
        }
    }
};

class Game {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(`mergeMasterBest_${size}`)) || 0;
        this.won = false;
        this.over = false;
        this.keepPlaying = false;

        // Undo feature
        this.previousState = null;
        this.previousScore = 0;
        this.canUndo = false;

        this.tileContainer = document.getElementById('tile-container');
        this.gridBackground = document.getElementById('grid-background');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.gameOverOverlay = document.getElementById('game-over');
        this.gameWinOverlay = document.getElementById('game-win');
        this.gamePauseOverlay = document.getElementById('game-pause');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.pauseScoreDisplay = document.getElementById('pause-score');
        this.undoBtn = document.getElementById('undo-btn');

        // Initialize sound
        SoundManager.init();

        this.init();
    }

    init() {
        this.buildGrid();
        this.setupInput();
        this.updateBestScore();
        this.startGame();
    }

    // Build grid background based on size
    buildGrid() {
        // Make container square by setting height = width
        const container = document.getElementById('game-container');
        const width = container.offsetWidth;
        container.style.height = width + 'px';

        this.gridBackground.innerHTML = '';

        // Calculate gap based on grid size
        this.gap = this.size <= 4 ? 8 : (this.size <= 6 ? 6 : 4);

        this.gridBackground.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.gridBackground.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        this.gridBackground.style.gap = `${this.gap}px`;

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridBackground.appendChild(cell);
        }
    }

    // Initialize empty grid
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = null;
            }
        }
    }

    // Start game
    startGame() {
        this.score = 0;
        this.won = false;
        this.over = false;
        this.keepPlaying = false;
        this.previousState = null;
        this.canUndo = false;
        this.updateUndoButton();
        this.updateScore();
        this.hideOverlays();
        this.initGrid();
        this.clearTiles();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }

    // Restart game
    restart() {
        Game.clearSavedGame();
        this.startGame();
    }

    // Save game state to localStorage
    saveGameState() {
        const state = {
            grid: this.grid,
            score: this.score,
            size: this.size,
            won: this.won,
            keepPlaying: this.keepPlaying,
            over: this.over,
            timestamp: Date.now()
        };
        localStorage.setItem('mergeMasterSavedGame', JSON.stringify(state));
    }

    // Load saved game state from localStorage
    static loadGameState() {
        try {
            const saved = localStorage.getItem('mergeMasterSavedGame');
            if (!saved) return null;
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }

    // Clear saved game state
    static clearSavedGame() {
        localStorage.removeItem('mergeMasterSavedGame');
    }

    // Restore game from a saved state object
    restoreState(state) {
        this.grid = state.grid;
        this.score = state.score;
        this.won = state.won;
        this.keepPlaying = state.keepPlaying;
        this.over = state.over;
        this.previousState = null;
        this.canUndo = false;
        this.updateUndoButton();
        this.updateScore();
        this.hideOverlays();
        this.render();
    }

    // Continue after winning
    continueGame() {
        this.keepPlaying = true;
        this.hideOverlays();
    }

    // Submit current score to leaderboard if it's the best so far
    submitIfBest() {
        if (this.score > 0 && this.score >= this.bestScore && GameServices.isSignedIn) {
            GameServices.submitScore(this.size, this.score);
        }
    }

    // Back to menu
    backToMenu() {
        this.submitIfBest();
        this.saveGameState();
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');
    }

    // Hide all overlays
    hideOverlays() {
        this.gameOverOverlay.classList.remove('active');
        this.gameWinOverlay.classList.remove('active');
        this.gamePauseOverlay.classList.remove('active');
    }

    // Show pause/home menu
    showPauseMenu() {
        this.pauseScoreDisplay.textContent = this.score;
        this.gamePauseOverlay.classList.add('active');
    }

    // Resume game from pause
    resumeGame() {
        this.gamePauseOverlay.classList.remove('active');
    }

    // Start new game from pause menu
    startNewFromPause() {
        Game.clearSavedGame();
        this.gamePauseOverlay.classList.remove('active');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');
    }

    // Clear all tiles from DOM
    clearTiles() {
        this.tileContainer.innerHTML = '';
    }

    // Save state for undo
    saveState() {
        this.previousState = this.grid.map(row => [...row]);
        this.previousScore = this.score;
        this.canUndo = true;
        this.updateUndoButton();
    }

    // Undo last move
    undo() {
        if (!this.canUndo || !this.previousState) return;

        this.grid = this.previousState.map(row => [...row]);
        this.score = this.previousScore;
        this.canUndo = false;
        this.over = false;
        this.updateUndoButton();
        this.updateScore();
        this.hideOverlays();
        this.render();
    }

    // Update undo button state
    updateUndoButton() {
        if (this.undoBtn) {
            this.undoBtn.disabled = !this.canUndo;
        }
    }

    // Get empty cells
    getEmptyCells() {
        const empty = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === null) {
                    empty.push({ row: i, col: j });
                }
            }
        }
        return empty;
    }

    // Add random tile (2 or 4)
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return;

        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[cell.row][cell.col] = value;
    }

    // Setup keyboard and touch input
    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            SoundManager.unlock();
            if (this.over && !this.keepPlaying) return;
            if (!document.getElementById('game-screen').classList.contains('active')) return;

            let moved = false;
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = this.move('right');
                    break;
            }

            if (moved) {
                this.afterMove();
            }
        });

        // Touch
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const gameContainer = document.getElementById('game-container');

        gameContainer.addEventListener('touchstart', (e) => {
            SoundManager.unlock();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        gameContainer.addEventListener('touchend', (e) => {
            if (this.over && !this.keepPlaying) return;

            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipe = 30;

            let moved = false;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipe) {
                    if (deltaX > 0) {
                        moved = this.move('right');
                    } else {
                        moved = this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipe) {
                    if (deltaY > 0) {
                        moved = this.move('down');
                    } else {
                        moved = this.move('up');
                    }
                }
            }

            if (moved) {
                this.afterMove();
            }
        }, { passive: true });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Action buttons
        document.getElementById('home-btn').addEventListener('click', () => this.showPauseMenu());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('sound-btn').addEventListener('click', () => SoundManager.toggle());
        document.getElementById('share-btn').addEventListener('click', () => this.share());
        document.getElementById('rate-btn').addEventListener('click', () => this.rate());
    }

    // Share functionality
    share() {
        const shareText = `I scored ${this.score} in 2048: Merge Master! Can you beat me? 🎮`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: '2048: Merge Master',
                text: shareText,
                url: shareUrl
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            const fullText = `${shareText}\n${shareUrl}`;
            navigator.clipboard.writeText(fullText).then(() => {
                alert('Score copied to clipboard! Share it with your friends.');
            }).catch(() => {
                alert(shareText);
            });
        }
    }

    // Rate functionality
    rate() {
        // These will be updated with actual store links after publishing
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS) {
            // Replace with actual App Store link after publishing
            alert('Thank you! App Store rating will be available soon.');
            // window.open('https://apps.apple.com/app/idXXXXXXXXX', '_blank');
        } else if (isAndroid) {
            // Replace with actual Play Store link after publishing
            alert('Thank you! Play Store rating will be available soon.');
            // window.open('https://play.google.com/store/apps/details?id=com.yourname.mergemaster', '_blank');
        } else {
            alert('Thank you for wanting to rate us! Rating will be available on mobile app stores soon.');
        }
    }

    // Move tiles
    move(direction) {
        // Save state before move for undo
        this.saveState();

        let moved = false;

        const vectors = {
            up: { row: -1, col: 0 },
            down: { row: 1, col: 0 },
            left: { row: 0, col: -1 },
            right: { row: 0, col: 1 }
        };

        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);

        const previousGrid = this.grid.map(row => [...row]);

        const merged = [];
        for (let i = 0; i < this.size; i++) {
            merged[i] = [];
            for (let j = 0; j < this.size; j++) {
                merged[i][j] = false;
            }
        }

        traversals.rows.forEach(row => {
            traversals.cols.forEach(col => {
                const value = this.grid[row][col];
                if (value !== null) {
                    const positions = this.findFarthestPosition(row, col, vector);
                    const next = positions.next;

                    if (next && this.grid[next.row][next.col] === value && !merged[next.row][next.col]) {
                        const newValue = value * 2;
                        this.grid[next.row][next.col] = newValue;
                        this.grid[row][col] = null;
                        merged[next.row][next.col] = true;

                        this.score += newValue;
                        SoundManager.playMerge();

                        if (newValue === 2048 && !this.won) {
                            this.won = true;
                        }
                    } else {
                        const farthest = positions.farthest;
                        if (row !== farthest.row || col !== farthest.col) {
                            this.grid[farthest.row][farthest.col] = value;
                            this.grid[row][col] = null;
                            SoundManager.playMove();
                        }
                    }
                }
            });
        });

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (previousGrid[i][j] !== this.grid[i][j]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }

        // If no move was made, don't allow undo
        if (!moved) {
            this.previousState = null;
            this.canUndo = false;
            this.updateUndoButton();
        }

        return moved;
    }

    buildTraversals(vector) {
        const traversals = { rows: [], cols: [] };

        for (let i = 0; i < this.size; i++) {
            traversals.rows.push(i);
            traversals.cols.push(i);
        }

        if (vector.row === 1) traversals.rows.reverse();
        if (vector.col === 1) traversals.cols.reverse();

        return traversals;
    }

    findFarthestPosition(row, col, vector) {
        let previous;
        let currentRow = row;
        let currentCol = col;

        do {
            previous = { row: currentRow, col: currentCol };
            currentRow += vector.row;
            currentCol += vector.col;
        } while (this.isWithinBounds(currentRow, currentCol) && this.grid[currentRow][currentCol] === null);

        return {
            farthest: previous,
            next: this.isWithinBounds(currentRow, currentCol) ? { row: currentRow, col: currentCol } : null
        };
    }

    isWithinBounds(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    afterMove() {
        this.addRandomTile();
        this.updateScore();
        this.render();

        if (this.won && !this.keepPlaying) {
            this.showWin();
        } else if (!this.movesAvailable()) {
            this.over = true;
            this.showGameOver();
            Game.clearSavedGame();
        } else {
            this.saveGameState();
        }
    }

    movesAvailable() {
        if (this.getEmptyCells().length > 0) return true;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (j < this.size - 1 && this.grid[i][j + 1] === value) return true;
                if (i < this.size - 1 && this.grid[i + 1][j] === value) return true;
            }
        }

        return false;
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(`mergeMasterBest_${this.size}`, this.bestScore);
            this.updateBestScore();
        }
    }

    updateBestScore() {
        this.bestScoreDisplay.textContent = this.bestScore;
    }

    showGameOver() {
        this.finalScoreDisplay.textContent = this.score;
        this.gameOverOverlay.classList.add('active');

        // Submit score to leaderboard
        if (GameServices.isSignedIn) {
            GameServices.submitScore(this.size, this.score);
        }
    }

    showWin() {
        this.gameWinOverlay.classList.add('active');
    }

    render() {
        this.clearTiles();

        // Get all grid cells
        const cells = this.gridBackground.querySelectorAll('.grid-cell');
        if (cells.length === 0) return;

        const containerRect = this.tileContainer.getBoundingClientRect();

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value !== null) {
                    const cellIndex = i * this.size + j;
                    const cell = cells[cellIndex];
                    const cellRect = cell.getBoundingClientRect();

                    // Calculate position relative to tile container
                    const x = cellRect.left - containerRect.left;
                    const y = cellRect.top - containerRect.top;
                    const cellSize = cellRect.width;

                    this.createTile(value, x, y, cellSize);
                }
            }
        }
    }

    createTile(value, x, y, cellSize) {
        const tile = document.createElement('div');
        tile.className = 'tile';

        tile.style.width = cellSize + 'px';
        tile.style.height = cellSize + 'px';
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';

        let fontSize = cellSize * 0.5;
        if (value >= 100) fontSize = cellSize * 0.4;
        if (value >= 1000) fontSize = cellSize * 0.3;
        tile.style.fontSize = fontSize + 'px';

        if (value <= 2048) {
            tile.classList.add('tile-' + value);
        } else {
            tile.classList.add('tile-super');
        }

        tile.textContent = value;
        tile.classList.add('tile-new');

        this.tileContainer.appendChild(tile);
    }
}

// ==========================================
// START SCREEN LOGIC
// ==========================================

let game;
let selectedSize = 4;

document.addEventListener('DOMContentLoaded', () => {
    // Grid size selection
    const gridOptions = document.querySelectorAll('.grid-option');
    gridOptions.forEach(option => {
        option.addEventListener('click', () => {
            gridOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedSize = parseInt(option.dataset.size);
        });
    });

    // Start button
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        game = new Game(selectedSize);
    });

    // Check for saved game and show resume popup
    const savedState = Game.loadGameState();
    if (savedState && !savedState.over) {
        document.getElementById('resume-grid-size').textContent = savedState.size + 'x' + savedState.size;
        document.getElementById('resume-saved-score').textContent = savedState.score.toLocaleString();
        document.getElementById('resume-modal').classList.add('active');
    }

    // Resume button — load saved state
    document.getElementById('resume-btn').addEventListener('click', () => {
        const state = Game.loadGameState();
        if (state) {
            document.getElementById('resume-modal').classList.remove('active');
            document.getElementById('start-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            game = new Game(state.size);
            game.restoreState(state);
        }
    });

    // New Game button from resume popup — clear saved state, show start screen
    document.getElementById('resume-new-btn').addEventListener('click', () => {
        Game.clearSavedGame();
        document.getElementById('resume-modal').classList.remove('active');
    });
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker not registered', err));
    });
}

// Auto-save on visibility change / page close
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && game && !game.over) {
        game.submitIfBest();
        game.saveGameState();
    }
});

window.addEventListener('beforeunload', () => {
    if (game && !game.over) {
        game.submitIfBest();
        game.saveGameState();
    }
});

window.addEventListener('pagehide', () => {
    if (game && !game.over) {
        game.submitIfBest();
        game.saveGameState();
    }
});

// Keep game container square on resize
window.addEventListener('resize', () => {
    const container = document.getElementById('game-container');
    if (container) {
        const width = container.offsetWidth;
        container.style.height = width + 'px';
        if (game) game.render();
    }
});

console.log('2048: Merge Master loaded successfully!');

// ==========================================
// GAME SERVICES (Game Center / Google Play Games / Firebase)
// ==========================================

const GameServices = {
    isSignedIn: false,
    playerName: 'Player',
    playerPhoto: null,
    playerId: null,
    platform: null, // 'ios', 'android', or 'web'
    db: null, // Firestore instance

    // Leaderboard IDs for each grid size (used by native platforms)
    leaderboardIds: {
        3: 'leaderboard_3x3',
        4: 'leaderboard_4x4',
        5: 'leaderboard_5x5',
        6: 'leaderboard_6x6',
        8: 'leaderboard_8x8'
    },

    init() {
        // Detect platform
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            this.platform = window.Capacitor.getPlatform(); // 'ios' or 'android'
        } else {
            this.platform = 'web';
        }

        // Initialize Firebase for web
        if (this.platform === 'web' && typeof firebase !== 'undefined') {
            try {
                // ============================================================
                // FIREBASE SETUP INSTRUCTIONS:
                // 1. Go to https://console.firebase.google.com
                // 2. Create a new project (or use an existing one)
                // 3. Go to Project Settings > General > Your apps > Add web app
                // 4. Copy the firebaseConfig object and replace the values below
                // 5. Go to Authentication > Sign-in method > Enable Google
                // 6. Go to Firestore Database > Create database (start in test mode)
                // ============================================================
                const firebaseConfig = {
                    apiKey: "AIzaSyDGL6qLoaDy7b2wawJgFzFCp3EjJDh7v4I",
                    authDomain: "merge-master-758475.firebaseapp.com",
                    projectId: "merge-master-758475",
                    storageBucket: "merge-master-758475.firebasestorage.app",
                    messagingSenderId: "907658519254",
                    appId: "1:907658519254:web:cdfe22e8af1d37beefdf77"
                };

                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                this.db = firebase.firestore();

                // Listen for auth state changes
                firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        this.isSignedIn = true;
                        this.playerName = user.displayName || 'Player';
                        this.playerPhoto = user.photoURL || null;
                        this.playerId = user.uid;
                    } else {
                        this.isSignedIn = false;
                        this.playerName = 'Player';
                        this.playerPhoto = null;
                        this.playerId = null;
                    }
                });
            } catch (error) {
                console.error('Firebase init error:', error);
            }
        }

        console.log('GameServices initialized on platform:', this.platform);
    },

    _isFirebaseConfigured() {
        try {
            const app = firebase.app();
            const config = app.options;
            return config.apiKey && config.apiKey !== 'YOUR_API_KEY';
        } catch (e) {
            return false;
        }
    },

    async signIn() {
        try {
            if (this.platform === 'ios') {
                // Game Center sign in
                if (window.GameCenter) {
                    const result = await window.GameCenter.signIn();
                    if (result.isAuthenticated) {
                        this.isSignedIn = true;
                        this.playerName = result.displayName || 'Player';
                        this.playerId = result.playerId;
                    }
                }
            } else if (this.platform === 'android') {
                // Google Play Games sign in
                if (window.PlayGames) {
                    const result = await window.PlayGames.signIn();
                    if (result.isAuthenticated) {
                        this.isSignedIn = true;
                        this.playerName = result.displayName || 'Player';
                        this.playerId = result.playerId;
                    }
                }
            } else {
                // Web — Firebase Google sign-in
                if (typeof firebase === 'undefined' || !this._isFirebaseConfigured()) {
                    alert('Firebase is not configured yet. Please add your Firebase config to game.js. See the FIREBASE SETUP INSTRUCTIONS comment.');
                    return false;
                }

                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);
                const user = result.user;
                this.isSignedIn = true;
                this.playerName = user.displayName || 'Player';
                this.playerPhoto = user.photoURL || null;
                this.playerId = user.uid;

                // Submit existing localStorage best scores to Firestore
                await this._syncLocalScores();
            }
            return this.isSignedIn;
        } catch (error) {
            console.error('Sign in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                // User closed the popup, not an error
                return false;
            }
            alert('Sign in failed: ' + error.message);
            return false;
        }
    },

    // Sync all localStorage best scores to Firestore on first sign-in
    async _syncLocalScores() {
        if (!this.db || !this.playerId) return;

        const gridSizes = [3, 4, 5, 6, 8];
        for (const size of gridSizes) {
            const best = parseInt(localStorage.getItem(`mergeMasterBest_${size}`)) || 0;
            if (best > 0) {
                await this.submitScore(size, best);
            }
        }
    },

    async submitScore(gridSize, score) {
        if (!this.isSignedIn) return false;
        if (score <= 0) return false;

        try {
            if (this.platform === 'ios' && window.GameCenter) {
                const leaderboardId = this.leaderboardIds[gridSize];
                if (!leaderboardId) return false;
                await window.GameCenter.submitScore({
                    leaderboardId: leaderboardId,
                    score: score
                });
            } else if (this.platform === 'android' && window.PlayGames) {
                const leaderboardId = this.leaderboardIds[gridSize];
                if (!leaderboardId) return false;
                await window.PlayGames.submitScore({
                    leaderboardId: leaderboardId,
                    score: score
                });
            } else if (this.db && this.playerId) {
                // Web — write to Firestore
                const docId = `${this.playerId}_${gridSize}`;
                const docRef = this.db.collection('scores').doc(docId);
                const existing = await docRef.get();

                // Only update if new score is higher
                if (existing.exists && existing.data().score >= score) {
                    return true; // Already have a better score
                }

                await docRef.set({
                    uid: this.playerId,
                    playerName: this.playerName,
                    photoURL: this.playerPhoto || '',
                    gridSize: gridSize,
                    score: score,
                    timestamp: Date.now()
                });
            }
            return true;
        } catch (error) {
            console.error('Submit score error:', error);
            return false;
        }
    },

    async getLeaderboard(gridSize, type = 'global') {
        try {
            if (this.platform === 'ios' && window.GameCenter) {
                const leaderboardId = this.leaderboardIds[gridSize];
                if (!leaderboardId) return [];
                const result = await window.GameCenter.loadLeaderboardScores({
                    leaderboardId: leaderboardId,
                    scope: type === 'personal' ? 'friends' : 'global',
                    timeSpan: 'allTime',
                    maxResults: 25
                });
                return result.scores || [];
            } else if (this.platform === 'android' && window.PlayGames) {
                const leaderboardId = this.leaderboardIds[gridSize];
                if (!leaderboardId) return [];
                const result = await window.PlayGames.loadLeaderboardScores({
                    leaderboardId: leaderboardId,
                    collection: type === 'personal' ? 'friends' : 'public',
                    timeSpan: 'allTime',
                    maxResults: 25
                });
                return result.scores || [];
            } else if (this.db) {
                // Web — query Firestore
                if (type === 'personal') {
                    return await this._getPersonalScores();
                } else {
                    return await this._getGlobalScores(gridSize);
                }
            }
            return [];
        } catch (error) {
            console.error('Get leaderboard error:', error);
            return [];
        }
    },

    async _getGlobalScores(gridSize) {
        const snapshot = await this.db.collection('scores')
            .where('gridSize', '==', gridSize)
            .orderBy('score', 'desc')
            .limit(25)
            .get();

        return snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                rank: index + 1,
                player: data.playerName || 'Player',
                score: data.score,
                photoURL: data.photoURL || '',
                isCurrentPlayer: data.uid === this.playerId
            };
        });
    },

    async _getPersonalScores() {
        if (!this.playerId) return [];

        const snapshot = await this.db.collection('scores')
            .where('uid', '==', this.playerId)
            .orderBy('score', 'desc')
            .get();

        return snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                rank: index + 1,
                player: `${data.gridSize}×${data.gridSize}`,
                score: data.score,
                isCurrentPlayer: true
            };
        });
    },

    showNativeLeaderboard(gridSize) {
        const leaderboardId = this.leaderboardIds[gridSize];
        if (!leaderboardId) return;

        try {
            if (this.platform === 'ios' && window.GameCenter) {
                window.GameCenter.showLeaderboard({ leaderboardId: leaderboardId });
            } else if (this.platform === 'android' && window.PlayGames) {
                window.PlayGames.showLeaderboard({ leaderboardId: leaderboardId });
            }
        } catch (error) {
            console.error('Show leaderboard error:', error);
        }
    }
};

// ==========================================
// LEADERBOARD UI
// ==========================================

const LeaderboardUI = {
    modal: null,
    currentType: 'global',
    currentGrid: 4,

    init() {
        this.modal = document.getElementById('leaderboard-modal');
        this.setupEventListeners();
        GameServices.init();
    },

    setupEventListeners() {
        // Open leaderboard
        document.getElementById('highscore-btn').addEventListener('click', () => {
            this.open();
        });

        // Close leaderboard
        document.getElementById('leaderboard-close').addEventListener('click', () => {
            this.close();
        });

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Sign in button
        document.getElementById('signin-btn').addEventListener('click', async () => {
            const success = await GameServices.signIn();
            if (success) {
                this.loadScores();
            }
        });

        // Toggle buttons (Global / My Scores)
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentType = btn.dataset.type;
                // Hide grid tabs for personal scores (shows all grid sizes)
                const gridTabs = document.querySelector('.grid-tabs');
                if (this.currentType === 'personal') {
                    gridTabs.style.display = 'none';
                } else {
                    gridTabs.style.display = '';
                }
                this.loadScores();
            });
        });

        // Grid tabs
        document.querySelectorAll('.grid-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.grid-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentGrid = parseInt(tab.dataset.grid);
                this.loadScores();
                this.updatePlayerBest();
            });
        });
    },

    open() {
        // Set current grid to match game grid if playing
        if (game && game.size) {
            this.currentGrid = game.size;
            document.querySelectorAll('.grid-tab').forEach(t => {
                t.classList.toggle('active', parseInt(t.dataset.grid) === this.currentGrid);
            });
        }

        // Reset to global tab and show grid tabs
        this.currentType = 'global';
        document.querySelectorAll('.toggle-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === 'global');
        });
        document.querySelector('.grid-tabs').style.display = '';

        this.modal.classList.add('active');
        this.updatePlayerBest();

        if (GameServices.isSignedIn) {
            this.loadScores();
        }
    },

    close() {
        this.modal.classList.remove('active');
    },

    async loadScores() {
        const scoresList = document.getElementById('scores-list');

        if (!GameServices.isSignedIn) {
            scoresList.innerHTML = `
                <div class="score-loading">
                    <p>Sign in to view leaderboards</p>
                    <button class="btn" id="signin-btn">Sign In</button>
                </div>
            `;
            document.getElementById('signin-btn').addEventListener('click', async () => {
                const success = await GameServices.signIn();
                if (success) {
                    this.loadScores();
                }
            });
            return;
        }

        // Show loading
        scoresList.innerHTML = '<div class="score-loading"><p>Loading...</p></div>';

        const scores = await GameServices.getLeaderboard(this.currentGrid, this.currentType);

        if (scores.length === 0) {
            const emptyMsg = this.currentType === 'personal'
                ? 'No scores yet. Play some games!'
                : 'No scores yet. Be the first!';
            scoresList.innerHTML = `
                <div class="score-loading">
                    <p>${emptyMsg}</p>
                </div>
            `;
            return;
        }

        scoresList.innerHTML = scores.map((score, index) => `
            <div class="score-item ${score.isCurrentPlayer ? 'current-player' : ''}">
                <div class="score-rank">${score.rank || index + 1}</div>
                <div class="score-player">${score.player || 'Player'}</div>
                <div class="score-points">${score.score.toLocaleString()}</div>
            </div>
        `).join('');
    },

    updatePlayerBest() {
        const bestScore = parseInt(localStorage.getItem(`mergeMasterBest_${this.currentGrid}`)) || 0;
        document.getElementById('player-best').textContent = bestScore.toLocaleString();
    }
};

// Initialize leaderboard UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LeaderboardUI.init();
});
