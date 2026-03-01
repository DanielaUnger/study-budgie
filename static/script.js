// Get pomodoro settings from user form
const SETTINGS = JSON.parse(document.getElementById("settings").textContent);

// TODO: set runtimeState object in localStorage as JSON (with state, is Running, secondsleft, pomoCount, savedat)

// declare variables
let timer = null;
let isRunning = false;
let minutes = SETTINGS.study; // TODO: change to state from runtime
let seconds = 0; // TODO: change to state from runtime
let pomoCount = 0; // TODO change to state from runtime (only declare vars here and move setting values to bottom)
const audio = new Audio("static/sounds/schoolbell.mp3");

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

let currentState = STATES.IDLE; // TODO: change to state from runtime

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
  // TODO: update runtime state to state = x
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
    // TODO: update runtime state to running = y
  }

  // if Pomodoro Timer running -> Pause
  else {
    stopInterval();
    StartButton.textContent = "Resume";
    pet.classList.add("paused");
    // TODO: update runtime state to running = n
  }
}

// Stop button clicked
function stopTimer() {
  // Pressed when finished -> set to idle
  if (currentState === STATES.FINISHED) {
    setState(STATES.IDLE);
    // TODO: clear runtime state
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
  // TODO: update stored runtime state every second or state change to seconds = x
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

// TODO: INIT FUNCTION:
// set variables
// Check runtime state in localStorage (try - else with setState below)
  // if yes:
    // validate (valid state? time >= 0 and <?= ???? pomCount >= 0 and <= ?????, isRunning = bool)
      // reset if invalid
    //  restore timer state:
      // set currentState -> update pet, remaining seconds = vars -> updateTimer set pomoCount if paused/running: change Button and Pet
  // else, intitialize fresh session

setState(STATES.IDLE);

// clear timer on page unload
window.addEventListener("beforeunload", stopInterval); // TODO: before stopInterval, persist final timer state and savedAt for timestamp and elapsed-time logic