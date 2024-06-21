let lastSentTime = 0;
const intervalBetweenNotes = 70; // Set the interval in milliseconds
const intervalBetweenDiffNotes = 45;
let previousBallNote = null; // Variable to store the previous ball

let selectedInputDevice = null;

// number from 1 to 7
mode = 5;
// number from 0 to 11
key = 0;

var octaveTranspose = 0;

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  console.log("Web MIDI not supported");
  document.addEventListener("collision", (event) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastSentTime;
    if (
      deltaTime > intervalBetweenNotes ||
      (deltaTime < intervalBetweenNotes &&
        event.detail.note != previousBallNote &&
        deltaTime > intervalBetweenDiffNotes)
    ) {
      generateSound(event.detail.note, event.detail.velocity);
      lastSentTime = currentTime;
      previousBallNote = event.detail.note;
    }
  });
}

// Function called when MIDI access is granted
function onMIDISuccess(midiAccess) {
  // Get a list of available MIDI input devices
  const inputs = midiAccess.inputs.values();
  let inputDevices = [];
  if (inputs) {
    inputDevices = Array.from(inputs);
  }
  inputDevices.unshift(null); // Add null at the beginning of the array

  if (inputDevices.length === 1) {
    console.log("No MIDI input devices found.");
  }

  var selectedInputDevice = inputDevices[0];

  handleSelectedInputDevice(selectedInputDevice);

  const selectInput = document.getElementById("midiSelectInput");

  // Create options for MIDI input devices
  inputDevices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = index;
    if (index == 0) {
      option.selected = true;
    }
    if (device) {
      option.text = device.name;
    } else {
      option.text = "None";
    }
    selectInput.appendChild(option);
  });

  // Handle device selection
  selectInput.addEventListener("change", function (event) {
    selectedInputDevice = inputDevices[event.target.value];
    handleSelectedInputDevice(selectedInputDevice);
  });

  // Get a list of available MIDI output devices
  const outputs = midiAccess.outputs.values();
  let outputDevices = [];
  if (outputs) {
    outputDevices = Array.from(outputs);
  }
  outputDevices.unshift(null); // Add null at the beginning of the array

  if (outputDevices.length === 1) {
    console.log("No MIDI output devices found.");
  }

  var selectedOutputDevice = outputDevices[0];

  handleSelectedOutputDevice(selectedOutputDevice);

  const selectOutput = document.getElementById("midiSelectOutput");

  // Create options for MIDI output devices
  outputDevices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = index;
    if (index == 0) {
      option.selected = true;
    }
    if (device) {
      option.text = device.name;
    } else {
      option.text = "None";
    }
    selectOutput.appendChild(option);
  });

  // Handle device selection
  selectOutput.addEventListener("change", function (event) {
    selectedOutputDevice = outputDevices[event.target.value];
    handleSelectedOutputDevice(selectedOutputDevice);
  });

  document.addEventListener("collision", (event) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastSentTime;
    if (
      deltaTime > intervalBetweenNotes ||
      (deltaTime < intervalBetweenNotes &&
        event.detail.note != previousBallNote &&
        deltaTime > intervalBetweenDiffNotes)
    ) {
      if (selectedOutputDevice) {
        sendMidiNote(
          selectedOutputDevice,
          event.detail.note,
          event.detail.velocity
        );
      }
      generateSound(event.detail.note, event.detail.velocity);
      lastSentTime = currentTime;
      previousBallNote = event.detail.note;
    }
  });
}

// Function to handle the selected MIDI input device
function handleSelectedInputDevice(selectedDevice) {
  if (!selectedDevice) {
    if (selectedInputDevice)
      // Remove the listener from the previous MIDI device, if present
      selectedInputDevice.onmidimessage = null;
    console.log("No MIDI input device selected.");
    return;
  }
  if (selectedInputDevice) {
    // Remove the listener from the previous MIDI device, if present
    selectedInputDevice.onmidimessage = null;
  }

  console.log("Selected MIDI Input Device:", selectedDevice.name);

  // Assign the new MIDI device
  selectedInputDevice = selectedDevice;

  // Listen for MIDI messages from the selected device
  selectedInputDevice.onmidimessage = function (message) {
    // if is a note on message
    if (message.data[0] == 144) {
      // console.log("Received MIDI Message:", message.data);
      customEvent = new CustomEvent("newBall", {
        detail: {
          note: convertMidiNoteValueToNoteString(
            quantizeMidi(message.data[1], mode, key)
          ),
        },
      });
      document.dispatchEvent(customEvent);
    }
    // toggle active note button
    if (message.data[0] == 128 || message.data[0] == 144) {
      toggleActiveNoteButton(message.data[1]);
    }
  };
}

// Function to handle the selected MIDI output device
function handleSelectedOutputDevice(selectedDevice) {
  if (!selectedDevice) {
    console.log("No MIDI output device selected.");
    return;
  }
  console.log("Selected MIDI Output Device:", selectedDevice.name);
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
}

// get all the buttons with the class "notes-block button" and add an event listener to each one
document.querySelectorAll(".notes-block button").forEach((notesButtons) => {
  notesButtons.addEventListener("click", () => {
    customEvent = new CustomEvent("newBall", {
      detail: {
        note: convertMidiNoteValueToNoteString(
          quantizeMidi(
            convertKeyValueToNoteValue(notesButtons.id, octaveTranspose),
            mode,
            key
          )
        ),
      },
    });
    document.dispatchEvent(customEvent);
  });
});

function isInKeyboardRange(note) {
  C = 12 * (5 + octaveTranspose);
  G1 = C + 19;
  return note >= C && note <= G1;
}

function toggleActiveNoteButton(note) {
  if (isInKeyboardRange(note)) {
    const noteButton = document.getElementById(
      convertMidiNoteValueToNoteStringSharp(note, octaveTranspose)
    );
    noteButton.classList.toggle("active");
  }
}

// event listener for the oscillator type buttons
document.querySelectorAll("button.oscType").forEach((oscType) => {
  oscType.addEventListener("click", () => {
    if (isNaN(oscType.id)) {
      synthType = oscType.id;
      setRandomSynthSettings(true);
    } else {
      synthType = synthTypes[oscType.id];
      setSynthSettings(synthType.settings);
    }
  });
});

const waveSelectors = document.querySelectorAll(".oscType"); // Seleziona tutti gli elementi con la classe 'oscType'
waveSelectors.forEach((waveSelector) => {
  waveSelector.addEventListener("click", function () {
    waveSelectors.forEach((ws) => ws.classList.remove("on")); // Rimuove la classe 'on' da tutti gli elementi
    this.classList.add("on"); // Aggiunge la classe 'on' all'elemento cliccato
  });
});

function initializeWaveSelectors() {
  waveSelectors.forEach((waveSelector) => {
    waveSelector.classList.remove("on");
  });
  waveSelectors[0].classList.add("on");
}

initializeWaveSelectors();

const octaveUpButton = document.getElementById("octaveUp");

octaveUpButton.addEventListener("click", () => {
  octaveTranspose++;
  if (octaveTranspose > 3) {
    octaveTranspose = 3;
  }
});

const octaveDownButton = document.getElementById("octaveDown");

octaveDownButton.addEventListener("click", () => {
  octaveTranspose--;
  if (octaveTranspose < -3) {
    octaveTranspose = -3;
  }
});

const keysButtons = document.querySelectorAll(".notes-block button");
keysButtons.forEach((keysButtons) => {
  document
    .getElementById(keysButtons.id)
    .addEventListener("mousedown", function () {
      this.classList.add("active");
    });

  document
    .getElementById(keysButtons.id)
    .addEventListener("mouseup", function () {
      this.classList.remove("active");
    });

  document
    .getElementById(keysButtons.id)
    .addEventListener("mouseleave", function () {
      this.classList.remove("active");
    });
});

// add an event listener for all the buttons called "nextPrev_button"
document.querySelectorAll(".nextPrev_button").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (event.target.id === "nextMode" || event.target.id === "prevMode") {
      // get the id of the div with class "first" and class "mode"
      mode = parseInt(document.querySelector(".first.mode").id);
    }
    if (event.target.id === "nextKey" || event.target.id === "prevKey") {
      // get the id of the div with class "first" and class "key"
      key = parseInt(document.querySelector(".first.keySignature").id);
    }
    changeKeyModeBalls(mode, key);
  });
});

function initKeyMode() {
  mode = parseInt(document.querySelector(".first.mode").id);
  key = parseInt(document.querySelector(".first.keySignature").id);
  changeKeyModeBalls(mode, key);
}

initKeyMode();

function darkenSlides() {
  document.querySelectorAll(".slide").forEach((slide) => {
    slide.classList.add("darkened");
  });
}

darkenSlides();

function lightenSlides() {
  document.querySelectorAll(".slide").forEach((slide) => {
    slide.classList.remove("darkened");
  });
}

document.getElementById("onOffButton").addEventListener("click", function () {
  this.classList.toggle("on");
  if (this.classList.contains("on")) {
    quantizeMidis = true;
    this.textContent = "on";
    changeKeyModeBalls(mode, key);
    lightenSlides();
  } else {
    quantizeMidis = false;
    this.textContent = "off";
    darkenSlides();
  }
});

document.getElementById("muteOPA").classList.add("on");

document.getElementById("muteOPA").addEventListener("click", function () {
  this.classList.toggle("on");
  if (this.classList.contains("on")) {
    muteOPA = false;
    this.textContent = "mute OP-A";
  } else {
    muteOPA = true;
    this.textContent = "unmute OP-A";
  }
});
