var MOVE_CLAMP = 10;

var active_widgets = {};
var midi = null;
var midi_port = 0;

// =============================================================================
//
// =============================================================================
function init() {

  var url_port = getURLParameter("port");
  var url_chan = getURLParameter("channel");
  if(url_port) midi_port = url_port;
  if(url_chan) global_midi_channel = url_chan;

  // First pass shenanigans to get round flexbox sizing and dynamic children yadda
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

    parseMinMax(node, slider);
    parseMIDIActions(node, slider);
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

    parseMinMax(node, pad);
    parseMIDIActions(node, pad);
  }

  // Set up all encoders
  var encoder_nodes = document.getElementsByClassName("encoder");
  for (var i = 0; i < encoder_nodes.length; i++) {
    var node = encoder_nodes[i];
    var colour = '#00FF00';
    var label = '';
    if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
    if(node.hasAttribute('label')) label = node.getAttribute('label');
    // Create slider object and link dom to object and vice-versa
    encoder = new Encoder(node, colour, label, 0, 127, 0);
    node.widget = encoder;

    parseMinMax(node, encoder);
    parseMIDIActions(node, encoder);
  }

  window.addEventListener("mouseup", eventMouseUp, false);
  window.addEventListener("mousemove", eventMove, false);
  window.addEventListener("touchend", eventMouseUp, false);
  window.addEventListener("touchmove", eventMove, false);
  window.addEventListener("dblclick", eventSinkHole, false);

  // GLOBAL singelton MIDI object
  midi = new Midi(midi_port);
}


// =============================================================================
//
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
//
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
//
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
//
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
//
// =============================================================================
function parseMIDIActions(node, widget) {

  if(node.hasAttribute('midinote')) {
    var action_list = node.getAttribute('midinote').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      var action = new MidiAction('note', parseInt(params[0].trim()));    //, parseInt(params[1].trim()), parseInt(params[2].trim()) );
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
        action = new MidiAction('cc', parseInt(params[0].trim()));
        action.cc = parseInt(params[1].trim());
        action.cc_val_on  = parseInt(params[2].trim());
        action.cc_val_off = parseInt(params[3].trim());
      } else {
        action = new MidiAction('cc', parseInt(params[0].trim()));
        action.cc = parseInt(params[1].trim());
      }
      widget.midiactions.push(action);
    }
  }

  if(node.hasAttribute('midinrpn') && widget.constructor.name != 'Button') {
    var action_list = node.getAttribute('midinrpn').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      action = new MidiAction('nrpn', parseInt(params[0].trim()));
      action.nrpn_msb = parseInt(params[1].trim());
      action.nrpn_lsb = parseInt(params[2].trim());
      if(widget.max > 127)
        action.high_res = true;
      widget.midiactions.push(action);
    }
  }

  if(node.hasAttribute('midiprog')) {
    var action_list = node.getAttribute('midiprog').split('|');
    for (var i = 0; i < action_list.length; i++) {
      var params = action_list[i].split(',');
      var action = null;
      var action = new MidiAction('prog', parseInt(params[0].trim()));
      action.prog_msb = parseInt(params[1].trim());
      action.prog_lsb = parseInt(params[2].trim());
      action.prog_num = params.length > 3 ? parseInt(params[3].trim()) : null;
      widget.midiactions.push(action);
    }
  }
}

// =============================================================================
//
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
//
// =============================================================================
function clampNumber(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
