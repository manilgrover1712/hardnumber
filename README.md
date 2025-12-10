# Hardnumber 🔢

A daily number guessing game inspired by Hardword. Find the hidden 4-digit number in 10 tries!

## Features

- 🎯 **Daily Challenge**: New 4-digit number every day at 00:00 IST
- 🔢 **Unique Digits**: All digits in the number are unique
- 📊 **Statistics**: Track your games played, win percentage, and streaks
- ⏱️ **Countdown Timer**: See when the next number will be available
- 📱 **Mobile Responsive**: Works great on all devices
- 💾 **Progress Saved**: Your game state is automatically saved
- 🎨 **Clean Design**: Black theme with intuitive feedback

## How to Play

1. Guess the 4-digit number
2. Each digit must be unique
3. After each guess, you'll see:
   - 🟢 **Green indicator**: Shows how many digits are in the correct position
   - 🟡 **Yellow indicator**: Shows how many digits are correct but in the wrong position
4. You have 10 attempts to find the number
5. A new number is available every day at midnight IST

## Hosting Options

### Option 1: GitHub Pages (Free & Easy)

1. Create a new GitHub repository
2. Upload all files (index.html, style.css, script.js)
3. Go to Settings → Pages
4. Select main branch as source
5. Your game will be live at: `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free & Easy)

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop the `numberguess` folder
3. Your game will be live instantly with a custom URL

### Option 3: Vercel (Free)

1. Create account at [vercel.com](https://vercel.com)
2. Import the project from GitHub or upload directly
3. Deploy with one click

### Option 4: Any Static Hosting

Simply upload these files to any web server:
- index.html
- style.css
- script.js

## Files Structure

```
numberguess/
├── index.html      # Main HTML structure
├── style.css       # Styling and responsive design
├── script.js       # Game logic and functionality
└── README.md       # This file
```

## Technical Details

- **Pure vanilla JavaScript** - No frameworks required
- **localStorage** for saving game state and statistics
- **Daily number generation** using date-based seeded random
- **IST timezone support** for daily resets
- **Responsive design** with mobile breakpoints

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome)

## Local Development

1. Open `index.html` in your browser
2. Or use a local server:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

## Customization

- Change colors in `style.css` (search for color variables)
- Modify number length in `script.js` (change `NUMBER_LENGTH`)
- Adjust max guesses in `script.js` (change `MAX_GUESSES`)
- Change timezone by modifying IST offset in `updateCountdown()`

---

Made with ❤️ for number puzzle enthusiasts
