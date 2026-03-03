# Study Budgie

![Animation of Pomodoro countdown in action featuring a stylized illustration of a budgie](/static/img/studybudgie.gif)

## Description:

Study Budgie is a Pomodoro timer web application featuring a cute animated budgie mascot.

## Features

- Customizable Pomodoro sessions (study time, breaks, intervals)
- Animated budgie mascot that responds to timer states
- Audio notifications
- Persistent settings saved in Flask session
- Persistent timer state saved in browser localStorage (survives page reloads)
- Smart settings adjustment: changing settings mid-session adds or deducts time rather than restarting
- Auto-start options for study sessions and breaks
- Start/Pause/Resume, Stop and Skip controls

## Tech Stack

- **Frontend**: JavaScript, HTML5, CSS3
- **Backend**: Flask (Python)

## Setup

```bash
pip install -r requirements.txt
flask run
```

Navigate to `http://127.0.0.1:5000`

## Pomodoro Settings

Users can customize all important Pomodoro settings, including:
* Study session length (in minutes)
* Short break length
* Long break length
* Number of Pomodoro sessions before a long break
* Auto start study sessions
* Auto start breaks

These settings are saved using a Flask session (stored in a cookie), so users do not need to re-enter their preferences each time they return to the app. The app uses a secret key for session handling (see `app.py`). In a production environment, this would be provided via environment variables.

In addition to settings, the current timer runtime state (remaining time, Pomodoro count, running/paused status, and break type) is persisted in the browser's localStorage. This means the timer survives page reloads and tab closures. On restore, elapsed time since the last save is calculated and subtracted from the remaining time automatically.

If a user changes their Pomodoro settings while a session is in progress, the timer adjusts the remaining time by the difference rather than restarting the session. For example, increasing study time from 25 to 30 minutes while 10 minutes remain would update the remaining time to 15 minutes.

## Timer Controls

The timer itself includes:

* A Start / Pause button to control the countdown
* A Stop button to end the current Pomodoro cycle and move to the finished state
* A Skip button to skip to Break/Study state
* An audible notification when a session or break ends (optional)

If automatic study or breaks are disabled, the user must manually start the timer after each state change, giving full control over pacing.

## How It Works

The application is split into several files, each responsible for a specific part of the functionality.

### JavaScript: `script.js`

This file contains all timer logic and state management for the Pomodoro system.

When the page loads, `script.js` retrieves the user’s Pomodoro settings from the HTML (embedded as JSON using Jinja) and stores references to key DOM elements (buttons, timer, pet animation).

Event listeners are attached to the buttons, which trigger the `startTimer`, `stopTimer` and `skipTimer` functions.

The timer logic is implemented using a **state-based approach**. The app switches between the following states: `idle`, `study`, `break`, `finished`

Each state:

* Sets the appropriate countdown duration
* Updates the timer display
* Starts or stops the countdown interval
* Updates button text
* Switches the pet animation by applying CSS classes

Pausing is **not** handled as a separate state. Instead, the Start button toggles between starting and pausing the interval when pressed during an active session.

The countdown itself is driven by a JavaScript interval that decreases the remaining time every second. When the timer reaches zero, an alarm sound is played and the app transitions automatically to the next state (either break or idle, depending on context).

The timer runtime state is persisted to localStorage via `saveRuntime()`, which is called on every state change, interval start/stop, and before the page unloads. On page load, the `init()` function attempts to restore the saved state. It validates the stored data, applies elapsed time if the timer was previously running, and adjusts for any settings changes made since the last save. If the stored state is invalid or missing, a fresh session is started.

### Python (Flask): `app.py`

This file handles routing, form processing, and persistence of user settings.

The application uses Flask sessions to store Pomodoro preferences. Default values are defined for:

* Study duration
* Short break duration
* Long break duration
* Pomodoro count threshold
* Auto-start options for study and break

The `/` route serves as the **start page** (`start.html`), which contains a form where users can configure their Pomodoro settings. When the page is loaded via GET, previously saved settings (or defaults) are used to pre-fill the form fields.

When the form is submitted via POST:

* Input values are retrieved, validated and converted appropriately
* The settings are saved in the user session
* The user is redirected to the main timer page

The `/index` route renders the **main Pomodoro interface** (`index.html`). It retrieves the saved settings from the session and passes them to the template so they can be used by JavaScript.

### CSS: `pomo_style.css`

This file is responsible for all styling and animations.

The page layout uses a column-based Flexbox structure. It styles:

* The header and navigation bar
* The timer display
* Buttons and hover states
* The settings form

The **pet animation** is implemented entirely in CSS using a single SVG sprite sheet. Each Pomodoro state has its own animation defined through keyframes that alternate between two frames. A `.paused` class is used to pause the animation when the timer is paused.

### HTML: `layout.html`, `index.html`, `start.html`

* `layout.html` contains shared markup such as:
  * The page header
  * Navigation bar
  * CSS and font imports

It uses **Jinja blocks** so that other pages can inject their own content without repeating code.

* `index.html` is the main Pomodoro interface. It contains the timer display, pet animation container, and control buttons. The JavaScript file is loaded on this page.
* `start.html` contains the settings form where users configure their Pomodoro preferences before starting a session.

## Credits

- Budgie artwork: Designed by me in Adobe Illustrator
- Sound effect: Sound Effect by [Universfield](https://pixabay.com/de/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199584) from [Pixabay](https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199584)

## Copyright

© 2026 Daniela Unger. All rights reserved.