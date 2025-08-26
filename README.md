# 🍅 Online Tomato - Pomodoro Timer

A modern, responsive web application for productivity tracking using the Pomodoro Technique. Built with vanilla HTML, CSS, and JavaScript.

## Features

### ⏱️ Timer Functionality
- **Pomodoro Timer**: 25-minute focus sessions with short and long breaks
- **Visual Progress**: Animated circular progress indicator
- **Audio Notifications**: Browser notifications and sound alerts
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Auto-start**: Optional automatic session transitions

### 📊 Statistics & Analytics
- **Daily Tracking**: Monitor daily focus sessions and minutes
- **Weekly Overview**: Interactive charts showing productivity trends
- **Streak Counter**: Track your consistency with daily streaks
- **Historical Data**: All data stored locally in your browser

### ⚙️ Customizable Settings
- **Flexible Timing**: Adjust focus, short break, and long break durations
- **Break Intervals**: Configure when long breaks occur
- **Notifications**: Toggle browser notifications and sounds
- **Auto-start**: Enable/disable automatic session transitions

### 🎨 Modern Design
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Accessible**: Full keyboard navigation and screen reader support
- **Progressive Web App**: Install on your device for offline use
- **Clean Interface**: Minimalist design focused on productivity

## Quick Start

### Option 1: Simple Setup
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start your first Pomodoro session!

### Option 2: Local Development Server
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open `http://localhost:3000` in your browser

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` or `Enter` | Start/Pause timer |
| `R` | Reset timer |
| `S` | Skip current session |
| `Ctrl+1` | Switch to Timer tab |
| `Ctrl+2` | Switch to Statistics tab |
| `Ctrl+3` | Switch to Settings tab |
| `H` | Show help modal |
| `Esc` | Close modals |

## The Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo:

1. **Choose a task** to work on
2. **Set a timer** for 25 minutes (one "Pomodoro")
3. **Work on the task** until the timer rings
4. **Take a short break** (5 minutes)
5. **Repeat** the process
6. After **4 Pomodoros**, take a **longer break** (15-30 minutes)

## Project Structure

```
Online Tomato/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── package.json            # NPM configuration
├── README.md              # This file
├── src/
│   ├── styles/
│   │   └── main.css        # All styles and responsive design
│   └── js/
│       ├── app.js          # Main application controller
│       ├── timer.js        # Timer logic and Pomodoro functionality
│       ├── stats.js        # Statistics and analytics
│       └── settings.js     # Settings management
└── assets/
    └── favicon.ico         # Favicon (create your own)
```

## Technology Stack

- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript
- **Chart.js**: Interactive charts for statistics
- **Service Worker**: Offline functionality and PWA support
- **Local Storage**: Client-side data persistence

## Browser Support

- ✅ Chrome 60+ (recommended)
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## Features in Detail

### Timer Module (`timer.js`)
- Precise timing with sync functionality
- Multiple session types (focus, short break, long break)
- Audio and visual notifications
- Progress tracking and statistics integration
- Keyboard shortcuts and accessibility

### Statistics Module (`stats.js`)
- Real-time data visualization with Chart.js
- Daily, weekly, and historical views
- Productivity insights and streaks
- Export functionality for data backup

### Settings Module (`settings.js`)
- Real-time validation and preview
- Import/export configuration
- Persistent storage with localStorage
- User-friendly error handling

### App Module (`app.js`)
- Tab navigation and routing
- Modal system for help and dialogs
- Responsive design handling
- Service worker integration for PWA

## Customization

The app is designed to be easily customizable:

### Colors and Theme
Edit CSS custom properties in `src/styles/main.css`:
```css
:root {
    --primary-red: #ef4444;
    --secondary-green: #10b981;
    /* ... more color variables */
}
```

### Default Settings
Modify default values in `src/js/settings.js`:
```javascript
getDefaultSettings() {
    return {
        focusTime: 25,      // minutes
        shortBreak: 5,      // minutes
        longBreak: 15,      // minutes
        longBreakInterval: 4 // sessions
    };
}
```

## Progressive Web App (PWA)

Online Tomato can be installed as a PWA:

1. **Desktop**: Look for the install icon in your browser's address bar
2. **Mobile**: Use "Add to Home Screen" from your browser menu
3. **Offline**: Works completely offline once installed

## Contributing

This is a clean, well-structured codebase perfect for learning and extending:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Ideas for Contributions
- Dark mode theme
- Sound customization
- Task management integration
- Cloud sync functionality
- Mobile app version
- Additional statistics views

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- Pomodoro Technique by Francesco Cirillo
- Icons: Emoji (🍅)
- Charts: Chart.js library
- Fonts: Inter from Google Fonts

---

**Happy focusing! 🍅✨**

*Built with ❤️ for productivity enthusiasts*