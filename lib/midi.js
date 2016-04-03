

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
}

// =====================================================================================
// Error trap, never seen this triggered maybe on older browsers without MIDI support
// =====================================================================================
Midi.prototype.onMIDIFailure = function(msg) {
  alert("Failed to get MIDI access: " + msg);
}

// =====================================================================================
// Send MIDI note ON
// =====================================================================================
Midi.prototype.sendNoteOn = function(chan, note, velo) {
  if(!this.midi_out) return;

  this.midi_out.send([0x90 + (chan-1), note, velo]);
}

// =====================================================================================
// Send MIDI note OFF
// =====================================================================================
Midi.prototype.sendNoteOff = function(chan, note, velo) {
  if(!this.midi_out) return;

  this.midi_out.send([0x80 + (chan-1), note, velo]);
}

// =====================================================================================
// Send series of messages for a NRPN change
// =====================================================================================
Midi.prototype.sendNRPN = function(chan, msb, lsb, val, high_res) {
  if(!this.midi_out) return;

  this.midi_out.send([0xB0 + (chan-1), 0x63, msb]);
  this.midi_out.send([0xB0 + (chan-1), 0x62, lsb]);

  // Handling of high res values (e.g. greater than 127 or 14-bits)
  // This has been tested on a Novation Ultranova, not sure if this is MIDI standard
  if(high_res) {
    var val_msb = Math.floor(val / 128);
    var val_lsb = Math.floor(val % 128);
    this.midi_out.send([0xB0 + (chan-1), 0x06, val_msb]);
    this.midi_out.send([0xB0 + (chan-1), 0x26, val_lsb]);
  } else {
    this.midi_out.send([0xB0 + (chan-1), 0x06, val]);
  }
}

// =====================================================================================
// Send MIDI controller change
// =====================================================================================
Midi.prototype.sendCC = function(chan, cc, val) {
  if(!this.midi_out) return;
  if(val > 127) val = 127;
  this.midi_out.send([0xB0 + (chan-1), cc, val]);
}

// =====================================================================================
// Send MIDI program change with bank select
// =====================================================================================
Midi.prototype.sendProgChange = function(chan, msb, lsb, num) {
  if(!this.midi_out) return;

  this.midi_out.send([0xB0 + (chan-1), 0x00, msb]);
  this.midi_out.send([0xB0 + (chan-1), 0x20, lsb]);
  this.midi_out.send([0xC0 + (chan-1), num]);
}



/* ********************************************************************* */

function MidiAction(type, chan) {
  this.type = type;
  this.channel = chan;
  this.on = false;
}

MidiAction.prototype.trigger = function(value) {
  //console.log(this)
  switch (this.type) {
    case "note":
      if(this.on) {
        midi.sendNoteOff(this.channel, this.note, 0);
      } else {
        midi.sendNoteOn(this.channel, this.note, this.velocity);
      }
      break;
    case "cc":
      var val = arguments[0];
      if(this.on) {
        if(this.cc_val_off) val = this.cc_val_off
        midi.sendCC(this.channel, this.cc, val);
      } else {
        if(this.cc_val_on) val = this.cc_val_on
        midi.sendCC(this.channel, this.cc, val);
      }
      break;
    case "nrpn":
      var val = arguments[0];
      midi.sendNRPN(this.channel, this.nrpn_msb, this.nrpn_lsb, val, this.high_res);
      break;
    case "prog":
      var val = arguments[0] ? arguments[0] : this.prog_num;
      if(!this.on) midi.sendProgChange(this.channel, this.prog_msb, this.prog_lsb, val);
      break;
  }
  this.on = !this.on;
}
