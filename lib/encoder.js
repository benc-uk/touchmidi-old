

function Encoder(node, colour, label_str, min, max, val) {
  this.node = node;
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.min = min;
  this.max = max;
  this.val = val;
  this.label = label_str
  this.midiactions = [];
  this.old_point = {};

  this.node.addEventListener("mousedown", this.eventMouseDown, false);
  this.node.addEventListener("touchstart", this.eventMouseDown, false);

  this.canvas = document.createElement('canvas');
  this.canvas.width = this.node.ow;
  this.canvas.height = this.node.oh;
  this.span = Math.min(this.node.ow, this.node.oh)
  this.node.replaceChild(this.canvas, this.node.firstElementChild)
  this.ctx = this.canvas.getContext("2d");

  this.redraw();
}

Encoder.prototype.eventMouseDown = function(event) {
  var id = 0;
  if(event.constructor.name != "MouseEvent") {
    id = event.targetTouches[0].identifier;
  }

  event.preventDefault();
  active_widgets['id_'+id] = this.widget;
}

Encoder.prototype.callMove = function(dx, dy) {
  var new_val = 0;
  new_val = this.val -dy;

  if(new_val > this.max) new_val = this.max;
  if(new_val < this.min) new_val = this.min;
  this.val = Math.round(new_val);

  this.redraw();
}

Encoder.prototype.callMouseUp = function() {
  this.redraw();
}

Encoder.prototype.redraw = function() {

  var ctx = this.ctx;
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.beginPath();
  ctx.arc(this.node.ow/2, this.node.oh/2, this.span/2.5, (Math.PI*0.7), (Math.PI*0.3), false);
  ctx.lineWidth = this.span/6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = this.dark_colour;
  ctx.stroke();

  this.ctx.beginPath();
  var angle = (Math.PI*0.7) + ( this.val/this.max * ((Math.PI*2)-(Math.PI*0.4)) )
  ctx.arc(this.node.ow/2, this.node.oh/2, this.span/2.5, (Math.PI*0.7), angle, false);
  ctx.lineWidth = this.span/6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = this.colour;
  ctx.stroke();

  ctx.font = 'bold '+this.span/5+'px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = this.colour;
  if(this.label == '#')
    text = this.val;
  else
    text = this.label;
  ctx.fillText(text, (this.node.ow/2), (this.node.oh/2)+this.span/14);

  for (var i = 0; i < this.midiactions.length; i++) {
    this.midiactions[i].trigger(this.val);
  }
}
