

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
  this.on = false;

  // note parms
  this.note = arguments[2];
  this.velocity = arguments[3];

  // cc params
  this.cc = arguments[2];
  this.cc_val_on = arguments[3];
  this.cc_val_off = arguments[4];
}

MidiAction.prototype.trigger = function(value) {
  console.log(this)
  switch (this.type) {
    case "note":
      if(this.on) {
        midi.sendNoteOff(this.channel, this.note, 0);
      } else {
        midi.sendNoteOn(this.channel, this.note, this.velocity);
      }

      break;
    case "cc":
      var v = arguments[0];
      if(this.on) {
        if(this.cc_val_off) v = this.cc_val_off
        midi.sendCC(this.channel, this.cc, v);
      } else {
        if(this.cc_val_on) v = this.cc_val_on
        midi.sendCC(this.channel, this.cc, v);
      }

      break;
  }
  this.on = !this.on;
}
