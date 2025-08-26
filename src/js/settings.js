// Online Tomato - Settings Module

class SettingsManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }
    
    initializeElements() {
        this.focusTimeInput = document.getElementById('focusTime');
        this.shortBreakInput = document.getElementById('shortBreak');
        this.longBreakInput = document.getElementById('longBreak');
        this.longBreakIntervalSelect = document.getElementById('longBreakInterval');
        this.autoStartCheckbox = document.getElementById('autoStart');
        this.notificationsCheckbox = document.getElementById('notifications');
        this.saveSettingsBtn = document.getElementById('saveSettings');
    }
    
    setupEventListeners() {
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Auto-save on change
        const inputs = [
            this.focusTimeInput,
            this.shortBreakInput,
            this.longBreakInput,
            this.longBreakIntervalSelect,
            this.autoStartCheckbox,
            this.notificationsCheckbox
        ];
        
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.validateAndUpdatePreview();
            });
        });
        
        // Real-time validation
        [this.focusTimeInput, this.shortBreakInput, this.longBreakInput].forEach(input => {
            input.addEventListener('input', () => this.validateTimeInput(input));
        });
        
        // Listen for tab changes to load settings
        document.addEventListener('tabChanged', (e) => {
            if (e.detail.tab === 'settings') {
                this.loadSettings();
            }
        });
        
        // Keyboard shortcuts for settings
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName.toLowerCase() !== 'input' && e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 's') {
                    e.preventDefault();
                    this.saveSettings();
                }
            }
        });
    }
    
    validateTimeInput(input) {
        const value = parseInt(input.value);
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        
        // Add visual feedback for invalid values
        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
            this.showInputError(input, `Please enter a value between ${min} and ${max}`);
        } else {
            input.classList.remove('invalid');
            this.hideInputError(input);
        }
    }
    
    showInputError(input, message) {
        // Remove existing error message
        this.hideInputError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        input.parentNode.appendChild(errorDiv);
    }
    
    hideInputError(input) {
        const existingError = input.parentNode.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    validateAndUpdatePreview() {
        const settings = this.getFormSettings();
        
        // Validate all time inputs
        const timeInputs = [
            { input: this.focusTimeInput, name: 'Focus time' },
            { input: this.shortBreakInput, name: 'Short break' },
            { input: this.longBreakInput, name: 'Long break' }
        ];
        
        let isValid = true;
        timeInputs.forEach(({ input, name }) => {
            const value = parseInt(input.value);
            const min = parseInt(input.min);
            const max = parseInt(input.max);
            
            if (isNaN(value) || value < min || value > max) {
                isValid = false;
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        });
        
        // Update save button state
        this.saveSettingsBtn.disabled = !isValid;
        
        if (isValid) {
            this.showPreview(settings);
        }
    }
    
    showPreview(settings) {
        // Calculate session cycle preview
        const totalCycleTime = (settings.focusTime * settings.longBreakInterval) + 
                             (settings.shortBreak * (settings.longBreakInterval - 1)) + 
                             settings.longBreak;
        
        const hours = Math.floor(totalCycleTime / 60);
        const minutes = totalCycleTime % 60;
        
        // Show preview info
        this.showPreviewMessage(
            `Cycle preview: ${settings.longBreakInterval} focus sessions (${settings.focusTime}min each) + breaks = ~${hours}h ${minutes}m total`
        );
    }
    
    showPreviewMessage(message) {
        // Remove existing preview
        const existingPreview = document.querySelector('.settings-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'settings-preview';
        previewDiv.style.cssText = `
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            color: #0c4a6e;
            font-size: 0.875rem;
            font-weight: 500;
        `;
        previewDiv.textContent = message;
        
        this.saveSettingsBtn.parentNode.insertBefore(previewDiv, this.saveSettingsBtn);
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : this.getDefaultSettings();
        
        this.focusTimeInput.value = settings.focusTime;
        this.shortBreakInput.value = settings.shortBreak;
        this.longBreakInput.value = settings.longBreak;
        this.longBreakIntervalSelect.value = settings.longBreakInterval;
        this.autoStartCheckbox.checked = settings.autoStart;
        this.notificationsCheckbox.checked = settings.notifications;
        
        this.validateAndUpdatePreview();
    }
    
    getDefaultSettings() {
        return {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            longBreakInterval: 4,
            autoStart: true,
            notifications: true
        };
    }
    
    getFormSettings() {
        return {
            focusTime: parseInt(this.focusTimeInput.value) || 25,
            shortBreak: parseInt(this.shortBreakInput.value) || 5,
            longBreak: parseInt(this.longBreakInput.value) || 15,
            longBreakInterval: parseInt(this.longBreakIntervalSelect.value) || 4,
            autoStart: this.autoStartCheckbox.checked,
            notifications: this.notificationsCheckbox.checked
        };
    }
    
    saveSettings() {
        const settings = this.getFormSettings();
        
        // Validate settings
        if (!this.validateSettings(settings)) {
            this.showNotification('Please correct the invalid settings before saving.', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Update timer if available
        if (window.pomodoroTimer) {
            window.pomodoroTimer.updateSettings(settings);
        }
        
        // Show success message
        this.showNotification('Settings saved successfully! 🍅', 'success');
        
        // Request notification permission if enabled
        if (settings.notifications && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Notification permission granted!', 'success');
                } else {
                    this.showNotification('Notification permission denied. You can enable it in your browser settings.', 'warning');
                }
            });
        }
    }
    
    validateSettings(settings) {
        // Check time ranges
        if (settings.focusTime < 1 || settings.focusTime > 60) return false;
        if (settings.shortBreak < 1 || settings.shortBreak > 30) return false;
        if (settings.longBreak < 1 || settings.longBreak > 60) return false;
        if (settings.longBreakInterval < 2 || settings.longBreakInterval > 10) return false;
        
        // Logical checks
        if (settings.longBreak <= settings.shortBreak) {
            this.showNotification('Long break should be longer than short break.', 'warning');
            return false;
        }
        
        return true;
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.settings-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = 'settings-notification';
        
        const colors = {
            success: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d' },
            error: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' },
            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' },
            info: { bg: '#f0f9ff', border: '#3b82f6', text: '#2563eb' }
        };
        
        const color = colors[type];
        notification.style.cssText = `
            background: ${color.bg};
            border: 2px solid ${color.border};
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            color: ${color.text};
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `${icons[type]} ${message}`;
        
        this.saveSettingsBtn.parentNode.insertBefore(notification, this.saveSettingsBtn.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to their default values?')) {
            const defaults = this.getDefaultSettings();
            
            this.focusTimeInput.value = defaults.focusTime;
            this.shortBreakInput.value = defaults.shortBreak;
            this.longBreakInput.value = defaults.longBreak;
            this.longBreakIntervalSelect.value = defaults.longBreakInterval;
            this.autoStartCheckbox.checked = defaults.autoStart;
            this.notificationsCheckbox.checked = defaults.notifications;
            
            this.saveSettings();
        }
    }
    
    exportSettings() {
        const settings = JSON.parse(localStorage.getItem('pomodoroSettings')) || this.getDefaultSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `pomodoro-settings-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Settings exported successfully!', 'success');
    }
    
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                
                // Validate imported settings
                if (this.validateSettings(importedSettings)) {
                    localStorage.setItem('pomodoroSettings', JSON.stringify(importedSettings));
                    this.loadSettings();
                    this.showNotification('Settings imported successfully!', 'success');
                } else {
                    this.showNotification('Invalid settings file. Please check the file format.', 'error');
                }
            } catch (error) {
                this.showNotification('Error reading settings file. Please ensure it\'s a valid JSON file.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.setting-group input.invalid {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.settings-notification {
    transition: all 0.3s ease;
}
`;
document.head.appendChild(style);

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});