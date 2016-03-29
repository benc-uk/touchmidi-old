

function Slider(node, type, colour, min, max, val) {
  this.node = node;
  this.type = type.toUpperCase();  // String, either: 'vertical' or 'horizontal'
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.min = min;
  this.max = max;
  this.val = val;

  this.node.addEventListener("mousedown", this.eventMouseDown, false);
  this.node.addEventListener("touchstart", this.eventMouseDown, false);

  this.label = document.createElement("p");
  this.label.className = "widget_label";
  this.label.style.color = this.colour;
  this.node.appendChild(this.label);

  this.node.style.borderColor = this.colour;

  this.redraw();
}

Slider.prototype.eventMouseDown = function(e) {
  active_widget = this.widget;
  console.log("Slide started on " + active_widget.node + " val:"+active_widget.val)
}

Slider.prototype.redraw = function() {
  this.label.innerHTML = this.val;
  var perc = (this.val / this.max) * 100.0
  var angle = 0;
  if(this.type == 'H') angle = 90;
  this.node.style.background = "linear-gradient("+angle+"deg, "+this.dark_colour+" "+perc+"%, black "+perc+"%";
}

Slider.prototype.eventMove = function(dx, dy) {
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
