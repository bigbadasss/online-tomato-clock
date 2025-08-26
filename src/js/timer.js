// Online Tomato - Simple Timer Module

let timer = {
    isRunning: false,
    currentSession: 'focus',
    sessionCount: 0,
    completedSessions: 0,
    timeLeft: 25 * 60, // 25 minutes in seconds
    intervalId: null,
    
    // Settings
    settings: {
        focusTime: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        autoStart: true,
        notifications: true
    },
    
    init: function() {
        console.log('Timer initializing...');
        this.loadSettings();
        this.setupElements();
        this.updateDisplay();
        this.updateSessionInfo();
        this.requestNotificationPermission();
        console.log('Timer initialized successfully');
    },
    
    setupElements: function() {
        console.log('Setting up elements...');
        
        // Get elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.sessionType = document.getElementById('sessionType');
        this.startPauseBtn = document.getElementById('startPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.sessionsCompleted = document.getElementById('sessionsCompleted');
        this.nextSession = document.getElementById('nextSession');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.timerCircle = document.querySelector('.timer-circle');
        
        // Check if buttons exist
        if (!this.startPauseBtn) {
            console.error('Start button not found!');
            return;
        }
        
        // Setup event listeners with direct references
        const self = this;
        
        this.startPauseBtn.onclick = function() {
            console.log('Start button clicked!');
            self.toggleTimer();
        };
        
        this.resetBtn.onclick = function() {
            console.log('Reset button clicked!');
            self.resetTimer();
        };
        
        this.skipBtn.onclick = function() {
            console.log('Skip button clicked!');
            self.skipSession();
        };
        
        // Setup keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName.toLowerCase() !== 'input') {
                switch(e.key.toLowerCase()) {
                    case ' ':
                    case 'enter':
                        e.preventDefault();
                        self.toggleTimer();
                        break;
                    case 'r':
                        e.preventDefault();
                        self.resetTimer();
                        break;
                    case 's':
                        e.preventDefault();
                        self.skipSession();
                        break;
                }
            }
        });
        
        // Setup progress circle
        if (this.progressCircle) {
            this.circleRadius = 120;
            this.circumference = 2 * Math.PI * this.circleRadius;
            this.progressCircle.style.strokeDasharray = this.circumference + ' ' + this.circumference;
            this.progressCircle.style.strokeDashoffset = this.circumference;
        }
        
        console.log('Event listeners setup complete');
    },
    
    loadSettings: function() {
        try {
            const saved = localStorage.getItem('pomodoroSettings');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                this.settings = Object.assign(this.settings, savedSettings);
            }
        } catch (e) {
            console.log('Could not load settings:', e);
        }
        this.applySettings();
    },
    
    applySettings: function() {
        if (!this.isRunning) {
            switch(this.currentSession) {
                case 'focus':
                    this.timeLeft = this.settings.focusTime * 60;
                    break;
                case 'shortBreak':
                    this.timeLeft = this.settings.shortBreak * 60;
                    break;
                case 'longBreak':
                    this.timeLeft = this.settings.longBreak * 60;
                    break;
            }
            this.updateDisplay();
        }
    },
    
    toggleTimer: function() {
        console.log('Toggle timer called, isRunning:', this.isRunning);
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    },
    
    startTimer: function() {
        console.log('Starting timer...');
        this.playSound(); // Play sound when starting timer
        this.isRunning = true;
        this.startTime = Date.now() - ((this.getTotalTime() - this.timeLeft) * 1000);
        
        const self = this;
        this.intervalId = setInterval(function() {
            self.tick();
        }, 1000); // Update every second
        
        this.startPauseBtn.textContent = 'Pause';
        this.startPauseBtn.className = 'btn btn-secondary';
        
        if (this.timerCircle) {
            this.timerCircle.classList.add('active');
        }
        
        document.title = this.formatTime(this.timeLeft) + ' - Online Tomato';
        console.log('Timer started');
    },
    
    pauseTimer: function() {
        console.log('Pausing timer...');
        this.isRunning = false;
        clearInterval(this.intervalId);
        
        this.startPauseBtn.textContent = 'Start';
        this.startPauseBtn.className = 'btn btn-primary';
        
        if (this.timerCircle) {
            this.timerCircle.classList.remove('active');
        }
        
        document.title = 'Online Tomato - Pomodoro Timer';
        console.log('Timer paused');
    },
    
    resetTimer: function() {
        console.log('Resetting timer...');
        this.playSound(); // Play sound when resetting timer
        this.pauseTimer();
        this.timeLeft = this.getTotalTime();
        this.updateDisplay();
        this.updateProgress();
        console.log('Timer reset');
    },
    
    skipSession: function() {
        console.log('Skipping session...');
        this.pauseTimer();
        this.completeSession();
    },
    
    tick: function() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeLeft = Math.max(0, this.getTotalTime() - elapsed);
        
        // Play countdown sound for last 5 seconds
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
            this.playSound();
        }
        
        this.updateDisplay();
        this.updateProgress();
        
        if (this.timeLeft <= 0) {
            this.completeSession();
        }
    },
    
    completeSession: function() {
        console.log('Session completed!');
        this.pauseTimer();
        
        this.showNotification();
        this.playTripleSound(); // Play triple sound effect when session ends
        this.updateStats();
        this.switchToNextSession();
        
        if (this.settings.autoStart) {
            const self = this;
            setTimeout(function() {
                self.startTimer();
            }, 1000);
        }
    },
    
    switchToNextSession: function() {
        if (this.currentSession === 'focus') {
            this.completedSessions++;
            this.sessionCount++;
            
            if (this.sessionCount % this.settings.longBreakInterval === 0) {
                this.currentSession = 'longBreak';
            } else {
                this.currentSession = 'shortBreak';
            }
        } else {
            this.currentSession = 'focus';
        }
        
        this.timeLeft = this.getTotalTime();
        this.updateDisplay();
        this.updateProgress();
        this.updateSessionInfo();
    },
    
    getTotalTime: function() {
        switch(this.currentSession) {
            case 'focus':
                return this.settings.focusTime * 60;
            case 'shortBreak':
                return this.settings.shortBreak * 60;
            case 'longBreak':
                return this.settings.longBreak * 60;
            default:
                return 25 * 60;
        }
    },
    
    getSessionName: function() {
        switch(this.currentSession) {
            case 'focus':
                return 'Focus Time';
            case 'shortBreak':
                return 'Short Break';
            case 'longBreak':
                return 'Long Break';
            default:
                return 'Focus Time';
        }
    },
    
    getNextSessionName: function() {
        if (this.currentSession === 'focus') {
            const nextCount = this.sessionCount + 1;
            return nextCount % this.settings.longBreakInterval === 0 ? 'Long Break' : 'Short Break';
        } else {
            return 'Focus Time';
        }
    },
    
    updateDisplay: function() {
        if (this.timeDisplay) {
            this.timeDisplay.textContent = this.formatTime(this.timeLeft);
        }
        if (this.sessionType) {
            this.sessionType.textContent = this.getSessionName();
        }
        
        if (this.isRunning) {
            document.title = this.formatTime(this.timeLeft) + ' - Online Tomato';
        }
    },
    
    updateProgress: function() {
        if (!this.progressCircle) return;
        
        const totalTime = this.getTotalTime();
        const progress = (totalTime - this.timeLeft) / totalTime;
        const offset = this.circumference - (progress * this.circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Change color based on session type
        let color = '#ef4444'; // Default red for focus
        if (this.currentSession === 'shortBreak') {
            color = '#10b981'; // Green for short break
        } else if (this.currentSession === 'longBreak') {
            color = '#f97316'; // Orange for long break
        }
        this.progressCircle.style.stroke = color;
    },
    
    updateSessionInfo: function() {
        if (this.sessionsCompleted) {
            this.sessionsCompleted.textContent = this.completedSessions;
        }
        if (this.nextSession) {
            this.nextSession.textContent = this.getNextSessionName();
        }
    },
    
    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
    },
    
    requestNotificationPermission: function() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },
    
    showNotification: function() {
        if (!this.settings.notifications) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const sessionName = this.getSessionName();
            const nextSessionName = this.getNextSessionName();
            
            new Notification(sessionName + ' Complete!', {
                body: 'Time for ' + nextSessionName.toLowerCase() + '. Great work! 🍅',
                icon: 'favicon.ico'
            });
        }
    },
    
    playNotificationSound: function() {
        this.playSound();
    },
    
    playSound: function() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not available');
        }
    },
    
    playTripleSound: function() {
        // Play sound 3 times quickly
        const self = this;
        this.playSound();
        setTimeout(function() {
            self.playSound();
        }, 200);
        setTimeout(function() {
            self.playSound();
        }, 400);
    },
    
    updateStats: function() {
        if (this.currentSession === 'focus') {
            try {
                const today = new Date().toDateString();
                const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
                
                if (!stats[today]) {
                    stats[today] = { sessions: 0, minutes: 0 };
                }
                
                stats[today].sessions += 1;
                stats[today].minutes += this.settings.focusTime;
                
                localStorage.setItem('pomodoroStats', JSON.stringify(stats));
                
                window.dispatchEvent(new CustomEvent('statsUpdated'));
            } catch (e) {
                console.log('Could not update stats:', e);
            }
        }
    },
    
    updateSettings: function(newSettings) {
        this.settings = Object.assign(this.settings, newSettings);
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        this.applySettings();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing timer...');
    timer.init();
    window.pomodoroTimer = timer; // Make available globally
});

// Fallback initialization
window.addEventListener('load', function() {
    if (!window.pomodoroTimer) {
        console.log('Fallback initialization...');
        timer.init();
        window.pomodoroTimer = timer;
    }
});