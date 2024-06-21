function sendMidiNote(selectedDevice, note, velocity) {
    // const currentTime = Date.now();
    // if (currentTime - lastSentTime < intervalBetweenNotes) {
    // return;
    // }
    // lastSentTime = currentTime;
  if (typeof note === "string") {
    note = convertNoteStringToMidiNoteValue(note);
  }

  velocity = velocityExpander(velocity, 5);

  console.log("Sending MIDI note:", note, "with velocity:", velocity);

  selectedDevice.send([0x90, note, velocity]);
//   send midi note off after 0.1 seconds
    setTimeout(function () {
    selectedDevice.send([0x80, note, velocity]);
    }, 100);

}

function convertNoteStringToMidiNoteValue(noteString) {
  const note = noteString.slice(0, -1);
  const octave = noteString.slice(-1);
  return 12 * (parseInt(octave) + 1) + noteStringToValue[note];
}

const noteStringToValue = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

function limitVelocity(velocity) {
  if (velocity > 127) {
    return 127;
  } else if (velocity < 0) {
    return 0;
  } else {
    return velocity;
  }
}

function velocityExpander(velocity, expansionFactor){
  return limitVelocity(Math.floor(velocity * expansionFactor));
}


function convertMidiNoteValueToNoteString(midiNoteValue) {
  const octave = Math.floor(midiNoteValue / 12) - 1;
  const note = midiNoteValue % 12;
  return noteValueToString[note] + octave;
}

const noteValueToString = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B",
}


function selectModeAndScale(mode, key){

  const doMaj = [1, 3, 5, 6, 8, 10, 12]

  let scale = doMaj.slice(0);

  mode = mode - 1;

  mode = mode % scale.length; 

  let slicedPart = scale.slice(0, mode);
  let remainingPart = scale.slice(mode);

  scale = remainingPart.concat(slicedPart);

  firstValue = scale[0];

  for (let i = 0; i < scale.length; i++){
  scale[i] = (scale[i] - firstValue + 1 + 12) % 12;
  scale[i] = (scale[i] + key) % 12;
  }

  let scaleQuantized = Array(12).fill(0);

  for (let i = 0; i < scaleQuantized.length; i++){
    scaleQuantized[scale[i]-1] = scale[i];
  }

  tmp = scaleQuantized[0];
  for (let i = 0; i < scaleQuantized.length; i++){
    if(scaleQuantized[i] == 0){
      scaleQuantized[i] = tmp;
    } else {
      tmp = scaleQuantized[i];
    }
  }

  return scaleQuantized;

}

function quantizeMidi(midiNoteValue, mode, key) {
  if(!quantizeMidis){
    return midiNoteValue;
  }
  const octave = Math.floor(midiNoteValue / 12);
  const note = midiNoteValue % 12;
  const scale = selectModeAndScale(mode, key);
  const quantizedNote = scale[note] - 1;
  return quantizedNote + octave * 12;
} 


const noteStringToValueSharp = {
  C: 0,
  Cs: 1,
  D: 2,
  Ds: 3,
  E: 4,
  F: 5,
  Fs: 6,
  G: 7,
  Gs: 8,
  A: 9,
  As: 10,
  B: 11,
  C1: 12,
  Cs1: 13,
  D1: 14,
  Ds1: 15,
  E1: 16,
  F1: 17,
  Fs1: 18,
  G1: 19,
};


function convertKeyValueToNoteValue(keyValue, octaveTranspose){
  return 12 * 5 + octaveTranspose * 12 + noteStringToValueSharp[keyValue] ;
}

const noteValueToStringSharp = {
  0: "C",
  1: "Cs",
  2: "D",
  3: "Ds",
  4: "E",
  5: "F",
  6: "Fs",
  7: "G",
  8: "Gs",
  9: "A",
  10: "As",
  11: "B",
  12: "C1",
  13: "Cs1",
  14: "D1",
  15: "Ds1",
  16: "E1",
  17: "F1",
  18: "Fs1",
  19: "G1",
};

function convertMidiNoteValueToNoteStringSharp(midiNoteValue, octaveTranspose) {
  const note = midiNoteValue - 12 * (5 + octaveTranspose);
  return noteValueToStringSharp[note];
}
