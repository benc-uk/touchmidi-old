

function Slider(node, type, colour, label_str, min, max, val) {
  this.node = node;
  this.type = type.toUpperCase();  // String, either: 'V' or 'H'
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.min = min;
  this.max = max;
  this.val = val;
  this.label = label_str
  this.midiactions = [];

  this.node.addEventListener("mousedown", this.eventMouseDown, false);
  this.node.addEventListener("touchstart", this.eventMouseDown, false);

  this.label_node = document.createElement("p");
  this.label_node.className = "widget_label";
  this.label_node.style.color = this.colour;
  this.node.appendChild(this.label_node);

  this.node.style.borderColor = this.colour;

  this.redraw();
}

Slider.prototype.eventMouseDown = function(event) {
  event.preventDefault();
  active_widget = this.widget;
}

Slider.prototype.callMove = function(dx, dy) {
  var new_val = 0;
  if(this.type == 'H')
    new_val = this.val + dx;
  else
    new_val = this.val -dy;

  if(new_val > this.max) new_val = this.max;
  if(new_val < this.min) new_val = this.min;
  this.val = Math.round(new_val);

  this.redraw();
}

Slider.prototype.callMouseUp = function() {
  this.redraw();
}

Slider.prototype.redraw = function() {
  if(this.label == '#')
    this.label_node.innerHTML = this.val;
  else
    this.label_node.innerHTML = this.label;

  var perc = (this.val / this.max) * 100.0
  var angle = 0;
  if(this.type == 'H') angle = 90;
  this.node.style.background = "linear-gradient("+angle+"deg, "+this.dark_colour+" "+perc+"%, black "+perc+"%";

  for (var i = 0; i < this.midiactions.length; i++) {
    var action = this.midiactions[i];
    if(action.type == 'cc') {
      midi.sendCC(action.channel, action.cc, this.val);
    }
  }
}
