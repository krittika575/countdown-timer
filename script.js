document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // Select the alarm sound dropdown
  const alarmSoundSelect = document.getElementById("alarmSoundSelect");
  // Select the custom sound file input
  const customSoundFileInput = document.getElementById("customSoundFile");
  // Load the default selected sound
  let selectedSound = alarmSoundSelect.value;
  const sound = document.getElementById("sound");
  const buttons = document.querySelectorAll(".timer-button");
  const form = document.querySelector("#form");
  const input = document.querySelector("#input");
  const remainingTime = document.querySelector(".display-remaining-time");
  const endTime = document.querySelector(".display-end-time");
  const dismissButton = document.getElementById("dismissBtn");
  const resetButton = document.getElementById("resetBtn");
  const topicInput = document.getElementById("topic");
  const submitButton = document.getElementById("submitTopic");
  const topicDisplay = document.getElementById("topicDisplay");
  // Check if the Vibration API is supported by the browser
  const isVibrationSupported = "vibrate" in navigator;
  // Vibration pattern (milliseconds)
  const vibrationPattern = [1000, 500, 1000];
  let countdown;

  // Function to vibrate the device
  function vibrateDevice() {
    if (isVibrationSupported) {
      navigator.vibrate(vibrationPattern);
    }
  }

  customSoundFile.classList.add("hidden");

  // Update the selected sound when the dropdown value changes
  alarmSoundSelect.addEventListener("change", function () {
    selectedSound = this.value;
    if (selectedSound === "custom") {
      // If custom sound is selected, allow the user to upload a file
      customSoundFileInput.click();
    } else {
      // If a default sound is selected, update the audio element source
      sound.src = selectedSound;
    }
  });

  // Handle custom sound file selection
  customSoundFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      // Create a blob URL for the selected file
      selectedSound = URL.createObjectURL(file);
      // Update the audio element source
      sound.src = selectedSound;
    }
  });

  dismissButton.classList.add("hidden");
  resetButton.classList.add("hidden");

  function hideResumeButton() {
    document.getElementById("resumeBtn").classList.add("hidden");
  }

  function showResetButton() {
    resetButton.classList.remove("hidden");
  }

  function hideResetButton() {
    resetButton.classList.add("hidden");
  }

  function timer(seconds) {
    clearInterval(countdown);
    const now = Date.now();
    const then = now + seconds * 1000;
    displayRemainingTime(seconds);
    hideResetButton();

    countdown = setInterval(() => {
      const remainingTimeInSeconds = Math.round((then - Date.now()) / 1000);
      if (remainingTimeInSeconds < 0) {
        clearInterval(countdown);
        handleTimerCompletion();
        return;
      }
      displayRemainingTime(remainingTimeInSeconds);
    }, 1000);
  }

  function displayRemainingTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const time = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}`;
    remainingTime.textContent = time;
    document.title = time;
  }

  function startTimer(seconds) {
    sound.pause();
    sound.currentTime = 0;
    input.value = formatTime(seconds);
    document.querySelector(".display").style.display = "flex";
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
    document.getElementById("cancelBtn").classList.remove("hidden");
    document.getElementById("resumeBtn").classList.add("hidden");
    showResetButton();
    timer(seconds);
  }

  function startManualTimer(e) {
    e.preventDefault();
    sound.pause();
    sound.currentTime = 0;
    const timeParts = input.value.split(":").map(part => parseInt(part, 10));
    const seconds = calculateTotalSeconds(timeParts);
    if (seconds <= 0 || isNaN(seconds)) {
      alert("Invalid time format.");
      return;
    }
    timer(seconds);
    hideResetButton();
    dismissButton.classList.add("hidden");
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }

  function padZero(value) {
    return value < 10 ? "0" + value : value;
  }

  function calculateTotalSeconds(timeParts) {
    if (timeParts.length !== 3) return NaN;
    const [hours, minutes, seconds] = timeParts;
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
      return NaN;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  input.addEventListener("input", function (e) {
    if (e.inputType !== "deleteContentBackward") {
      const value = this.value;
      if (value.length === 2 || value.length === 5) {
        this.value += ":";
      }
    }
  });

  function pauseTimer() {
    clearInterval(countdown);
  }

  function resumeTimer() {
    const remainingTimeString = remainingTime.textContent;
    const timeParts = remainingTimeString.split(":").map(part => parseInt(part, 10));
    const seconds = calculateTotalSeconds(timeParts);
    if (!isNaN(seconds)) {
      startTimer(seconds);
    }
  }

  function cancelTimer() {
    clearInterval(countdown);
    remainingTime.textContent = "00:00:00";
    document.title = "Countdown Timer";
    endTime.textContent = "";
    form.reset();
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("resumeBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("cancelBtn").classList.add("hidden");
    dismissButton.classList.add("hidden");
    hideResetButton();
  }

  function handleTimerCompletion() {
    sound.play();
    vibrateDevice();
    dismissButton.classList.remove("hidden");
    showResetButton();
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("cancelBtn").classList.add("hidden");
    document.getElementById("resetBtn").classList.remove("hidden");
    dismissButton.addEventListener("click", function () {
      sound.pause();
      sound.currentTime = 0;
      dismissButton.classList.add("hidden");
      input.value = "";
      document.getElementById("startBtn").classList.remove("hidden");
      document.getElementById("pauseBtn").classList.add("hidden");
      hideResumeButton();
      document.getElementById("cancelBtn").classList.add("hidden");
      hideResetButton();
    });
  }

  resetButton.addEventListener("click", function () {
    resetTimer();
  });

  function resetTimer() {
    clearInterval(countdown);
    remainingTime.textContent = "00:00:00";
    document.title = "Countdown Timer";
    endTime.textContent = "";
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("resumeBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
    document.getElementById("cancelBtn").classList.remove("hidden");
    dismissButton.classList.add("hidden");
    document.querySelector(".display").style.display = "flex";
    hideResetButton();
  }

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const seconds = parseInt(this.dataset.seconds, 10);
      if (!isNaN(seconds) && seconds > 0) {
        startTimer(seconds);
      } else {
       
      }
    });
  });

  form.addEventListener("submit", startManualTimer);

  document.getElementById("startBtn").addEventListener("click", function () {
    const inputTime = input.value.trim();
    const timeParts = inputTime.split(":").map(part => parseInt(part, 10));
    const seconds = calculateTotalSeconds(timeParts);
    if (!isNaN(seconds)) {
      startTimer(seconds);
    } else {
      alert("Invalid time format.");
    }
  });

  document.getElementById("pauseBtn").addEventListener("click", function () {
    pauseTimer();
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("resumeBtn").classList.remove("hidden");
    dismissButton.classList.add("hidden");
    hideResetButton();
  });

  document.getElementById("resumeBtn").addEventListener("click", function () {
    resumeTimer();
    hideResumeButton();
    document.getElementById("pauseBtn").classList.remove("hidden");
    dismissButton.classList.add("hidden");
    hideResetButton();
  });

  document.getElementById("cancelBtn").addEventListener("click", cancelTimer);

// Array to store saved timers
let savedTimers = [];

// Function to save timer
function saveTimer() {
    const inputTime = input.value.trim();
    const timeParts = inputTime.split(":").map(part => parseInt(part, 10));
    const seconds = calculateTotalSeconds(timeParts);
    if (!isNaN(seconds)) {
        const timer = {
            time: inputTime,
            seconds: seconds
        };
        savedTimers.push(timer);
        renderSavedTimers(); // Update the display of saved timers
    } else {
        alert("Invalid time format.");
    }
}

function deleteTimer(index) {
  savedTimers.splice(index, 1);
  renderSavedTimers(); // Update the display of saved timers
}

// Function to render saved timers
function renderSavedTimers() {
  savedTimersContainer.innerHTML = '';
  savedTimers.forEach((timer, index) => {
      const timerItem = document.createElement('div');
      timerItem.classList.add('saved-timer');

      // Create a span element for the saved time and apply CSS styles
      const timeSpan = document.createElement('span');
      timeSpan.textContent = timer.time;
      timeSpan.classList.add('saved-time'); // Add a CSS class for styling
      timerItem.appendChild(timeSpan);

      // Create a delete button and apply CSS styles
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('delete-timer');
      deleteButton.addEventListener('click', () => deleteTimer(index)); // Use event listener instead of inline onclick
      timerItem.appendChild(deleteButton);

      savedTimersContainer.appendChild(timerItem);
  });
}


// Event delegation for delete buttons
savedTimersContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-timer")) {
      const index = event.target.dataset.index;
      deleteTimer(index);
  }
});



// Event listener for save button
document.getElementById("saveBtn").addEventListener("click", saveTimer);
});