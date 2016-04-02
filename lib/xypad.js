

function XYPad(node, colour, label_str, xmin, xmax, xval, ymin, ymax, yval) {
  this.node = node;
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.xmin = xmin;
  this.xmax = xmax;
  this.xval = xval;
  this.ymin = ymin;
  this.ymax = ymax;
  this.yval = yval;
  this.label = label_str
  this.midiactions = [];
  this.old_point = {};

  this.node.addEventListener("mousedown", this.eventMouseDown, false);
  this.node.addEventListener("touchstart", this.eventMouseDown, false);

  this.node.firstElementChild.style.color = this.colour;
  if(this.label == '#')
    lab_len = 9;
  else
    lab_len = Math.max(this.label.length - 2, 2)

  this.node.firstElementChild.style.fontSize = (this.node.ow / lab_len)/1.5 + "px";
  this.node.style.borderColor = this.colour;

  this.canvas = document.createElement('canvas');
  this.canvas.width = this.node.ow;
  this.canvas.height = this.node.oh;
  this.span = Math.min(this.node.ow, this.node.oh)
  this.node.replaceChild(this.canvas, this.node.firstElementChild)
  this.ctx = this.canvas.getContext("2d");

  this.redraw();
}

XYPad.prototype.eventMouseDown = function(event) {
  var id = 0;
  if(event.constructor.name != "MouseEvent") {
    id = event.targetTouches[0].identifier;
  }

  event.preventDefault();
  active_widgets['id_'+id] = this.widget;
}

XYPad.prototype.callMove = function(dx, dy) {
  var new_val_x = 0;
  var new_val_y = 0;
  new_val_x = this.xval + dx;
  new_val_y = this.yval -dy;

  if(new_val_x > this.xmax) new_val_x = this.xmax;
  if(new_val_x < this.xmin) new_val_x = this.xmin;
  if(new_val_y > this.ymax) new_val_y = this.ymax;
  if(new_val_y < this.ymin) new_val_y = this.ymin;

  this.xval = Math.round(new_val_x);
  this.yval = Math.round(new_val_y);

  this.redraw();
}

XYPad.prototype.callMouseUp = function() {
  this.redraw();
}

XYPad.prototype.redraw = function() {
  var ctx = this.ctx;
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Crosshair line vertical
  var x = this.canvas.width * (this.xval / this.xmax);
  ctx.moveTo(x, 0);
  ctx.lineTo(x, this.canvas.height);
  ctx.stroke();
  // Crosshair line horizontal
  var y = this.canvas.height - (this.canvas.height * (this.yval / this.ymax));
  ctx.moveTo(0, y);
  ctx.lineTo(this.canvas.width, y);
  ctx.stroke();
  // Crosshair center circle
  this.ctx.beginPath();
  ctx.arc(x, y, this.span/18, 0, (Math.PI*2), false);
  ctx.strokeStyle = this.colour;
  ctx.fillStyle = this.dark_colour;
  ctx.fill();
  ctx.stroke();
  // Label text
  ctx.font = 'bold '+this.span/5+'px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = this.colour;
  if(this.label == '#')
    text = this.xval +", "+ this.yval;
  else
    text = this.label;
  ctx.fillText(text, (this.node.ow/2), (this.node.oh/2)+this.span/14);

  if(this.midiactions[0]) this.midiactions[0].trigger(this.xval);
  if(this.midiactions[1]) this.midiactions[1].trigger(this.yval);
}
