const startStopBtn = document.querySelector('#startStopBtn');
const resetBtn = document.querySelector('#resetBtn');
const stopwatch = document.querySelector('#stopwatch');

let startTime = 0;
let stopTime;
let stopwatchInterval;

startStopBtn.onclick = startStopStopwatch;
resetBtn.onclick = resetStopwatch;

function startStopStopwatch() {
  // start stopwatch
  if (startStopBtn.textContent === 'Start') { 
    if (startTime === 0) {
      startTime = Date.now();
    } else {
      // update startTime when stopwatch resumed
      // used to resume stopwatch at previous time
      startTime = startTime + Date.now() - stopTime;
    }

    const ONE_SECOND = 1000;
    stopwatchInterval = setInterval(displayStopwatch, ONE_SECOND);

    stopBtn();

  // stop stopwatch
  } else {
    // capture when stopwatch is stopped
    // used to resume stopwatch at previous time
    stopTime = Date.now();

    clearInterval(stopwatchInterval);
    startBtn();
  }
}

function displayStopwatch() {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);

  // calculate hours, minutes, and seconds
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - 3600 * hours) / 60);
  let seconds = totalSeconds - (3600 * hours + 60 * minutes);
 
  // add leading zero
  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  seconds = (seconds < 10) ? `0${seconds}` : seconds;

  // display stopwatch
  stopwatch.textContent = `${hours}:${minutes}:${seconds}`;
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  startTime = 0;
  startBtn();
  stopwatch.textContent = '00:00:00';
}

// change button to start button
function startBtn() {
  startStopBtn.textContent = 'Start';
  startStopBtn.classList.remove('bg-red-500');
  startStopBtn.classList.remove('hover:bg-red-600');
  startStopBtn.classList.remove('active:bg-red-500');
  startStopBtn.classList.add('bg-purple-800');
  startStopBtn.classList.add('hover:bg-purple-900');
  startStopBtn.classList.add('active:bg-purple-800');
}

// change button to stop button
function stopBtn() {
  startStopBtn.textContent = 'Stop';
  startStopBtn.classList.remove('bg-purple-800');
  startStopBtn.classList.remove('hover:bg-purple-900');
  startStopBtn.classList.remove('active:bg-purple-800');
  startStopBtn.classList.add('bg-red-500');
  startStopBtn.classList.add('hover:bg-red-600');
  startStopBtn.classList.add('active:bg-red-500');
}

// register sw
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/stop-the-watch/sw.js');
}