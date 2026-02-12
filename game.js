/* ==========================================
   2048: MERGE MASTER - Game Logic
   ========================================== */

// ==========================================
// THEME MANAGER
// ==========================================
const ThemeManager = {
    themes: [
        { id: 'classic', name: 'Classic', colors: ['#faf8ef', '#edc22e', '#8f7a66', '#bbada0'] },
        { id: 'dark', name: 'Dark', colors: ['#1a1a2e', '#e2b714', '#2d2d44', '#333355'] },
        { id: 'ocean', name: 'Ocean', colors: ['#e8f4f8', '#1abc9c', '#2980b9', '#5dade2'] },
        { id: 'forest', name: 'Forest', colors: ['#f0f5e9', '#d4a017', '#4a7c2e', '#7daa68'] },
        { id: 'sunset', name: 'Sunset', colors: ['#fff5eb', '#f39c12', '#e74c3c', '#f0a070'] },
        { id: 'neon', name: 'Neon', colors: ['#0a0a0a', '#00ff88', '#ff00ff', '#1a1a2e'] }
    ],
    current: 'classic',

    init() {
        this.current = localStorage.getItem('mergeMasterTheme') || 'classic';
        this.apply(this.current);
        this.renderModal();
        this.setupEvents();
    },

    apply(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;
        this.current = themeId;
        if (themeId === 'classic') {
            delete document.body.dataset.theme;
        } else {
            document.body.dataset.theme = themeId;
        }
        localStorage.setItem('mergeMasterTheme', themeId);
        this.updateActiveState();
    },

    renderModal() {
        const grid = document.getElementById('theme-grid');
        if (!grid) return;
        grid.innerHTML = this.themes.map(t => `
            <div class="theme-option ${t.id === this.current ? 'active' : ''}" data-theme-id="${t.id}">
                <div class="theme-preview">
                    ${t.colors.map(c => `<div class="theme-swatch" style="background:${c}"></div>`).join('')}
                </div>
                <div class="theme-name">${t.name}</div>
            </div>
        `).join('');
    },

    updateActiveState() {
        document.querySelectorAll('.theme-option').forEach(el => {
            el.classList.toggle('active', el.dataset.themeId === this.current);
        });
    },

    setupEvents() {
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.renderModal();
            document.getElementById('theme-modal').classList.add('active');
        });

        document.getElementById('theme-close').addEventListener('click', () => {
            document.getElementById('theme-modal').classList.remove('active');
        });

        document.getElementById('theme-modal').addEventListener('click', (e) => {
            if (e.target.id === 'theme-modal') {
                document.getElementById('theme-modal').classList.remove('active');
            }
        });

        document.getElementById('theme-grid').addEventListener('click', (e) => {
            const option = e.target.closest('.theme-option');
            if (option) {
                this.apply(option.dataset.themeId);
            }
        });
    }
};

// ==========================================
// ACHIEVEMENTS
// ==========================================
const Achievements = {
    list: [
        { id: 'first_win', name: 'First Victory', desc: 'Reach 2048 for the first time', icon: '🏅' },
        { id: 'score_5k', name: 'Getting Started', desc: 'Score 5,000 points', icon: '⭐' },
        { id: 'score_10k', name: 'Score Master', desc: 'Score 10,000 points', icon: '🌟' },
        { id: 'score_50k', name: 'Legend', desc: 'Score 50,000 points', icon: '💫' },
        { id: 'tile_4096', name: 'Beyond 2048', desc: 'Create a 4096 tile', icon: '🔥' },
        { id: 'tile_8192', name: 'Tile Titan', desc: 'Create an 8192 tile', icon: '💎' },
        { id: 'win_3x3', name: 'Small but Mighty', desc: 'Win on 3×3 grid', icon: '🎯' },
        { id: 'win_5x5', name: 'Explorer', desc: 'Win on 5×5 grid', icon: '🧭' },
        { id: 'win_6x6', name: 'Ambitious', desc: 'Win on 6×6 grid', icon: '🚀' },
        { id: 'win_8x8', name: 'Grandmaster', desc: 'Win on 8×8 grid', icon: '👑' },
        { id: 'all_grids', name: 'Grid Collector', desc: 'Win on all grid sizes', icon: '🏆' },
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Score 2048+ in Time Attack', icon: '⚡' },
        { id: 'daily_first', name: 'Daily Player', desc: 'Complete a daily challenge', icon: '📅' },
        { id: 'daily_streak_7', name: 'Weekly Warrior', desc: 'Complete 7 daily challenges', icon: '🔥' },
        { id: 'no_undo', name: 'Purist', desc: 'Win without using undo', icon: '🎖️' }
    ],
    unlocked: new Set(),
    undoUsed: false,

    init() {
        try {
            const saved = localStorage.getItem('mergeMasterAchievements');
            if (saved) {
                this.unlocked = new Set(JSON.parse(saved));
            }
        } catch (e) { /* ignore */ }
        this.setupEvents();
    },

    setupEvents() {
        document.getElementById('achievements-btn').addEventListener('click', () => {
            this.renderModal();
            document.getElementById('achievements-modal').classList.add('active');
        });

        document.getElementById('achievements-close').addEventListener('click', () => {
            document.getElementById('achievements-modal').classList.remove('active');
        });

        document.getElementById('achievements-modal').addEventListener('click', (e) => {
            if (e.target.id === 'achievements-modal') {
                document.getElementById('achievements-modal').classList.remove('active');
            }
        });
    },

    renderModal() {
        const grid = document.getElementById('achievements-grid');
        const progress = document.getElementById('achievements-progress');
        progress.textContent = `${this.unlocked.size} / ${this.list.length} Unlocked`;

        grid.innerHTML = this.list.map(a => `
            <div class="achievement-card ${this.unlocked.has(a.id) ? '' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${a.name}</div>
                    <div class="achievement-desc">${a.desc}</div>
                </div>
                ${this.unlocked.has(a.id) ? '<div class="achievement-check">✓</div>' : ''}
            </div>
        `).join('');
    },

    unlock(id) {
        if (this.unlocked.has(id)) return;
        const achievement = this.list.find(a => a.id === id);
        if (!achievement) return;

        this.unlocked.add(id);
        localStorage.setItem('mergeMasterAchievements', JSON.stringify([...this.unlocked]));
        this.showPopup(achievement);
    },

    showPopup(achievement) {
        const popup = document.getElementById('achievement-popup');
        document.getElementById('achievement-popup-icon').textContent = achievement.icon;
        document.getElementById('achievement-popup-title').textContent = achievement.name;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 3000);
    },

    checkScore(score) {
        if (score >= 5000) this.unlock('score_5k');
        if (score >= 10000) this.unlock('score_10k');
        if (score >= 50000) this.unlock('score_50k');
    },

    checkWin(size, mode) {
        this.unlock('first_win');
        if (size === 3) this.unlock('win_3x3');
        if (size === 5) this.unlock('win_5x5');
        if (size === 6) this.unlock('win_6x6');
        if (size === 8) this.unlock('win_8x8');

        // Check all_grids
        const winSizes = [3, 5, 6, 8]; // 4 is default, check wins on special sizes
        const allWon = winSizes.every(s => this.unlocked.has(`win_${s}x${s}`));
        if (allWon && this.unlocked.has('first_win')) {
            this.unlock('all_grids');
        }

        // Purist: win without undo
        if (!this.undoUsed) {
            this.unlock('no_undo');
        }
    },

    checkTile(value) {
        if (value >= 4096) this.unlock('tile_4096');
        if (value >= 8192) this.unlock('tile_8192');
    },

    checkTimeAttack(score) {
        if (score >= 2048) this.unlock('speed_demon');
    },

    checkDaily() {
        this.unlock('daily_first');
        // Check streak
        const count = DailyChallenge.getCompletedCount();
        if (count >= 7) this.unlock('daily_streak_7');
    }
};

// ==========================================
// DAILY CHALLENGE
// ==========================================
const DailyChallenge = {
    getToday() {
        const seed = new Date().toISOString().slice(0, 10); // "2026-02-11"
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        hash = Math.abs(hash);
        const sizes = [3, 4, 5, 6, 8];
        const gridSize = sizes[hash % 5];
        const targets = { 3: 5000, 4: 10000, 5: 15000, 6: 20000, 8: 30000 };
        return {
            date: seed,
            gridSize: gridSize,
            targetScore: targets[gridSize]
        };
    },

    isCompleted() {
        const today = this.getToday();
        return localStorage.getItem(`mergeMasterDaily_${today.date}`) !== null;
    },

    complete(score) {
        const today = this.getToday();
        localStorage.setItem(`mergeMasterDaily_${today.date}`, score);

        // Submit to Firestore
        if (GameServices.isSignedIn && GameServices.db) {
            const docId = `${GameServices.playerId}_${today.date}`;
            GameServices.db.collection('daily_scores').doc(docId).set({
                uid: GameServices.playerId,
                playerName: GameServices.playerName,
                score: score,
                gridSize: today.gridSize,
                date: today.date,
                timestamp: Date.now()
            }).catch(e => console.error('Daily score submit error:', e));
        }

        Achievements.checkDaily();
    },

    getCompletedCount() {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('mergeMasterDaily_')) count++;
        }
        return count;
    },

    start() {
        if (this.isCompleted()) {
            alert('You already completed today\'s challenge! Come back tomorrow.');
            return;
        }
        const today = this.getToday();
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        game = new Game(today.gridSize, 'daily');
    },

    updateButton() {
        const btn = document.getElementById('daily-btn');
        const info = document.getElementById('daily-info');
        const today = this.getToday();

        if (this.isCompleted()) {
            btn.classList.add('completed');
            info.textContent = `${today.gridSize}×${today.gridSize} — Completed ✓`;
        } else {
            btn.classList.remove('completed');
            info.textContent = `${today.gridSize}×${today.gridSize} — Target: ${today.targetScore.toLocaleString()}`;
        }
    }
};

// ==========================================
// MULTIPLAYER
// ==========================================
const Multiplayer = {
    currentCode: null,
    unsubscribe: null,
    selectedTimer: 60,

    generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    async createRoom() {
        if (!GameServices.isSignedIn) {
            const ok = await GameServices.signIn();
            if (!ok) return;
        }

        if (!GameServices.db) {
            alert('Database not available. Please check your connection.');
            return;
        }

        const code = this.generateCode();
        const gridSize = selectedSize;
        const timerDuration = this.selectedTimer;

        try {
            await GameServices.db.collection('challenges').doc(code).set({
                gridSize: gridSize,
                timerDuration: timerDuration,
                createdBy: GameServices.playerId,
                player1: {
                    uid: GameServices.playerId,
                    name: GameServices.playerName,
                    photo: GameServices.playerPhoto || ''
                },
                player2: null,
                status: 'waiting',
                createdAt: Date.now()
            });

            this.currentCode = code;

            // Show room code in the modal
            const content = document.getElementById('multiplayer-content');
            content.innerHTML = `
                <h2>Room Created!</h2>
                <p>Share this code with your opponent:</p>
                <div class="room-code-display" id="mp-room-code" title="Tap to copy">${code}</div>
                <p class="mp-status">${gridSize}×${gridSize} grid · ${timerDuration}s timer</p>
                <p class="mp-status">Waiting for opponent to join...</p>
                <div class="mp-spinner"></div>
                <button class="mp-close" id="mp-cancel-room">Cancel</button>
            `;

            document.getElementById('mp-room-code').addEventListener('click', () => {
                navigator.clipboard.writeText(code).catch(() => {});
            });

            document.getElementById('mp-cancel-room').addEventListener('click', () => {
                this.cleanup();
                this.resetModal();
                document.getElementById('multiplayer-modal').classList.remove('active');
            });

            // Listen for player2 to join
            this.unsubscribe = GameServices.db.collection('challenges').doc(code)
                .onSnapshot((doc) => {
                    const data = doc.data();
                    if (data && data.player2 && data.status === 'playing') {
                        // Player2 joined, start the game
                        document.getElementById('multiplayer-modal').classList.remove('active');
                        document.getElementById('start-screen').classList.remove('active');
                        document.getElementById('game-screen').classList.add('active');
                        game = new Game(data.gridSize, 'multiplayer', data.timerDuration || 60);
                        game.multiplayerCode = code;
                        if (this.unsubscribe) {
                            this.unsubscribe();
                            this.unsubscribe = null;
                        }
                    }
                });
        } catch (e) {
            console.error('Create room error:', e);
            alert('Failed to create room: ' + e.message);
        }
    },

    async joinRoom(code) {
        if (!GameServices.isSignedIn) {
            const ok = await GameServices.signIn();
            if (!ok) return;
        }

        code = code.toUpperCase().trim();
        if (code.length !== 6) {
            alert('Please enter a valid 6-character room code.');
            return;
        }

        try {
            const docRef = GameServices.db.collection('challenges').doc(code);
            const doc = await docRef.get();

            if (!doc.exists) {
                alert('Room not found. Check the code and try again.');
                return;
            }

            const data = doc.data();

            if (data.status !== 'waiting') {
                alert('This room is no longer available.');
                return;
            }

            if (data.createdBy === GameServices.playerId) {
                alert('You cannot join your own room.');
                return;
            }

            // Join the room
            await docRef.update({
                player2: {
                    uid: GameServices.playerId,
                    name: GameServices.playerName,
                    photo: GameServices.playerPhoto || ''
                },
                status: 'playing'
            });

            this.currentCode = code;
            document.getElementById('multiplayer-modal').classList.remove('active');
            document.getElementById('start-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            game = new Game(data.gridSize, 'multiplayer', data.timerDuration || 60);
            game.multiplayerCode = code;
        } catch (e) {
            console.error('Join room error:', e);
            alert('Failed to join room. Please try again.');
        }
    },

    async submitScore(code, score) {
        if (!GameServices.isSignedIn || !GameServices.db) return;

        try {
            await GameServices.db.collection('challenges').doc(code)
                .collection('scores').doc(GameServices.playerId).set({
                    score: score,
                    timestamp: Date.now()
                });

            // Check if both players have submitted
            this.listenForResults(code, score);
        } catch (e) {
            console.error('Submit MP score error:', e);
        }
    },

    listenForResults(code, myScore) {
        // Show waiting overlay
        const waitOverlay = document.getElementById('mp-waiting-overlay');
        document.getElementById('mp-waiting-title').textContent = 'Game Over!';
        document.getElementById('mp-waiting-text').textContent = 'Waiting for opponent to finish...';
        waitOverlay.classList.add('active');

        document.getElementById('mp-waiting-menu').onclick = () => {
            waitOverlay.classList.remove('active');
            this.cleanup();
            if (game) game.backToMenu();
        };

        const scoresRef = GameServices.db.collection('challenges').doc(code).collection('scores');
        this.unsubscribe = scoresRef.onSnapshot(async (snapshot) => {
            if (snapshot.size >= 2) {
                // Both players have submitted
                waitOverlay.classList.remove('active');

                const challengeDoc = await GameServices.db.collection('challenges').doc(code).get();
                const challengeData = challengeDoc.data();

                let p1Score = 0, p2Score = 0;
                let p1Name = 'Player 1', p2Name = 'Player 2';

                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (doc.id === challengeData.player1.uid) {
                        p1Score = data.score;
                        p1Name = challengeData.player1.name;
                    } else {
                        p2Score = data.score;
                        p2Name = challengeData.player2 ? challengeData.player2.name : 'Player 2';
                    }
                });

                // Update room status
                GameServices.db.collection('challenges').doc(code).update({ status: 'finished' }).catch(() => {});

                this.showResults(p1Name, p1Score, p2Name, p2Score);

                if (this.unsubscribe) {
                    this.unsubscribe();
                    this.unsubscribe = null;
                }
            }
        });
    },

    showResults(p1Name, p1Score, p2Name, p2Score) {
        const resultsOverlay = document.getElementById('mp-results-overlay');
        document.getElementById('mp-p1-name').textContent = p1Name;
        document.getElementById('mp-p1-points').textContent = p1Score.toLocaleString();
        document.getElementById('mp-p2-name').textContent = p2Name;
        document.getElementById('mp-p2-points').textContent = p2Score.toLocaleString();

        const p1El = document.getElementById('mp-p1-score');
        const p2El = document.getElementById('mp-p2-score');
        p1El.classList.remove('winner');
        p2El.classList.remove('winner');

        if (p1Score > p2Score) {
            p1El.classList.add('winner');
            document.getElementById('mp-result-title').textContent = `${p1Name} Wins!`;
        } else if (p2Score > p1Score) {
            p2El.classList.add('winner');
            document.getElementById('mp-result-title').textContent = `${p2Name} Wins!`;
        } else {
            document.getElementById('mp-result-title').textContent = "It's a Tie!";
        }

        resultsOverlay.classList.add('active');
    },

    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.currentCode = null;
    },

    resetModal() {
        this.selectedTimer = 60;
        const content = document.getElementById('multiplayer-content');
        const signedIn = GameServices.isSignedIn;
        const signInSection = signedIn
            ? `<p style="font-size:0.8rem;color:var(--accent-color);margin-bottom:10px;">Signed in as ${GameServices.playerName}</p>`
            : `<div style="margin-bottom:15px;">
                   <p style="margin-bottom:8px;">Sign in to play multiplayer</p>
                   <button class="btn" id="mp-signin-btn">Sign In</button>
               </div>`;

        content.innerHTML = `
            <h2>Multiplayer</h2>
            ${signInSection}
            <p>Timed challenge! Both play the same grid and timer.</p>
            <div class="mp-timer-pick">
                <p style="font-size:0.85rem;margin-bottom:8px;color:var(--text-color);opacity:0.8;">Timer Duration:</p>
                <div class="mp-timer-options">
                    <button class="mp-timer-opt" data-seconds="30">30s</button>
                    <button class="mp-timer-opt active" data-seconds="60">60s</button>
                    <button class="mp-timer-opt" data-seconds="90">90s</button>
                    <button class="mp-timer-opt" data-seconds="120">120s</button>
                </div>
            </div>
            <div class="mp-actions">
                <button class="btn" id="mp-create-btn">Create Room</button>
                <div class="mp-divider">— or —</div>
                <div class="mp-join-row">
                    <input type="text" class="mp-code-input" id="mp-code-input" placeholder="CODE" maxlength="6">
                    <button class="btn" id="mp-join-btn">Join</button>
                </div>
            </div>
            <button class="mp-close" id="mp-close">Cancel</button>
        `;

        if (!signedIn && document.getElementById('mp-signin-btn')) {
            document.getElementById('mp-signin-btn').addEventListener('click', async () => {
                const ok = await GameServices.signIn();
                if (ok) this.resetModal();
            });
        }

        this.setupModalEvents();
    },

    setupModalEvents() {
        document.getElementById('mp-create-btn').addEventListener('click', () => this.createRoom());
        document.getElementById('mp-join-btn').addEventListener('click', () => {
            const code = document.getElementById('mp-code-input').value;
            this.joinRoom(code);
        });
        document.getElementById('mp-close').addEventListener('click', () => {
            document.getElementById('multiplayer-modal').classList.remove('active');
        });

        // Timer picker
        document.querySelectorAll('.mp-timer-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mp-timer-opt').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTimer = parseInt(btn.dataset.seconds);
            });
        });
    },

    init() {
        document.getElementById('multiplayer-btn').addEventListener('click', () => {
            this.resetModal();
            document.getElementById('multiplayer-modal').classList.add('active');
        });

        document.getElementById('multiplayer-modal').addEventListener('click', (e) => {
            if (e.target.id === 'multiplayer-modal') {
                document.getElementById('multiplayer-modal').classList.remove('active');
            }
        });

        document.getElementById('mp-results-menu').addEventListener('click', () => {
            document.getElementById('mp-results-overlay').classList.remove('active');
            this.cleanup();
            if (game) game.backToMenu();
        });
    }
};

// ==========================================
// SOUND MANAGER
// ==========================================
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

// ==========================================
// GAME CLASS
// ==========================================
class Game {
    constructor(size = 4, mode = 'classic', timerDuration = 60) {
        this.size = size;
        this.mode = mode; // 'classic', 'timeattack', 'daily', 'multiplayer'
        this.grid = [];
        this.score = 0;
        this.won = false;
        this.over = false;
        this.keepPlaying = false;
        this.multiplayerCode = null;

        // Best score key depends on mode
        const bestKey = (mode === 'timeattack' || mode === 'multiplayer')
            ? `mergeMasterBest_timeattack_${size}`
            : `mergeMasterBest_${size}`;
        this.bestScoreKey = bestKey;
        this.bestScore = parseInt(localStorage.getItem(bestKey)) || 0;

        // Undo feature
        this.previousState = null;
        this.previousScore = 0;
        this.canUndo = false;

        // Time Attack / Multiplayer timer
        this.timerDuration = timerDuration;
        this.timeRemaining = timerDuration;
        this.timerInterval = null;

        // Track undo usage for achievements
        Achievements.undoUsed = false;

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
        this.timerDisplay = document.getElementById('timer-display');
        this.timerValue = document.getElementById('timer-value');
        this.targetDisplay = document.getElementById('target-display');

        // Initialize sound
        SoundManager.init();

        this.init();
    }

    init() {
        this.buildGrid();
        if (!Game.inputInitialized) {
            this.setupInput();
            Game.inputInitialized = true;
        }
        this.updateBestScore();

        // Setup mode-specific UI
        this.setupModeUI();

        this.startGame();
    }

    setupModeUI() {
        // Timer (for timeattack and multiplayer)
        if (this.mode === 'timeattack' || this.mode === 'multiplayer') {
            this.timerDisplay.classList.add('active');
            this.timerValue.textContent = this.timerDuration;
            this.timerValue.classList.remove('warning');
        } else {
            this.timerDisplay.classList.remove('active');
        }

        // Daily target
        if (this.mode === 'daily') {
            const today = DailyChallenge.getToday();
            this.targetDisplay.classList.add('active');
            document.getElementById('target-score-value').textContent = today.targetScore.toLocaleString();
            // Disable undo in daily mode
            if (this.undoBtn) this.undoBtn.style.display = 'none';
        } else {
            this.targetDisplay.classList.remove('active');
            // Hide undo in multiplayer (fair competition)
            if (this.undoBtn) this.undoBtn.style.display = this.mode === 'multiplayer' ? 'none' : '';
        }
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
        Achievements.undoUsed = false;
        this.updateUndoButton();
        this.updateScore();
        this.hideOverlays();
        this.initGrid();
        this.clearTiles();
        this.addRandomTile();
        this.addRandomTile();
        this.render();

        // Start timer for time attack and multiplayer
        if (this.mode === 'timeattack' || this.mode === 'multiplayer') {
            this.startTimer();
        }
    }

    // Timer methods
    startTimer() {
        this.timeRemaining = this.timerDuration;
        this.timerValue.textContent = this.timerDuration;
        this.timerValue.classList.remove('warning');

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.timerValue.textContent = this.timeRemaining;

            if (this.timeRemaining <= 10) {
                this.timerValue.classList.add('warning');
            }

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.onTimerEnd();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    onTimerEnd() {
        this.over = true;
        if (this.mode === 'timeattack' || this.mode === 'multiplayer') {
            Achievements.checkTimeAttack(this.score);
        }
        this.showGameOver();
        Game.clearSavedGame();
    }

    // Restart game
    restart() {
        this.stopTimer();
        Game.clearSavedGame();
        this.startGame();
    }

    // Save game state to localStorage (only for classic mode)
    saveGameState() {
        if (this.mode !== 'classic') return;
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
        this.stopTimer();
        this.submitIfBest();
        if (this.mode === 'classic') {
            this.saveGameState();
        }
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');
        DailyChallenge.updateButton();
    }

    // Hide all overlays
    hideOverlays() {
        this.gameOverOverlay.classList.remove('active');
        this.gameWinOverlay.classList.remove('active');
        this.gamePauseOverlay.classList.remove('active');
    }

    // Show pause/home menu
    showPauseMenu() {
        if (this.mode === 'timeattack') {
            this.stopTimer();
        }
        this.pauseScoreDisplay.textContent = this.score;
        this.gamePauseOverlay.classList.add('active');
    }

    // Resume game from pause
    resumeGame() {
        this.gamePauseOverlay.classList.remove('active');
        if (this.mode === 'timeattack' && !this.over) {
            // Resume timer
            this.timerInterval = setInterval(() => {
                this.timeRemaining--;
                this.timerValue.textContent = this.timeRemaining;
                if (this.timeRemaining <= 10) {
                    this.timerValue.classList.add('warning');
                }
                if (this.timeRemaining <= 0) {
                    this.stopTimer();
                    this.onTimerEnd();
                }
            }, 1000);
        }
    }

    // Start new game from pause menu
    startNewFromPause() {
        this.stopTimer();
        this.submitIfBest();
        Game.clearSavedGame();
        this.gamePauseOverlay.classList.remove('active');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');
        DailyChallenge.updateButton();
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
        if (this.mode === 'daily') return; // No undo in daily

        Achievements.undoUsed = true;

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

    // Setup keyboard and touch input (called once, uses global `game` reference)
    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            SoundManager.unlock();
            if (!game) return;
            if (game.over && !game.keepPlaying) return;
            if (!document.getElementById('game-screen').classList.contains('active')) return;

            let moved = false;
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = game.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = game.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = game.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = game.move('right');
                    break;
            }

            if (moved) {
                game.afterMove();
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
            if (!game) return;
            if (game.over && !game.keepPlaying) return;

            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipe = 30;

            let moved = false;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipe) {
                    if (deltaX > 0) {
                        moved = game.move('right');
                    } else {
                        moved = game.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipe) {
                    if (deltaY > 0) {
                        moved = game.move('down');
                    } else {
                        moved = game.move('up');
                    }
                }
            }

            if (moved) {
                game.afterMove();
            }
        }, { passive: true });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Action buttons
        document.getElementById('home-btn').addEventListener('click', () => game.showPauseMenu());
        document.getElementById('undo-btn').addEventListener('click', () => game.undo());
        document.getElementById('sound-btn').addEventListener('click', () => SoundManager.toggle());
        document.getElementById('share-btn').addEventListener('click', () => game.share());
        document.getElementById('rate-btn').addEventListener('click', () => game.rate());
    }

    // Share functionality
    share() {
        const modeLabel = this.mode === 'timeattack' ? ' (Time Attack)' : (this.mode === 'daily' ? ' (Daily Challenge)' : '');
        const shareText = `I scored ${this.score} in 2048: Merge Master${modeLabel}! Can you beat me?`;
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
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS) {
            alert('Thank you! App Store rating will be available soon.');
        } else if (isAndroid) {
            alert('Thank you! Play Store rating will be available soon.');
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

                        // Check tile achievements
                        Achievements.checkTile(newValue);

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

        // Check score achievements
        Achievements.checkScore(this.score);

        if (this.won && !this.keepPlaying) {
            Achievements.checkWin(this.size, this.mode);
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
            localStorage.setItem(this.bestScoreKey, this.bestScore);
            this.updateBestScore();
        }
    }

    updateBestScore() {
        this.bestScoreDisplay.textContent = this.bestScore;
    }

    showGameOver() {
        this.stopTimer();

        // Set title based on mode
        const titleEl = document.getElementById('game-over-title');
        if (this.mode === 'timeattack' || this.mode === 'multiplayer') {
            titleEl.textContent = "Time's Up!";
        } else {
            titleEl.textContent = 'Game Over!';
        }

        this.finalScoreDisplay.textContent = this.score;
        this.gameOverOverlay.classList.add('active');

        // Mode-specific end logic
        if (this.mode === 'daily') {
            DailyChallenge.complete(this.score);
        }

        if (this.mode === 'multiplayer' && this.multiplayerCode) {
            Multiplayer.submitScore(this.multiplayerCode, this.score);
        }

        // Submit score to leaderboard
        if (GameServices.isSignedIn) {
            GameServices.submitScore(this.size, this.score);
        }
    }

    showWin() {
        // Mode-specific win logic
        if (this.mode === 'daily') {
            DailyChallenge.complete(this.score);
        }

        Achievements.checkWin(this.size, this.mode);
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
    // Initialize features
    ThemeManager.init();
    Achievements.init();
    Multiplayer.init();
    DailyChallenge.updateButton();

    // Grid size selection
    const gridOptions = document.querySelectorAll('.grid-option');
    gridOptions.forEach(option => {
        option.addEventListener('click', () => {
            gridOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedSize = parseInt(option.dataset.size);
        });
    });

    // Start button (classic mode)
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        game = new Game(selectedSize, 'classic');
    });

    // Time Attack button
    document.getElementById('timeattack-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        game = new Game(selectedSize, 'timeattack');
    });

    // Daily Challenge button
    document.getElementById('daily-btn').addEventListener('click', () => {
        DailyChallenge.start();
    });

    // Scores button on home screen
    document.getElementById('scores-home-btn').addEventListener('click', () => {
        LeaderboardUI.open();
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
                if (window.GameCenter) {
                    const result = await window.GameCenter.signIn();
                    if (result.isAuthenticated) {
                        this.isSignedIn = true;
                        this.playerName = result.displayName || 'Player';
                        this.playerId = result.playerId;
                    }
                }
            } else if (this.platform === 'android') {
                if (window.PlayGames) {
                    const result = await window.PlayGames.signIn();
                    if (result.isAuthenticated) {
                        this.isSignedIn = true;
                        this.playerName = result.displayName || 'Player';
                        this.playerId = result.playerId;
                    }
                }
            } else {
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
                return false;
            }
            alert('Sign in failed: ' + error.message);
            return false;
        }
    },

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
                const docId = `${this.playerId}_${gridSize}`;
                const docRef = this.db.collection('scores').doc(docId);
                const existing = await docRef.get();

                if (existing.exists && existing.data().score >= score) {
                    return true;
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
        if (game && game.size) {
            this.currentGrid = game.size;
            document.querySelectorAll('.grid-tab').forEach(t => {
                t.classList.toggle('active', parseInt(t.dataset.grid) === this.currentGrid);
            });
        }

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
