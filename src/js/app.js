// Online Tomato - Main Application Controller

class App {
    constructor() {
        this.currentTab = 'timer';
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeTheme();
        this.showWelcomeMessage();
    }
    
    initializeElements() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.tabContents = document.querySelectorAll('.tab-content');
    }
    
    setupEventListeners() {
        // Tab navigation
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', () => {
                const tab = navItem.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.switchTab(e.state.tab, false);
            }
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => this.showConnectionStatus(true));
        window.addEventListener('offline', () => this.showConnectionStatus(false));
        
        // Handle window resize for responsive adjustments
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Service Worker registration for PWA features
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in input fields
            if (e.target.tagName.toLowerCase() !== 'input' && 
                e.target.tagName.toLowerCase() !== 'textarea' && 
                !e.target.isContentEditable) {
                
                // Tab switching shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case '1':
                            e.preventDefault();
                            this.switchTab('timer');
                            break;
                        case '2':
                            e.preventDefault();
                            this.switchTab('stats');
                            break;
                        case '3':
                            e.preventDefault();
                            this.switchTab('settings');
                            break;
                    }
                }
                
                // General shortcuts
                switch(e.key.toLowerCase()) {
                    case 'h':
                        e.preventDefault();
                        this.showHelpModal();
                        break;
                    case 'escape':
                        this.closeModals();
                        break;
                }
            }
        });
    }
    
    switchTab(tabName, updateHistory = true) {
        if (tabName === this.currentTab) return;
        
        // Update active nav item
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabName) {
                item.classList.add('active');
            }
        });
        
        // Update active tab content
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.getAttribute('data-content') === tabName) {
                content.classList.add('active');
                content.classList.add('fade-in');
            }
        });
        
        this.currentTab = tabName;
        
        // Update URL without page reload
        if (updateHistory) {
            const url = new URL(window.location);
            url.searchParams.set('tab', tabName);
            history.pushState({ tab: tabName }, '', url);
        }
        
        // Dispatch tab change event
        document.dispatchEvent(new CustomEvent('tabChanged', {
            detail: { tab: tabName, previousTab: this.currentTab }
        }));
        
        // Handle tab-specific initialization
        this.handleTabActivation(tabName);
        
        // Analytics (if implemented)
        this.trackTabSwitch(tabName);
    }
    
    handleTabActivation(tabName) {
        switch(tabName) {
            case 'stats':
                // Trigger stats update and chart rendering
                if (window.statsManager) {
                    setTimeout(() => {
                        window.statsManager.updateChart();
                    }, 100);
                }
                break;
            case 'settings':
                // Load current settings
                if (window.settingsManager) {
                    window.settingsManager.loadSettings();
                }
                break;
        }
    }
    
    initializeTheme() {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('pomodoroTheme') || 'light';
        this.setTheme(savedTheme);
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('pomodoroTheme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pomodoroTheme', theme);
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause non-essential operations
            this.onPageHidden();
        } else {
            // Page is visible again - resume operations
            this.onPageVisible();
        }
    }
    
    onPageHidden() {
        // Reduce update frequency, pause animations, etc.
        console.log('Page hidden - reducing activity');
    }
    
    onPageVisible() {
        // Resume normal operations, sync timer, etc.
        console.log('Page visible - resuming normal activity');
        
        // Sync timer if running
        if (window.pomodoroTimer && window.pomodoroTimer.isRunning) {
            window.pomodoroTimer.syncTimer();
        }
    }
    
    showConnectionStatus(isOnline) {
        const statusMessage = isOnline ? 'Back online! ✅' : 'You\'re offline. The app will continue to work. 📱';
        const statusType = isOnline ? 'success' : 'warning';
        
        this.showTemporaryMessage(statusMessage, statusType);
    }
    
    showTemporaryMessage(message, type = 'info', duration = 3000) {
        // Remove existing temporary messages
        const existing = document.querySelectorAll('.temp-message');
        existing.forEach(msg => msg.remove());
        
        const messageEl = document.createElement('div');
        messageEl.className = 'temp-message';
        
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        // Auto-remove
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
    
    handleResize() {
        // Handle responsive adjustments
        if (window.statsManager && window.statsManager.chart) {
            window.statsManager.chart.resize();
        }
    }
    
    showWelcomeMessage() {
        const hasVisited = localStorage.getItem('pomodoroHasVisited');
        
        if (!hasVisited) {
            setTimeout(() => {
                this.showTemporaryMessage('Welcome to Online Tomato! Press H for help. 🍅', 'success', 5000);
                localStorage.setItem('pomodoroHasVisited', 'true');
            }, 1000);
        }
    }
    
    showHelpModal() {
        const helpContent = `
            <div class="help-modal">
                <div class="help-content">
                    <h2>🍅 Online Tomato - Help</h2>
                    
                    <h3>Keyboard Shortcuts</h3>
                    <div class="shortcut-grid">
                        <div class="shortcut-item">
                            <kbd>Space</kbd> or <kbd>Enter</kbd>
                            <span>Start/Pause timer</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>R</kbd>
                            <span>Reset timer</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>S</kbd>
                            <span>Skip session</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl+1</kbd>
                            <span>Switch to Timer</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl+2</kbd>
                            <span>Switch to Statistics</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl+3</kbd>
                            <span>Switch to Settings</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>H</kbd>
                            <span>Show this help</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Esc</kbd>
                            <span>Close modals</span>
                        </div>
                    </div>
                    
                    <h3>About the Pomodoro Technique</h3>
                    <p>The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.</p>
                    
                    <div class="help-steps">
                        <div class="step">1. Choose a task to work on</div>
                        <div class="step">2. Start a 25-minute timer</div>
                        <div class="step">3. Work on the task until timer rings</div>
                        <div class="step">4. Take a 5-minute break</div>
                        <div class="step">5. After 4 cycles, take a longer 15-minute break</div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="app.closeModals()">Got it!</button>
                </div>
            </div>
        `;
        
        this.showModal(helpContent);
    }
    
    showModal(content) {
        this.closeModals(); // Close existing modals
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = content;
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModals();
            }
        });
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        });
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    showUpdateAvailable() {
        const updateMessage = document.createElement('div');
        updateMessage.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            animation: slideInUp 0.3s ease-out;
        `;
        
        updateMessage.innerHTML = `
            <span>A new version is available!</span>
            <button onclick="window.location.reload()" class="btn" style="background: white; color: #3b82f6; padding: 0.5rem 1rem; margin-left: 1rem;">
                Update
            </button>
        `;
        
        document.body.appendChild(updateMessage);
    }
    
    trackTabSwitch(tabName) {
        // Placeholder for analytics tracking
        console.log(`Tab switched to: ${tabName}`);
    }
    
    // Public API methods
    getCurrentTab() {
        return this.currentTab;
    }
    
    getAppState() {
        return {
            currentTab: this.currentTab,
            theme: localStorage.getItem('pomodoroTheme'),
            hasVisited: localStorage.getItem('pomodoroHasVisited')
        };
    }
}

// Add required CSS for modals and animations
const appStyles = document.createElement('style');
appStyles.textContent = `
/* Modal styles */
.help-modal {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    margin: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.help-content h2 {
    margin-bottom: 1.5rem;
    color: #ef4444;
    text-align: center;
}

.help-content h3 {
    margin: 1.5rem 0 1rem 0;
    color: #374151;
    border-bottom: 2px solid #f3f4f6;
    padding-bottom: 0.5rem;
}

.shortcut-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.shortcut-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.shortcut-item kbd {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-family: monospace;
    font-size: 0.875rem;
    min-width: 3rem;
    text-align: center;
}

.help-steps {
    margin: 1rem 0;
}

.step {
    padding: 0.75rem;
    margin: 0.5rem 0;
    background: #f9fafb;
    border-left: 4px solid #ef4444;
    border-radius: 0.25rem;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes slideInUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Responsive modal */
@media (max-width: 768px) {
    .help-modal {
        margin: 1rem;
        padding: 1.5rem;
        max-height: 90vh;
    }
    
    .shortcut-grid {
        grid-template-columns: 1fr;
    }
}
`;
document.head.appendChild(appStyles);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Check URL parameters for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['timer', 'stats', 'settings'].includes(tab)) {
        app.switchTab(tab, false);
    }
});