// Get pomodoro settings from user form
const SETTINGS = JSON.parse(document.getElementById("settings").textContent);

// declare variables
let timer = null;
let isRunning = false;
let longBreak = false;
let minutes;
let seconds;
let pomoCount;
let currentState;
let audio = null;

// grab DOM elements
const StartButton = document.querySelector("#start_button");
const StopButton = document.querySelector("#stop_button");
const SkipButton = document.querySelector("#skip_button");
const Countdown = document.getElementById("timer");
const pet = document.querySelector(".pet");

// guard against missing DOM elements
if (!StartButton || !StopButton || !SkipButton || !Countdown || !pet) {
  console.error("Required DOM elements not found");
  throw new Error("Required DOM elements not found");
}

// add EventListeners for buttons -> call Start and Stop functions
StartButton.addEventListener("click", startTimer);
StopButton.addEventListener("click", stopTimer);
SkipButton.addEventListener("click", skipTimer);

// State variables & state transition function
const STATES = {
  IDLE: "idle",
  STUDY: "study",
  BREAK: "break",
  FINISHED: "finished",
};

// local Storage functions to save, load and clear Runtime
const STORAGE_KEY = "pomoRuntime";

function saveRuntime() {
  // validate state
  if (
    !Object.values(STATES).includes(currentState) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds) ||
    !Number.isFinite(pomoCount)
  ) {
    return;
  }

  const runtime = {
    state: currentState,
    minutes: minutes,
    seconds: seconds,
    pomoCount: pomoCount,
    isRunning: isRunning,
    longBreak: longBreak,
    savedAt: Date.now(),
    settings: SETTINGS,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime));
  } catch {
    return;
  }
}

function loadRuntime() {
  let raw;

  // validation
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearRuntime() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

// validate Runtime function
function isValidRuntime(runtime) {
  if (!runtime || typeof runtime !== "object") {
    return false;
  }

  if (!Object.values(STATES).includes(runtime.state)) {
    return false;
  }

  if (
    !Number.isInteger(runtime.minutes) ||
    !Number.isInteger(runtime.seconds) ||
    !Number.isInteger(runtime.pomoCount)
  ) {
    return false;
  }

  if (runtime.minutes < 0 || runtime.seconds < 0 || runtime.seconds > 59) {
    return false;
  }

  if (runtime.pomoCount < 0 || runtime.pomoCount > SETTINGS.pomocount) {
    return false;
  }

  if (typeof runtime.isRunning !== "boolean") {
    return false;
  }

  if (typeof runtime.longBreak !== "boolean") {
    return false;
  }

  if (!Number.isFinite(runtime.savedAt)) {
    return false;
  }

  return true;
}

// apply Elapsed Time to runtime
function applyElapsedTime(elapsedSeconds) {
  let totalSeconds = minutes * 60 + seconds;
  totalSeconds -= elapsedSeconds;

  if (totalSeconds <= 0) {
    minutes = 0;
    seconds = 0;
    handleTimerFinished();
    return true; // session finished
  }

  minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;
  return false; // session still active
}

// how long saved session is allowed to sit before it's considered stale
const SESSION_STALE_MS = 30 * 60 * 1000 // 30 minutes

// initialization function for runtime
function init() {
  const runtime = loadRuntime();

  // no saved session - fresh start
  if (!runtime) {
    currentState = STATES.IDLE;
    pomoCount = 0;
    setState(STATES.IDLE);
    return;
  }

  // validation
  if (!isValidRuntime(runtime)) {
    clearRuntime();
    currentState = STATES.IDLE;
    pomoCount = 0;
    setState(STATES.IDLE);
    return;
  }

  // stale session - too much time has passed, start fresh instead of resuming ression
  if (Date.now() - runtime.savedAt > SESSION_STALE_MS) {
    clearRuntime();
    currentState = STATES.IDLE;
    pomoCount = 0;
    setState(STATES.IDLE);
    return;
  }

  currentState = runtime.state;
  minutes = runtime.minutes;
  seconds = runtime.seconds;
  pomoCount = runtime.pomoCount;
  isRunning = runtime.isRunning;
  longBreak = runtime.longBreak;

  // IDLE previews study duration: always syncs to current settings
  if (currentState === STATES.IDLE) {
    minutes = SETTINGS.study;
    seconds = 0;
  }

  // compare against current Flask SETTINGS to refresh localstorage if SETTINGS were changed
  let oldDuration = null;
  let newDuration = null;

  if (!runtime.settings) {
    clearRuntime();
    currentState = STATES.IDLE;
    pomoCount = 0;
    setState(STATES.IDLE);
    return;
  }

  if (currentState === STATES.STUDY) {
    oldDuration = runtime.settings.study;
    newDuration = SETTINGS.study;
  } else if (currentState === STATES.BREAK) {
    // long break
    if (longBreak === true) {
      oldDuration = runtime.settings.long_break;
      newDuration = SETTINGS.long_break;
    }

    // short break
    else {
      oldDuration = runtime.settings.short_break;
      newDuration = SETTINGS.short_break;
    }
  }

  // adjust remaining time by difference
  if (oldDuration !== null && oldDuration !== newDuration) {
    const diffMinutes = newDuration - oldDuration;
    let totalSeconds = minutes * 60 + seconds + diffMinutes * 60;

    // clamp to at least 1 second so it doesn't finish instantly
    if (totalSeconds < 1) {
      totalSeconds = 1;
    }

    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds % 60;
  }

  updatePetAnimation(currentState);

  // if it was running -> calculate elapsed time
  if (isRunning) {
    const elapsed = Math.floor((Date.now() - runtime.savedAt) / 1000);
    const finished = applyElapsedTime(elapsed);

    // only restart interval if session did NOT already finish
    if (!finished && currentState === runtime.state) {
      startInterval();
    }
  } else if (currentState === STATES.STUDY || currentState === STATES.BREAK) {
    // auto-start study if setting is on
    if (currentState === STATES.STUDY && SETTINGS.autostudy === true) {
      startInterval();
    }
    // auto-start break if setting is on
    else if (currentState === STATES.BREAK && SETTINGS.autobreak === true) {
      startInterval();
    } else {
      pet.classList.add("paused");
    }
  }

  updateDisplay();
}

// start or stop timer without changing state or clicking buttons
function startInterval() {
  clearInterval(timer);
  isRunning = true;
  timer = setInterval(updateTimer, 1000);
  pet.classList.remove("paused");
  saveRuntime();
  updateDisplay();
}

function stopInterval() {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  saveRuntime();
  if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
    updateDisplay();
  }
}

function setState(newState) {
  stopInterval();
  pet.classList.remove("paused");
  currentState = newState;
  updatePetAnimation(currentState);

  // Idle state
  if (currentState === STATES.IDLE) {
    minutes = SETTINGS.study;
    seconds = 0;
  }

  // Study state
  else if (currentState === STATES.STUDY) {
    minutes = SETTINGS.study;
    seconds = 0;

    // auto-start study if setting is on
    if (SETTINGS.autostudy === true) {
      startInterval();
    }
  }

  // Break state -> long break after 4 sessions, else short break
  else if (currentState === STATES.BREAK) {
    // Check session count
    if (pomoCount === SETTINGS.pomocount) {
      minutes = SETTINGS.long_break;
      longBreak = true;
      pomoCount = 0;
    } else {
      minutes = SETTINGS.short_break;
      longBreak = false;
    }
    seconds = 0;

    // auto-start break if setting is on
    if (SETTINGS.autobreak === true) {
      startInterval();
    }
  }

  else {
    // Finished state: no extra steps needed, fall through to below
  }

  // update Timer display
  updateDisplay();

  saveRuntime();
}

function updatePetAnimation(state) {
  pet.classList.remove("idle", "study", "break", "finished");
  pet.classList.add(state);
}

// unlock Audio to make sure it plays on mobile
function unlockAudio() {
  if (audio) return; // already unlocked
  audio = new Audio("static/sounds/schoolbell.mp3");
  // muted playback attempt to check audio permission
  audio.muted = true;
  audio.play()
    // if play succeeds: play audio for a millisecond then pause and rewind
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false; // restore normal volume
    })
    // if play fails
    .catch(() => {
      audio.muted = false;
    });
}

// Start or Pause button clicked
function startTimer() {
  // unlock audio to give browser permission to play audio
  unlockAudio();
  if (currentState === STATES.FINISHED || currentState === STATES.IDLE) {
    // hard reset Pomo Count after explicit Stop
    if (currentState === STATES.FINISHED) {
      pomoCount = 0;
    }
    // resume ongoing cycle
    setState(STATES.STUDY);
    if (!isRunning) {
      startInterval();
    }
    return;
  }

  // if Pomodoro Timer not yet running
  if (!isRunning) {
    startInterval();
  }

  // if Pomodoro Timer running -> Pause
  else {
    stopInterval();
    pet.classList.add("paused");
  }
}

// Stop button clicked
function stopTimer() {
  // Pressed when finished -> set to idle
  if (currentState === STATES.FINISHED) {
    pomoCount = 0;
    setState(STATES.IDLE);
  }

  // Pressed when studying -> set to finished
  else if (currentState === STATES.STUDY || currentState === STATES.BREAK) {
    setState(STATES.FINISHED);
  }
}

// Skip button clicked
function skipTimer() {
  // pressed during Study -> skip to next Break
  if (currentState === STATES.STUDY) {
    pomoCount++;
    setState(STATES.BREAK);
  }

  // pressed during Break -> skip to next Study session
  else if (currentState === STATES.BREAK) {
    setState(STATES.STUDY);
  }

  // pressed during Idle or Finished -> do nothing
  else {
    return;
  }
}

// Update timer function -> updates timer every second
function updateTimer() {
  // Check if timer is still going
  if (seconds > 0) {
    seconds--;
    // Check if minute has lapsed
  } else if (minutes > 0) {
    seconds = 59;
    minutes--;
    // Otherwise: timer is finished
  } else {
    handleTimerFinished();
    return;
  }
  updateDisplay();
}

// Timer finished function
function handleTimerFinished() {
  stopInterval();
  // play alarm sound if setting on
  if (SETTINGS.alarmsound === true && audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // If Study countdown up (instead of break countdown)
  if (currentState === STATES.STUDY) {
    // increment Pomodoro session count
    pomoCount++;
    // change to Break
    setState(STATES.BREAK);
  }
  // if Break countdown up, change to Study if autostudy is on
  else if (SETTINGS.autostudy === false) {
    setState(STATES.STUDY);
  }
  // if Break countdown up, change to Idle if autostudy is off
  else {
    setState(STATES.IDLE);
  }
}

// Format Time function
function formatTime(minutes, seconds) {
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Update Countdown display & browser tab
function updateDisplay() {
  Countdown.textContent = formatTime(minutes, seconds);
  document.title = `Study Budgie ${formatTime(minutes, seconds)}`;
  updateStartButton();
}

// Update Start/Pause button display
function updateStartButton() {
  StartButton.textContent = isRunning ? "Pause" : "Start";
}

init();

// clear timer on page unload
window.addEventListener("beforeunload", saveRuntime);