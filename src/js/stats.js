// Online Tomato - Statistics Module

class StatsManager {
    constructor() {
        this.chart = null;
        this.initializeElements();
        this.setupEventListeners();
        this.updateStats();
    }
    
    initializeElements() {
        this.todaysSessions = document.getElementById('todaysSessions');
        this.todaysMinutes = document.getElementById('todaysMinutes');
        this.weekStreak = document.getElementById('weekStreak');
        this.chartCanvas = document.getElementById('weeklyChart');
        this.resetHistoryBtn = document.getElementById('resetHistoryBtn');
    }
    
    setupEventListeners() {
        // Listen for stats updates from timer
        window.addEventListener('statsUpdated', () => {
            this.updateStats();
        });
        
        // Update stats when stats tab is shown
        document.addEventListener('tabChanged', (e) => {
            if (e.detail.tab === 'stats') {
                this.updateStats();
                this.updateChart();
            }
        });
        
        // Reset history button
        if (this.resetHistoryBtn) {
            this.resetHistoryBtn.addEventListener('click', () => {
                this.clearStats();
            });
        }
    }
    
    updateStats() {
        const stats = this.getStats();
        const today = new Date().toDateString();
        const todayStats = stats[today] || { sessions: 0, minutes: 0 };
        
        // Update today's stats
        this.todaysSessions.textContent = todayStats.sessions;
        this.todaysMinutes.textContent = todayStats.minutes;
        
        // Calculate streak
        this.weekStreak.textContent = this.calculateStreak(stats);
    }
    
    updateChart() {
        const weekData = this.getWeekData();
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const ctx = this.chartCanvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekData.labels,
                datasets: [{
                    label: 'Focus Sessions',
                    data: weekData.sessions,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }, {
                    label: 'Minutes Focused',
                    data: weekData.minutes,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    yAxisID: 'y1',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Productivity Overview',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#374151'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#374151',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                
                                if (label === 'Minutes Focused') {
                                    const hours = Math.floor(value / 60);
                                    const minutes = value % 60;
                                    return `${label}: ${hours}h ${minutes}m`;
                                }
                                
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Sessions',
                            color: '#ef4444',
                            font: {
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            stepSize: 1,
                            color: '#6b7280'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Minutes',
                            color: '#10b981',
                            font: {
                                weight: '600'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                const hours = Math.floor(value / 60);
                                const minutes = value % 60;
                                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            maxRotation: 45
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    getWeekData() {
        const stats = this.getStats();
        const weekData = {
            labels: [],
            sessions: [],
            minutes: []
        };
        
        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dateString = date.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            weekData.labels.push(`${dayName}\n${monthDay}`);
            
            const dayStats = stats[dateString] || { sessions: 0, minutes: 0 };
            weekData.sessions.push(dayStats.sessions);
            weekData.minutes.push(dayStats.minutes);
        }
        
        return weekData;
    }
    
    calculateStreak(stats) {
        let streak = 0;
        const today = new Date();
        
        // Check each day going backwards from today
        for (let i = 0; i < 365; i++) { // Max 365 days
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toDateString();
            
            const dayStats = stats[dateString];
            
            if (dayStats && dayStats.sessions > 0) {
                streak++;
            } else if (i > 0) { // Don't break on today if no sessions yet
                break;
            }
        }
        
        return streak;
    }
    
    getStats() {
        return JSON.parse(localStorage.getItem('pomodoroStats')) || {};
    }
    
    exportStats() {
        const stats = this.getStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `pomodoro-stats-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    clearStats() {
        const totalStats = this.getTotalStats();
        const confirmMessage = `⚠️ Reset All History?\n\nThis will permanently delete:\n• ${totalStats.totalSessions} completed sessions\n• ${totalStats.totalHours}h ${totalStats.totalMinutes % 60}m of focused work\n• ${totalStats.daysActive} days of activity data\n• Your current ${this.calculateStreak(this.getStats())}-day streak\n\nThis action cannot be undone!\n\nAre you sure you want to continue?`;
        
        if (confirm(confirmMessage)) {
            localStorage.removeItem('pomodoroStats');
            this.updateStats();
            if (this.chart) {
                this.updateChart();
            }
            
            // Play sound to confirm action
            if (window.pomodoroTimer && window.pomodoroTimer.playSound) {
                window.pomodoroTimer.playSound();
            }
            
            // Show success message
            if (window.app && window.app.showTemporaryMessage) {
                window.app.showTemporaryMessage('History reset successfully! 🗑️', 'success', 3000);
            }
        }
    }
    
    getTotalStats() {
        const stats = this.getStats();
        let totalSessions = 0;
        let totalMinutes = 0;
        let daysActive = 0;
        
        Object.values(stats).forEach(dayStats => {
            if (dayStats.sessions > 0) {
                daysActive++;
                totalSessions += dayStats.sessions;
                totalMinutes += dayStats.minutes;
            }
        });
        
        return {
            totalSessions,
            totalMinutes,
            totalHours: Math.floor(totalMinutes / 60),
            daysActive,
            averageSessionsPerDay: daysActive > 0 ? (totalSessions / daysActive).toFixed(1) : 0,
            averageMinutesPerDay: daysActive > 0 ? Math.floor(totalMinutes / daysActive) : 0
        };
    }
    
    getProductivityInsights() {
        const stats = this.getStats();
        const weekData = this.getWeekData();
        const totalStats = this.getTotalStats();
        
        const insights = [];
        
        // Weekly trend
        const thisWeekSessions = weekData.sessions.reduce((a, b) => a + b, 0);
        const thisWeekMinutes = weekData.minutes.reduce((a, b) => a + b, 0);
        
        if (thisWeekSessions > 0) {
            insights.push(`This week: ${thisWeekSessions} sessions, ${Math.floor(thisWeekMinutes / 60)}h ${thisWeekMinutes % 60}m focused`);
        }
        
        // Best day
        const bestDay = weekData.labels[weekData.sessions.indexOf(Math.max(...weekData.sessions))];
        const bestDayStats = Math.max(...weekData.sessions);
        if (bestDayStats > 0) {
            insights.push(`Your most productive day this week: ${bestDay} (${bestDayStats} sessions)`);
        }
        
        // Streak
        const currentStreak = this.calculateStreak(stats);
        if (currentStreak > 1) {
            insights.push(`Current streak: ${currentStreak} days! Keep it up! 🔥`);
        } else if (currentStreak === 1) {
            insights.push(`You're on a 1-day streak. Tomorrow makes 2! 💪`);
        }
        
        // Total achievements
        if (totalStats.totalSessions >= 100) {
            insights.push(`Achievement unlocked: 100+ total sessions! 🏆`);
        } else if (totalStats.totalSessions >= 50) {
            insights.push(`Achievement unlocked: 50+ total sessions! 🎯`);
        }
        
        if (totalStats.totalHours >= 25) {
            insights.push(`Achievement unlocked: 25+ hours of focused work! ⏰`);
        }
        
        return insights;
    }
}

// Initialize stats manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
});