const audioContext = new (window.AudioContext || window.webkitAudioContext)();

if (audioContext.state === "suspended") {
  audioContext.resume();
}

Tone.setContext(audioContext);

document.addEventListener("mousemove", function () {
  audioContext.resume().then(() => {
    console.log("AudioContext resumed successfully");
  });

  Tone.start();

  document.removeEventListener("mousemove", arguments.callee);
});

var reverb = 0.5;
var delay = 0.5;
var phaser = 0.5;
var chorus = 0.5;

var quantizeMidis = false;

const percussiveSynthEnvelope = {
  attack: 0.005,
  decay: 0.1,
  sustain: 0,
};

const sustainedSynthEnvelope = {
  attack: 0.05,
  decay: 1,
  sustain: 0,
};

const sineVolume = -43;
const triangleVolume = sineVolume - 1.5;

const synthTypes = [
  {
    type: 1,
    settings: {
      oscillator: "sine",
      envelope: percussiveSynthEnvelope,
      volume: sineVolume,
    },
    name: "Percussive Sine Synth",
  },
  {
    type: 2,
    settings: {
      oscillator: "triangle",
      envelope: percussiveSynthEnvelope,
      volume: triangleVolume,
    },
    name: "Percussive Triangle Synth",
  },
  {
    type: 3,
    settings: {
      oscillator: "sine",
      envelope: sustainedSynthEnvelope,
      volume: sineVolume,
    },
    name: "Sustained Sine Synth",
  },
  {
    type: 4,
    settings: {
      oscillator: "triangle",
      envelope: sustainedSynthEnvelope,
      volume: triangleVolume,
    },
    name: "Sustained Triangle Synth",
  },
];

var synthType = synthTypes[0];

bus = new Tone.Gain();

polySynth = new Tone.PolySynth();

polySynth.set({
  maxPolyphony: 20,
});

setSynthSettings(synthType.settings);

function setSynthEnvelope(envelope) {
  polySynth.set({
    envelope: envelope,
  });
}

function setSynthOscillator(oscillator) {
  polySynth.set({
    oscillator: {
      type: oscillator,
    },
  });
}

function generateRandomSynthEnvelope() {
  const attack = Math.random() * (0.05 - 0.005) + 0.005; // Interval: [0.005, 0.05]
  const decay = Math.random() * (1 - 0.1) + 0.1; // Interval: [0.1, 1]
  const envelope = {
    attack: attack,
    decay: decay,
    sustain: 0,
  };
  return envelope;
}

function setRandomSynthSettings(randOsc) {
  let randomOscillator = "sine";
  if (randOsc) {
    randomOscillator = Math.random() > 0.5 ? "sine" : "triangle";
  }
  const randomEnvelope = generateRandomSynthEnvelope();
  setSynthOscillator(randomOscillator);
  setSynthEnvelope(randomEnvelope);
  if (randomOscillator == "sine") {
    polySynth.volume.value = sineVolume;
  } else {
    polySynth.volume.value = triangleVolume;
  }
}

function setSynthSettings(settings) {
  const oscillator = settings.oscillator;
  const envelope = settings.envelope;
  const volume = settings.volume;
  setSynthOscillator(oscillator);
  setSynthEnvelope(envelope);
  polySynth.volume.value = volume;
}

bus.toDestination();

polySynth.toDestination();

//function for generating sound from a given note with a given velocity with tone js
function generateSound(note, velocity) {
  if (synthType == "random2") {
    setRandomSynthSettings(false);
  }
  if (velocity > 0) {
    polySynth.triggerAttack(note, Tone.now(), velocity);
  }
}

function activateEffect(effect) {
  effect.output.connect(bus);
  normalizeVolume();
}

function deactivateEffect(effect) {
  effect.output.disconnect();
  normalizeVolume();
}

function updateEffects() {
  Object.values(effects).forEach((effect) => {
    effect.output.gain.value = effect.value;
  });
  normalizeVolume();
}

function normalizeVolume() {
  let wetSum = 0;

  document.querySelectorAll(".effectButton.active").forEach((element) => {
    wetSum += effects[element.id].value;
  });

  const volume = 1 / (wetSum + 1);
  bus.gain.value = volume;
}
