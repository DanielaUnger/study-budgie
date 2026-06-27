# Study Budgie

![Animation of Pomodoro countdown in action featuring a stylized illustration of a budgie](/static/img/studybudgie.gif)

## Description:

Study Budgie is a Pomodoro timer web application featuring a cute animated budgie mascot.

## Live Demo

`https://study-budgie.onrender.com`

## Features

- Customizable study sessions, short/long breaks, and interval counts
- Animated budgie mascot that responds to timer states
- Auto-start options for study sessions and breaks
- Timer state persists across page reloads (via localStorage)
- Settings saved between visits (via Flask session)
- Audio notifications
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

> **Secret key:** User settings are stored in a Flask session (cookie-based). The app includes a hardcoded secret key for development — in production, replace it with a strong random value supplied via an environment variable (e.g. `SECRET_KEY`), and never commit the key to version control.

## How It Works

| File | Responsibility |
|---|---|
| `script.js` | Timer logic, state machine (`idle` → `study` → `break` → `finished`), `localStorage` persistence |
| `app.py` | Flask routing, form handling, session-based settings storage |
| `pomo_style.css` | Layout, button styles, CSS sprite-sheet animation for the budgie |
| `layout.html` | Shared header, nav, and asset imports (Jinja blocks) |
| `index.html` | Main timer UI with controls and pet animation container |
| `start.html` | Settings form |

## Credits

- Budgie artwork: Designed by me in Adobe Illustrator
- Sound effect: Sound Effect by [Universfield](https://pixabay.com/de/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199584) from [Pixabay](https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199584)

## Copyright

© 2026 Daniela Unger. All rights reserved.
