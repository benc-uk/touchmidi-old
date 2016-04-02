// =============================================================================
// Button class
//
// =============================================================================

function Button(node, type, colour, label_str) {
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
  this.node.firstElementChild.style.fontSize = (Math.min(this.node.ow, this.node.oh) / Math.max(this.label.length - 1, 2)) + "px";

  this.node.style.borderColor = this.colour;

  this.node.addEventListener("mousedown", this.eventMouseDown, false);
  this.node.addEventListener("touchstart", this.eventMouseDown, false);
}

// =============================================================================
//
// =============================================================================
Button.prototype.eventMouseDown = function(event) {
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
//
// =============================================================================
Button.prototype.callMouseUp = function() {
  if(this.toggled) return;
  this.node.style.backgroundColor = "black";

  if(this.type != 'TOGGLE')
      this.triggerActions(this.midiactions);
}

// =============================================================================
//
// =============================================================================
Button.prototype.callMove = function(dx, dy) {
}

// =============================================================================
//
// =============================================================================
Button.prototype.triggerActions = function(midiactions) {
  for (var i = 0; i < midiactions.length; i++) {
    midiactions[i].trigger(this.val);
  }
}
