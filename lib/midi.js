/*
    TouchMIDI
    Ben Coleman, April 2016 (Oct 2019)
    midi.js  v1.1
     * Midi class - MIDI message handler for sending messages
     * MidiAction class - Used to hold action paramters and trigger messages
*/

class Midi {
  constructor(device_name, open_callback) {
    this.midi_access = null;
    this.midi_out = null;
    this.midi_name = device_name;
    this.open_callback = open_callback;

    // Request access and open MIDI port
    try {
      navigator.requestMIDIAccess().then(
        midi => {
          this.midi_access = midi;
          this.openMIDI()
          this.midi_access.onstatechange = this.openMIDI;
        }, 
        err => {
          alert("Failed to get MIDI access: " + err);
        });
    } catch(err) {
      alert("Unable to call requestMIDIAccess()\nYour browser doesn't support MIDI, try using a good modern browser");
    }
  }

  // =====================================================================================
  // Open MIDI port.
  // =====================================================================================
  openMIDI() {
    if(!this.midi_access) return;
    if(this.midi_access.outputs.size < 1) return;
    if(this.midi_out) return;

    let port_id = undefined;

    try {
      // MIDIOutputMap is kinda weird so we have to enumerate it
      if(this.midi_name) {
        for(let port of this.midi_access.outputs) {
          console.log("### Found available MIDI output device, id: " + port[1].id + ", name: " + port[1].name);

          // If a name is provided and matches, that's our device!
          if(port[1].name.toLowerCase() == this.midi_name.toLowerCase()) {
            port_id = port[1].id;
          }
        }
      }

      // Did we not find the named device, display menu page
      if(!port_id) {
        let html = `<style>body{padding:2rem}</style><h1 style='text-align:center'>Select MIDI device 🎹 </h1>`
        for(let port of this.midi_access.outputs) {
          console.log("### Found available MIDI output device, id: " + port[1].id + ", name: " + port[1].name);
          html += `<div class="button text" onclick="document.location.href='?device=${port[1].name}'" style="background-color: #222222">${port[1].name}</div><br/>`
        }
  
        document.body.innerHTML = html;
        return;
      }
      
      // Important part!
      this.midi_out = this.midi_access.outputs.get(port_id);

      if(!this.midi_out) {
        alert("Unable to open MIDI port: " + port_id);
      } else {
        console.log("### Opened MIDI port: " + this.midi_out.name);
        if(this.open_callback) {
          this.open_callback();
        }
      }
    } catch(err) {
      alert(err.message)
    }
  }

  // =====================================================================================
  // Send MIDI note ON
  // =====================================================================================
  sendNoteOn = function(chan, note, velo) {
    if(!this.midi_out) return;

    this.midi_out.send([0x90 + (chan-1), note, velo]);
  }

  // =====================================================================================
  // Send MIDI note OFF
  // =====================================================================================
  sendNoteOff = function(chan, note, velo) {
    if(!this.midi_out) return;

    this.midi_out.send([0x80 + (chan-1), note, velo]);
  }

  // =====================================================================================
  // Send series of messages for a NRPN change
  // =====================================================================================
  sendNRPN = function(chan, msb, lsb, val, high_res) {
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
  sendCC = function(chan, cc, val) {
    if(!this.midi_out) return;

    if(val > 127) val = 127;
    this.midi_out.send([0xB0 + (chan-1), cc, val]);
  }

  // =====================================================================================
  // Send MIDI program change with bank select
  // =====================================================================================
  sendProgChange = function(chan, msb, lsb, num) {
    if(!this.midi_out) return;

    this.midi_out.send([0xB0 + (chan-1), 0x00, msb]);
    this.midi_out.send([0xB0 + (chan-1), 0x20, lsb]);
    this.midi_out.send([0xC0 + (chan-1), num]);
  }
}

/* ********************************************************************* */

class MidiAction {
  constructor(midi, type, chan) {
    this.midi = midi;
    this.type = type;
    this.channel = chan;
    if(typeof global_midi_channel != 'undefined' && global_midi_channel > 0 && global_midi_channel <= 16)
      this.channel = global_midi_channel;
    this.on = false;
  }

  // Used to calculate ids for widgets
  toString() {
    return `${this.type}_${this.channel}_${this.note || '-1'}_${this.cc || '-1'}`;
  }

  trigger(value) {
    //console.log(this)
    switch (this.type) {
      case "note":
        if(this.on) {
          this.midi.sendNoteOff(this.channel, this.note, 0);
        } else {
          this.midi.sendNoteOn(this.channel, this.note, this.velocity);
        }
        break;
      case "cc":
        var val = arguments[0];
        if(this.on) {
          if(this.cc_val_off) val = this.cc_val_off
          this.midi.sendCC(this.channel, this.cc, val);
        } else {
          if(this.cc_val_on) val = this.cc_val_on
          this.midi.sendCC(this.channel, this.cc, val);
        }
        break;
      case "nrpn":
        var val = arguments[0];
        if(this.on) {
          if(this.nrpn_val_off) val = this.nrpn_val_off
          this.midi.sendNRPN(this.channel, this.nrpn_msb, this.nrpn_lsb, val, this.high_res);
        } else {
          if(this.nrpn_val_on) val = this.nrpn_val_on
          this.midi.sendNRPN(this.channel, this.nrpn_msb, this.nrpn_lsb, val, this.high_res);
        }
        break;
      case "prog":
        var val = arguments[0] ? arguments[0] : this.prog_num;
        if(!this.on) this.midi.sendProgChange(this.channel, this.prog_msb, this.prog_lsb, val);
        break;
    }
    this.on = !this.on;
  }
}