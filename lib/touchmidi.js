/*
    TouchMIDI
    Ben Coleman, April 2016 (Oct 2019)
    touchmidi.js  v1.0    Main code, event handling and entry point
                  v1.0.1  Updated now ports are specified
*/

var MOVE_CLAMP = 6;        // Stop wild movements and jumpy slider changes
var active_widgets = {};   // Dictionary object to hold widgets that are active
var midi = null;           // Global singleton object for MIDI
var widgets_with_saved_vals = []  // Used only at startup to send saved vals when MIDI is open

// =============================================================================
// Main entry point, called on body onload event
// =============================================================================
function init() {
  var midi_device = undefined;            // MIDI output port *name*
  var url_device = getURLParameter("device");
  var url_chan = getURLParameter("channel");
  if(url_device) midi_device = url_device;
  if(url_chan) global_midi_channel = url_chan;

  // First pass shenanigans to get round flexbox sizing and dynamic children yadda
  // Yes it's messy doing it this way, but it works
  var nodes = document.getElementsByTagName("div");
  for (var i = 0; i < nodes.length; i++) {
    // This hack stores the orginal node sizes before we add children
    nodes[i].ow = nodes[i].offsetWidth;
    nodes[i].oh = nodes[i].offsetHeight;

    if(nodes[i].className == "row" || nodes[i].className == "column" || nodes[i].className == "main_column" || nodes[i].className == "label") continue;
    c = document.createElement("div");
    c.className = "label";
    nodes[i].appendChild(c);
  }

  // Our GLOBAL singleton MIDI object
  midi = new Midi(midi_device, midiOpened);
    
  // Set up all buttons
  var but_nodes = document.getElementsByClassName("button");
  for (var i = 0; i < but_nodes.length; i++) {
    var node = but_nodes[i];
    var type = 'PUSH';
    if(node.className.indexOf("toggle") > 0) type = 'TOGGLE';
    var colour = '#00FF00';
    var label = '';
    if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
    if(node.hasAttribute('label')) label = node.getAttribute('label');

    // Create button object and link dom to object and vice-versa
    button = new Button(node, type, colour, label);
    node.widget = button;

    parseMIDIActions(node, button);
  }

  // Set up all sliders
  var slider_nodes = document.getElementsByClassName("slider");
  for (var i = 0; i < slider_nodes.length; i++) {
    var node = slider_nodes[i];
    var colour = '#00FF00';
    var label = '';
    if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
    if(node.hasAttribute('label')) label = node.getAttribute('label');
    var type = 'VERTICAL';
    if(node.className.indexOf("horizontal") > 0) type = 'HORIZONTAL';

    // Create slider object and link dom to object and vice-versa
    slider = new Slider(node, type, colour, label);
    node.widget = slider;

    if(node.hasAttribute('nosave')) slider.no_save = true;

    parseMinMax(node, slider);
    parseMIDIActions(node, slider);

    let storedval = getWidgetValue(slider);
    if(storedval) {
      slider.val = storedval;
      widgets_with_saved_vals.push(slider);
    } 
  }

  // Set up all pads
  var pad_nodes = document.getElementsByClassName("xypad");
  for (var i = 0; i < pad_nodes.length; i++) {
    var node = pad_nodes[i];
    var colour = '#00FF00';
    var label = '';
    if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
    if(node.hasAttribute('label')) label = node.getAttribute('label');

    // Create slider object and link dom to object and vice-versa
    pad = new XYPad(node, colour, label, 0, 127, 0, 0, 127, 0);
    node.widget = pad;

    if(node.hasAttribute('nosave')) pad.no_save = true;

    parseMinMax(node, pad);
    parseMIDIActions(node, pad);

    let storedval = getWidgetValue(pad);
    if(storedval) {
      pad.xval = storedval.split('|')[0];
      pad.yval = storedval.split('|')[0];
      widgets_with_saved_vals.push(pad);
    }
  }

  // Set up all encoders
  var encoder_nodes = document.getElementsByClassName("encoder");
  for (var i = 0; i < encoder_nodes.length; i++) {
    var node = encoder_nodes[i];
    var colour = '#00FF00';
    var label = '';
    if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
    if(node.hasAttribute('label')) label = node.getAttribute('label');
    
    // Create encoder object and link dom to object and vice-versa
    var encoder = new Encoder(node, colour, label, 0, 127, 0);
    node.widget = encoder;

    if(node.hasAttribute('nosave')) encoder.no_save = true;

    parseMinMax(node, encoder);
    parseMIDIActions(node, encoder);

    let storedval = getWidgetValue(encoder);
    if(storedval) {
      encoder.val = storedval;
      widgets_with_saved_vals.push(encoder);
    }    
  }

  // Add all the event listeners we need, some are shared between touch & mouse
  window.addEventListener("mouseup", eventMouseUp, false);
  window.addEventListener("mousemove", eventMove, false);
  window.addEventListener("touchend", eventMouseUp, false);
  window.addEventListener("touchmove", eventMove, false);
  window.addEventListener("dblclick", eventSinkHole, false);
}

// =============================================================================
// Called when MIDI is open, and sends any saved values to the device
// =============================================================================
function midiOpened() {
  for(let w of widgets_with_saved_vals) {
    // Redraw triggers all the MidiAction on the given widget
    w.redraw();
  }
}

// =============================================================================
// Event handler for mouse up or touch released
// =============================================================================
function eventMouseUp(e) {
  if(Object.keys(active_widgets).length <= 0) return;

  var i = 0;
  if(e.constructor.name != "MouseEvent") {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var changed_id = e.changedTouches[i].identifier;
      if(active_widgets['id_'+changed_id]) active_widgets['id_'+changed_id].callMouseUp();
      delete active_widgets['id_'+changed_id];
    }
  } else {
    active_widgets['id_0'].callMouseUp();
    delete active_widgets['id_0'];
  }
}

// =============================================================================
// Event handler for mouse or touch move
// =============================================================================
function eventMove(e) {
  e.preventDefault();
  if(Object.keys(active_widgets).length <= 0) return;

  if(e.constructor.name != "MouseEvent") {
    for (var i = 0; i < e.changedTouches.length; i++) {
      id = e.changedTouches[i].identifier;
      new_x = e.changedTouches[i].screenX;
      new_y = e.changedTouches[i].screenY;
      calcDeltaAndCallMove(active_widgets['id_'+id], new_x, new_y);
    }
  } else {
    new_x = e.screenX;
    new_y = e.screenY;
    calcDeltaAndCallMove(active_widgets['id_0'], new_x, new_y);
  }
}

// =============================================================================
// Logic to calculate how much the user has moved the mouse or touch-point
// =============================================================================
function calcDeltaAndCallMove(widget, x, y) {
  if(!widget) return;
  var dx = 0, dy = 0;
  if(Object.keys(widget.old_point).length > 0) {
    dx = x - widget.old_point.x;
    dy = y - widget.old_point.y;
    dx = clampNumber(dx, -MOVE_CLAMP, MOVE_CLAMP);
    dy = clampNumber(dy, -MOVE_CLAMP, MOVE_CLAMP);
  }

  widget.old_point.x = x;
  widget.old_point.y = y;
  widget.callMove(dx, dy);
}

// =============================================================================
// Parser for min and max attributes
// =============================================================================
function parseMinMax(node, widget) {
  if(node.hasAttribute('min')) {
    var min = parseInt(node.getAttribute('min').trim());
    if(widget.constructor.name == 'XYPad') { widget.xmin = min; widget.ymin = min; }
    widget.min = min;
    widget.callMove(0, 0);
  }
  if(node.hasAttribute('max')) {
    var max = parseInt(node.getAttribute('max').trim());
    if(widget.constructor.name == 'XYPad') { widget.xmax = min; widget.ymax = min; }
    widget.max = max;
    widget.callMove(0, 0);
  }
}

// =============================================================================
// MIDI actions are a custom attribute, so we need to parse them
// =============================================================================
function parseMIDIActions(node, widget) {

  if(node.hasAttribute('midinote')) {
    var action_list = node.getAttribute('midinote').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      var action = new MidiAction(midi, 'note', parseInt(params[0].trim()));    //, parseInt(params[1].trim()), parseInt(params[2].trim()) );
      action.note     = parseInt(params[1].trim());
      action.velocity = 127;
      if(params.length > 2) action.velocity = parseInt(params[2].trim());
      widget.midiactions.push(action);
    }
  }

  if(node.hasAttribute('midicc')) {
    var action_list = node.getAttribute('midicc').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      var action = null;
      if(widget.constructor.name == 'Button') {
        action = new MidiAction(midi, 'cc', parseInt(params[0].trim()));
        action.cc = parseInt(params[1].trim());
        if(params.length > 2) {
          action.cc_val_on  = parseInt(params[2].trim());
          action.cc_val_off = parseInt(params[3].trim());
        } else {
          // User forgot to add parameters, only fallback is zeros
          action.cc_val_on  = 0; action.cc_val_off = 0;
        }
      } else {
        action = new MidiAction(midi, 'cc', parseInt(params[0].trim()));
        action.cc = parseInt(params[1].trim());
      }
      widget.midiactions.push(action);
    }
  }

  if(node.hasAttribute('midinrpn')) {
    var action_list = node.getAttribute('midinrpn').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      var action = new MidiAction(midi, 'nrpn', parseInt(params[0].trim()));
      if(widget.constructor.name == 'Button') {
        if(params.length > 2) {
          action.nrpn_val_on  = parseInt(params[3].trim());
          action.nrpn_val_off = parseInt(params[4].trim());
        } else {
          // User forgot to add parameters, only fallback is zeros
          action.nrpn_val_on  = 0; action.nrpn_val_off = 0;
        }
      }
      action.nrpn_msb = parseInt(params[1].trim());
      action.nrpn_lsb = parseInt(params[2].trim());
      if(widget.max > 127)
        action.high_res = true;
        // console.log("parsed nrpn")
        // console.dir(action)
      widget.midiactions.push(action);
    }
  }

  if(node.hasAttribute('midiprog')) {
    var action_list = node.getAttribute('midiprog').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      var action = null;
      var action = new MidiAction(midi, 'prog', parseInt(params[0].trim()));
      action.prog_msb = parseInt(params[1].trim());
      action.prog_lsb = parseInt(params[2].trim());
      action.prog_num = params.length > 3 ? parseInt(params[3].trim()) : null;
      widget.midiactions.push(action);
    }
  }
}

// =============================================================================
// For events I want to disable, such as right cick
// =============================================================================
function eventSinkHole(e) {
  e.preventDefault();
}

// =============================================================================
// Colour shading function. Pinched from Stackoverflow http://goo.gl/ZVYtYK
// =============================================================================
function shadeBlend(p, c0, c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
      var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
      return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    } else {
      var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
      return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}

// =============================================================================
// Basic number clamping
// =============================================================================
function clampNumber(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

// =============================================================================
// Get query parameters from the URL string
// =============================================================================
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// =============================================================================
// Save widget value to local storage
// =============================================================================
function saveWidgetValue(widget) {
  if(widget.no_save) return;
  var filename = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
  let id = hashCode(`${widget.constructor.name}_${widget.midiactions[0]}`);
  localStorage.setItem(`touchmidi.${filename}.${id}`, widget.val);
}

// =============================================================================
// Fetch saved widget value from storage
// =============================================================================
function getWidgetValue(widget) {
  var filename = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);  
  let id = hashCode(`${widget.constructor.name}_${widget.midiactions[0]}`);
  return localStorage.getItem(`touchmidi.${filename}.${id}`);
}

// =============================================================================
// Hashing function for strings into large numbers
// =============================================================================
function hashCode(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};