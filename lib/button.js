

function Button(node, type, colour, label_str) {
  this.node = node;
  this.type = type.toUpperCase();
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.label = label_str;
  this.midiactions = [];

  this.node.addEventListener("mousedown", this.eventMouseDown, false);
  this.node.addEventListener("touchstart", this.eventMouseDown, false);

  this.label_node = document.createElement("p");
  this.label_node.className = "widget_label";
  this.label_node.style.color = this.colour;
  this.label_node.innerHTML = this.label;
  this.node.appendChild(this.label_node);

  this.node.style.borderColor = this.colour;
}

Button.prototype.eventMouseDown = function(event) {
  event.preventDefault();
  active_widget = this.widget;
  this.style.backgroundColor = this.widget.dark_colour;

  for (var i = 0; i < this.widget.midiactions.length; i++) {
    var action = this.widget.midiactions[i];
    if(action.type == 'note') {
      midi.sendNoteOn(action.channel, action.note, action.velocity);
    }
  }
}

Button.prototype.callMouseUp = function() {
  this.node.style.backgroundColor = "black";

  for (var i = 0; i < this.midiactions.length; i++) {
    var action = this.midiactions[i];
    if(action.type == 'note') {
      midi.sendNoteOff(action.channel, action.note, 0);
    }
  }
}

Button.prototype.callMove = function(dx, dy) {
}
