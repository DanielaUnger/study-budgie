# Study Budgie
![Animation of Pomodoro countdown in action featuring a stylized illustration of a budgie](/static/img/budgie_450.gif)
#### Description:
Study Budgie is a Pomodoro timer web application built with JavaScript**, **Python (Flask), HTML, and CSS. The app features a cute budgie mascot, which I designed myself in Adobe Illustrator. The budgie animates differently depending on the current Pomodoro state (idle, studying, break, or finished).

Users can customize all important Pomodoro settings, including:
* Study session length (in minutes)
* Short break length
* Long break length
* Number of Pomodoro sessions before a long break
* Auto start study sessions
* Auto start breaks

These settings are saved using a Flask session (stored in a cookie), so users do not need to re-enter their preferences each time they return to the app. The app uses a **secret key for session handling (see `app.py`)**. In a production environment, this would be provided via environment variables.

The timer itself includes:
* A Start / Pause / Resume button to control the countdown
* A Stop button to end the current Pomodoro cycle and move to the finished state
* An audible notification when a session or break ends

If automatic study or breaks are disabled, the user must manually start the timer after each state change, giving full control over pacing.

The application is split into several files, each responsible for a specific part of the functionality.

### JavaScript: `script.js`
This file contains all timer logic and state management for the Pomodoro system.

When the page loads, `script.js` retrieves the user’s Pomodoro settings from the HTML (embedded as JSON using Jinja) and stores references to key DOM elements (buttons, timer, pet animation).

Event listeners are attached to the buttons, which trigger the `startTimer` and `stopTimer` functions.

The timer logic is implemented using a **state-based approach**. The app switches between the following states: `idle`, `study`, `break`, `finished`

Each state:
* Sets the appropriate countdown duration
* Updates the timer display
* Starts or stops the countdown interval
* Updates button text
* Switches the pet animation by applying CSS classes

Pausing is **not** handled as a separate state. Instead, the Start button toggles between starting and pausing the interval when pressed during an active session.

The countdown itself is driven by a JavaScript interval that decreases the remaining time every second. When the timer reaches zero, an alarm sound is played and the app transitions automatically to the next state (either break or idle, depending on context).

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
