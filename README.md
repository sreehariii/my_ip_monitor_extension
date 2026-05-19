# IP Monitor - Chrome Extension

A minimal Chrome extension that monitors your public IP address and alerts you instantly when it changes.

## Features

- **Real-time monitoring** — checks your IP every minute (configurable)
- **Popup alert window** — impossible-to-miss alert with old/new IP comparison
- **Desktop notification** — Chrome notification as a secondary alert
- **Beautiful dark UI** — glassmorphism popup with IP history
- **Change history** — stores last 20 IP changes with timestamps

## Screenshots

When your IP changes, a popup window appears:

```
⚠️  Your IP Address Changed!
   192.168.1.1  →  10.0.0.1
```

## Installation

1. Clone this repo
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select the project folder
5. The globe icon appears in your toolbar

## How It Works

- Uses [secopstools.org/api/myip](https://secopstools.org/api/myip) to fetch your public IP
- Background service worker polls every 1 minute
- On IP change: opens a styled popup window + sends a Chrome notification
- Click the toolbar icon to see your current IP and change history

## Configuration

Edit `background.js` to change the check interval:

```js
const CHECK_INTERVAL_MINUTES = 1; // minimum is 1 for Chrome alarms
```

## Files

```
├── manifest.json    # Extension config (Manifest V3)
├── background.js    # Service worker - IP polling & alerts
├── popup.html/css/js # Toolbar popup UI
├── alert.html/js    # IP change alert window
└── icons/           # Extension icons
```

## License

MIT
