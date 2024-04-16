function startAudioContext() {
  const audioContext = new AudioContext();

  Tone.setContext(audioContext);

  Tone.start();
}

window.onload = function () {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
};

document.addEventListener("DOMContentLoaded", function () {
  let toneLoaded = false;

  function loadTone(event) {
    if (!toneLoaded) {
      const script = document.createElement("script");
      script.src = "libraries/tone.js";
      script.onload = initializeTone;
      document.head.appendChild(script);

      document.getElementById("myModal").style.display = "none";

      toneLoaded = true;

      event.target.removeEventListener(event.type, event.callee);
    }
  }

  document.addEventListener("click", loadTone);
  document.addEventListener("touchstart", loadTone);
});

function initializeTone() {
  startAudioContext();
  initToneSynth();
  initEffects();
  setConnections();
}

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

const effects = {
  reverb: {
    id: "reverb",
    effect: null,
    output: null,
    value: 0.5,
  },
  delay: {
    id: "delay",
    effect: null,
    output: null,
    value: 0.5,
  },
  phaser: {
    id: "phaser",
    effect: null,
    output: null,
    value: 0.5,
  },
  chorus: {
    id: "chorus",
    effect: null,
    output: null,
    value: 0.5,
  },
};

function initEffects() {
  effects["reverb"].effect = new Tone.Reverb({
    decay: 5,
    preDelay: 0,
    wet: 1,
  });

  effects["delay"].effect = new Tone.FeedbackDelay({
    delayTime: 0.7,
    feedback: 0.5,
    wet: 1,
  });

  effects["phaser"].effect = new Tone.Phaser({
    frequency: 20,
    octaves: 0.9,
    baseFrequency: 1000,
    wet: 1,
  });

  effects["chorus"].effect = new Tone.Chorus({
    frequency: 4,
    delayTime: 2.5,
    depth: 0.5,
    wet: 1,
  }).start();

  for (const effectKey in effects) {
    if (effects.hasOwnProperty(effectKey)) {
      const effect = effects[effectKey];
      effect.output = new Tone.Gain();
    }
  }

  configureEffectSliders(0, 1);

  initEffectButtons();
}

// function to scale a value from one range to another
function scaleValue(value, oldMin, oldMax, newMin, newMax) {
  var oldValueRange = oldMax - oldMin;
  var newValueRange = newMax - newMin;
  var scaledValue = ((value - oldMin) * newValueRange) / oldValueRange + newMin;
  return scaledValue;
}

function configureEffectSliders(min, max) {
  document.querySelectorAll(".slider").forEach((slider) => {
    slider.addEventListener("input", function () {
      effects[slider.id].value = scaleValue(this.value, 0, 100, min, max);
      updateEffects();
    });
  });
}

function initEffectButtons() {

  Object.values(effects).forEach(function (effect) {
    var effectButton = document.getElementById(effect.id);

    effectButton.addEventListener("click", function () {
      const isActive = effectButton.classList.contains("active");

      if (isActive) {
        effectButton.classList.remove("active");
        deactivateEffect(effect);
      } else {
        effectButton.classList.add("active");
        activateEffect(effect);
      }
    });
  });
}

function initToneSynth() {
  polySynth = new Tone.PolySynth();
  polySynth.set({
    maxPolyphony: 20,
  });
  if (synthType.settings) {
    setSynthSettings(synthType.settings);
  }
}

function setConnections() {
  effectBus = new Tone.Gain();
  mixBus = new Tone.Gain();
  compressor = new Tone.Compressor(-30, 4);
  compressor.attack = 0;
  limiter = new Tone.Limiter(-12);
  outGain = new Tone.Gain();
  outGain.gain.value = 1;

  effectBus.connect(compressor);
  polySynth.connect(compressor);

  compressor.connect(limiter);
  limiter.connect(outGain);
  outGain.toDestination();

  Object.values(effects).forEach((effect) => {
    effect.effect.disconnect();
    polySynth.connect(effect.effect);
    effect.effect.connect(effect.output);
  });
}

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
  setSynthOscillator(settings.oscillator);
  setSynthEnvelope(settings.envelope);
  polySynth.volume.value = settings.volume;
}

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
  effect.output.connect(effectBus);
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
  effectBus.gain.value = volume;
}
