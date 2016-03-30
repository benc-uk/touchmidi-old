var MOVE_CLAMP = 10;

var active_widget = null;
var old_point = null;
var midi = null;

function init() {
  but_nodes = document.getElementsByClassName("widget button");
  for (var i = 0; i < but_nodes.length; i++) {
    var node = but_nodes[i];
    var colour = '#00FF00';
    var label = '';
    if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
    if(node.hasAttribute('label')) label = node.getAttribute('label');

    // Create button object and link dom to object and vice-versa
    button = new Button(node, 'P', colour, label);
    node.widget = button;

    if(node.hasAttribute('midinote')) {
      var params = node.getAttribute('midinote').split(',');
      var action = new MidiAction('note', parseInt(params[0].trim()));
      action.note = parseInt(params[1].trim());
      action.velocity = parseInt(params[2].trim());
      button.midiactions.push(action);
    }
  }

  // Set up all sliders
  var vslider_nodes = document.getElementsByClassName("widget slider_v");
  var hslider_nodes = document.getElementsByClassName("widget slider_h");
  for (var i = 0; i < vslider_nodes.length; i++) {
    buildSlider(vslider_nodes[i], 'V');
  }
  for (var i = 0; i < hslider_nodes.length; i++) {
    buildSlider(hslider_nodes[i], 'H');
  }


  window.addEventListener("mouseup", eventMouseUp, false);
  window.addEventListener("mousemove", eventMove, false);
  window.addEventListener("touchend", eventMouseUp, false);
  window.addEventListener("touchmove", eventMove, false);
  window.addEventListener("dblclick", eventSinkHole, false);

  // Connect to MIDI
  midi = new Midi(0);
}

function eventMouseUp(e) {
  if(active_widget == null) return;

  active_widget.callMouseUp();
  active_widget = null;
}

function eventMove(e) {
  if(active_widget == null) return;

  var dx = 0, dy = 0, new_x = 0, new_y = 0;

  if(old_point) {
    if(e.constructor.name != "MouseEvent") {
      new_x = e.touches[0].screenX;
      new_y = e.touches[0].screenY;
    } else {
      new_x = e.screenX;
      new_y = e.screenY;
    }
    dx = new_x - old_point.x;
    dy = new_y - old_point.y;
    dx = Math.clip(dx, -MOVE_CLAMP, MOVE_CLAMP);
    dy = Math.clip(dy, -MOVE_CLAMP, MOVE_CLAMP);
  } else {
    old_point = {};
  }
  old_point.x = new_x;
  old_point.y = new_y;

  e.preventDefault();
  active_widget.callMove(dx, dy);
}

function eventSinkHole(e) {
  e.preventDefault();
}

function buildSlider(node, type) {
  var colour = '#00FF00';
  var label = '';
  if(node.hasAttribute('colour')) colour = node.getAttribute('colour');
  if(node.hasAttribute('label')) label = node.getAttribute('label');

  // Create slider object and link dom to object and vice-versa
  slider = new Slider(node, type, colour, label, 0, 127, 0);
  node.widget = slider;

  if(node.hasAttribute('midicc')) {
    var params = node.getAttribute('midicc').split(',');
    var action = new MidiAction('cc', parseInt(params[0].trim()));
    action.cc = parseInt(params[1].trim());
    slider.midiactions.push(action);
  }
}

function shadeBlend(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
        var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}

Math.clip = function(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
