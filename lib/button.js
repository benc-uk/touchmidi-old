/*
    TouchMIDI
    Ben Coleman, April 2016
    button.js  v1.0  Push or toggle button
*/

class Button {
  constructor(node, type, colour, label_str) {
    this.node = node;
    this.type = type.toUpperCase();
    this.colour = colour;
    this.dark_colour = shadeBlend(-0.6, this.colour);
    this.label = label_str;
    this.midiactions = [];
    this.old_point = {};
    this.toggled = false;

    this.node.firstElementChild.style.color = this.colour;
    this.node.firstElementChild.innerHTML = this.label;
    this.node.firstElementChild.style.fontSize = (Math.min(this.node.ow) / Math.max(this.label.length - 1, 2)) + "px";

    this.node.style.borderColor = this.colour;

    this.node.addEventListener("mousedown", this.eventMouseDown, false);
    this.node.addEventListener("touchstart", this.eventMouseDown, false);
  }

  // =============================================================================
  // Standard event handler, change button backgroud and handle click on
  // =============================================================================
  eventMouseDown(event) {
    event.preventDefault();

    var id = 0;
    if(event.constructor.name != "MouseEvent") {
      id = event.targetTouches[0].identifier;
    }
    active_widgets['id_'+id] = this.widget;

    this.style.backgroundColor = this.widget.dark_colour;

    if(this.widget.type == 'TOGGLE') {
      this.widget.toggled = !this.widget.toggled;
    }
    this.widget.triggerActions(this.widget.midiactions);
  }

  // =============================================================================
  // Called from touchmidi.js, change button backgroud and handle click off
  // =============================================================================
  callMouseUp() {
    if(this.toggled) return;
    this.node.style.backgroundColor = "black";

    if(this.type != 'TOGGLE')
        this.triggerActions(this.midiactions);
  }

  // =============================================================================
  // Called from touchmidi.js on mousemove or touchmove associated with this widget
  // =============================================================================
  callMove(dx, dy) {
    // Not used on buttons
  }

  // =============================================================================
  // Trigger all MIDI actions
  // =============================================================================
  triggerActions(midiactions) {
    for (var i = 0; i < midiactions.length; i++) {
      midiactions[i].trigger(this.val);
    }
  }
}