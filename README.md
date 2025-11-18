# 🍅 Pomodoro Notification Timer

A Chrome extension that provides a clean, notification-based Pomodoro timer with sound alerts and customizable session lengths.

## Features

- ✅ **Notification-based alerts** - No more intrusive modals on web pages
- 🔊 **Sound alerts** - Audio notification when timer completes
- ⏱️ **Customizable minutes** - Set any duration from 1-60 minutes
- 💾 **Persistent settings** - Your preferred timer duration is saved
- 🎨 **Clean UI** - Modern, intuitive interface in the extension popup
- 🔔 **Rich notifications** - Browser notifications with action buttons

## How to Use

1. Click the Pomodoro extension icon in your browser toolbar
2. Set your desired session length using the minutes input (default: 25 minutes)
3. Click "Start" to begin your focus session
4. The timer runs in the background - you can close the popup and continue working
5. When time is up, you'll receive:
   - A browser notification with sound
   - An audio alert (beeping sound)
   - Option to start another session directly from the notification

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Pomodoro timer icon will appear in your toolbar

## Permissions

- **Storage**: To save your preferred timer settings
- **Notifications**: To show completion alerts
- **Active Tab**: For extension functionality

## Changes from Previous Version

- ❌ Removed modal overlays on web pages
- ✅ Added browser notifications
- ✅ Added sound alerts
- ✅ Added customizable timer duration
- ✅ Improved UI with better styling
- ✅ Added persistent settings storage

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers with Manifest V3 support