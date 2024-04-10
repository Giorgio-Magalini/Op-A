let lastSentTime = 0;
const intervalBetweenNotes = 70; // Set the interval in milliseconds
const intervalBetweenDiffNotes = 45;
let previousBallNote = null; // Variable to store the previous ball

let previousInputDevice = null; // Variable to store the previous MIDI device

// number from 1 to 7
mode = 5;
// number from 0 to 11
key = 0;

var octaveTranspose = 0;

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  console.log("Web MIDI not supported");
}

// Function called when MIDI access is granted
function onMIDISuccess(midiAccess) {
  // Get a list of available MIDI input devices
  const inputs = midiAccess.inputs.values();
  const inputDevices = Array.from(inputs); // Convert iterator to array

  if (inputDevices.length > 0) {
    const selectInput = document.getElementById("midiSelectInput");

    // Create options for MIDI input devices
    inputDevices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = index;
      if (index == 0) {
        option.selected = true;
      }
      option.text = device.name;
      selectInput.appendChild(option);
    });

    var selectedInputDevice = inputDevices[0];

    handleSelectedInputDevice(selectedInputDevice);

    // Handle device selection
    selectInput.addEventListener("change", function (event) {
      selectedInputDevice = inputDevices[event.target.value];
      handleSelectedInputDevice(selectedInputDevice);
    });
  } else {
    console.log("No MIDI input devices found.");
  }

  // Get a list of available MIDI output devices
  const outputs = midiAccess.outputs.values();
  const outputDevices = Array.from(outputs); // Convert iterator to array

  if (outputDevices.length > 0) {
    const selectOutput = document.getElementById("midiSelectOutput");

    // Create options for MIDI output devices
    outputDevices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = index;
      if (index == 1) {
        option.selected = true;
      }
      option.text = device.name;
      selectOutput.appendChild(option);
    });

    var selectedOutputDevice = outputDevices[1];

    handleSelectedOutputDevice(selectedOutputDevice);

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
        sendMidiNote(
          selectedOutputDevice,
          event.detail.note,
          event.detail.velocity
        );
        generateSound(event.detail.note, event.detail.velocity);
        lastSentTime = currentTime;
        previousBallNote = event.detail.note;
      }
    });
  } else {
    console.log("No MIDI output devices found.");
  }
}

// Function to handle the selected MIDI input device
function handleSelectedInputDevice(selectedDevice) {
  console.log("Selected MIDI Input Device:", selectedDevice.name);
  // Listen for MIDI messages from the selected device
  selectInputDevice(selectedDevice);
}

// Function to handle the selected MIDI output device
function handleSelectedOutputDevice(selectedDevice) {
  console.log("Selected MIDI Output Device:", selectedDevice.name);
}

// When selecting a new MIDI device
function selectInputDevice(newDevice) {
  // Remove the listener from the previous MIDI device, if present
  if (previousInputDevice) {
    previousInputDevice.onmidimessage = null;
  }

  // Assign the new MIDI device
  selectedInputDevice = newDevice;

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

  // Set the current device as the previous device
  previousInputDevice = selectedInputDevice;
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
  C = 12 * (6 + octaveTranspose);
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
