// Get pomodoro settings from user form
const SETTINGS = JSON.parse(document.getElementById("settings").textContent);

// declare variables
let timer = null;
let isRunning = false;
let minutes = SETTINGS.study;
let seconds = 0;
let pomoCount = 0;
const audio = new Audio("static/sounds/schoolbell.mp3");

// grab DOM elements
const StartButton = document.querySelector("#start_button");
const StopButton = document.querySelector("#stop_button");
const Countdown = document.getElementById("timer");
const pet = document.querySelector(".pet");

// guard against missing DOM elements
if (!StartButton || !StopButton || !Countdown || !pet) {
  console.error("Required DOM elements not found");
  throw new Error("Required DOM elements not found");
}

// add EventListeners for buttons -> call Start and Stop functions
StartButton.addEventListener("click", startTimer);
StopButton.addEventListener("click", stopTimer);

// State variables & state transition function
const STATES = {
  IDLE: "idle",
  STUDY: "study",
  BREAK: "break",
  FINISHED: "finished",
};

let currentState = STATES.IDLE;

// start or stop timer without changing state or clicking buttons
function startInterval() {
  clearInterval(timer);
  isRunning = true;
  timer = setInterval(updateTimer, 1000);
  pet.classList.remove("paused");
  StartButton.textContent = "Pause";
}

function stopInterval() {
  clearInterval(timer);
  timer = null;
  isRunning = false;
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
    StartButton.textContent = "Start";

    // auto-start study if setting is on
    if (SETTINGS.autostudy === true) {
      currentState = STATES.STUDY;
      updatePetAnimation(currentState);
      minutes = SETTINGS.study;
      seconds = 0;
      updateDisplay();
      startInterval();
      return;
    }
  }

  // Study state
  if (currentState === STATES.STUDY) {
    minutes = SETTINGS.study;
    seconds = 0;
  }

  // Break state -> long break after 4 sessions, else short break
  if (currentState === STATES.BREAK) {
    // Check session count
    if (pomoCount === SETTINGS.pomocount) {
      minutes = SETTINGS.long_break;
      pomoCount = 0;
    } else {
      minutes = SETTINGS.short_break;
    }
    seconds = 0;

    // auto-start break if setting is on
    if (SETTINGS.autobreak === true) {
      startInterval();
    } else {
      StartButton.textContent = "Start";
    }
  }

  // Finished state
  if (currentState === STATES.FINISHED) {
    StartButton.textContent = "Start";
    pomoCount = 0;
  }

  // update Timer display
  updateDisplay();
}

function updatePetAnimation(state) {
  pet.classList.remove("idle", "study", "break", "finished");
  pet.classList.add(state);
}

// Start or Pause button clicked
function startTimer() {
  // change to Study State
  if (currentState === STATES.IDLE || currentState === STATES.FINISHED) {
    setState(STATES.STUDY);
  }

  // if Pomodoro Timer not yet running
  if (!isRunning) {
    startInterval();
  }

  // if Pomodoro Timer running -> Pause
  else {
    stopInterval();
    StartButton.textContent = "Resume";
    pet.classList.add("paused");
  }
}

// Stop button clicked
function stopTimer() {
  // Pressed when finished -> set to idle
  if (currentState === STATES.FINISHED) {
    setState(STATES.IDLE);
  }

  // Pressed when studying -> set to finished
  else if (currentState === STATES.STUDY || currentState === STATES.BREAK) {
    setState(STATES.FINISHED);
  }
}

// Update timer function -> updates timer every second
function updateTimer() {
  // Check if timer is finished
  if (minutes === 0 && seconds === 0) {
    handleTimerFinished();
    return;
  }

  // if Countdown still going -> loop
  // Subtract seconds
  if (seconds > 0) {
    seconds--;
  }
  // Subtract minute
  else {
    seconds = 59;
    minutes--;
  }
  // Update Countdown in HTML page
  updateDisplay();
}

// seperate Timer finished function
function handleTimerFinished() {
  stopInterval();
  // play alarm sound
  audio.play().catch(() => {});

  // If Study countdown up (instead of break countdown)
  if (currentState === STATES.STUDY) {
    // increment Pomodoro session count
    pomoCount++;
    // change to Break
    setState(STATES.BREAK);
  }
  // if Break countdown up, change to Idle
  else {
    setState(STATES.IDLE);
  }
}

// Format Time function
function formatTime(minutes, seconds) {
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Update Countdown display
function updateDisplay() {
  Countdown.textContent = formatTime(minutes, seconds);
}

setState(STATES.IDLE);

// clear timer on page unload
window.addEventListener("beforeunload", stopInterval);
