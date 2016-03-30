

function Midi(port) {
  this.midi = null;
  this.midi_out = null;
  this.midi_port_id = port;

  // Open MIDI, onMIDISuccess callback function triggers actual playback
  try {
    navigator.requestMIDIAccess().then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
  } catch(err) {
    alert("Unable to call requestMIDIAccess()\nYour browser doesn't support MIDI, try using a good modern browser");
  }
}

// =====================================================================================
// Open MIDI port
// =====================================================================================
Midi.prototype.onMIDISuccess = function(midiAccess) {
  this.midi = midiAccess;

  this.midi_out = this.midi.outputs.get(this.midi_port_id);
  if(!this.midi_out) {
    alert("Unable to open MIDI port: "+this.midi_port_id)
    return;
  }
  console.log("Opened MIDI port: "+this.midi_out.name);

  //this.sendNote(0, 34, 128);
}

// =====================================================================================
// Error trap, never seen this triggered maybe on older browsers without MIDI support
// =====================================================================================
Midi.prototype.onMIDIFailure = function(msg) {
  alert("Failed to get MIDI access: " + msg);
}

// =====================================================================================
// Send MIDI note
// =====================================================================================
Midi.prototype.sendNoteOn = function(chan, note, velo) {
  if(!this.midi_out) return;

  this.midi_out.send([0x90 + (chan-1), note, velo]);
}

// =====================================================================================
// Send MIDI note
// =====================================================================================
Midi.prototype.sendNoteOff = function(chan, note, velo) {
  if(!this.midi_out) return;

  this.midi_out.send([0x80 + (chan-1), note, velo]);
}

// =====================================================================================
// Send MIDI controller change
// =====================================================================================
Midi.prototype.sendCC = function(chan, cc, val) {
  if(!this.midi_out) return;

  this.midi_out.send([0xB0 + (chan-1), cc, val]);
}


function MidiAction(type, chan) {
  this.type = type;
  this.channel = chan;
}
