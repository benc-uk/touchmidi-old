

function Encoder(node, colour, label_str) {
  this.node = node;
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.min = 0;
  this.max = 127;
  this.val = 0;
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
  var wedge = 0.7;

  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.ctx.beginPath();
  ctx.arc(this.node.ow/2, this.node.oh/2, this.span/2.5, (Math.PI*0.7), (Math.PI*0.3), false);
  ctx.lineWidth = this.span/6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = this.dark_colour;
  ctx.stroke();

  this.ctx.beginPath();
  var angle = (Math.PI * wedge) + ( (this.val - this.min) / (this.max - this.min) * ((Math.PI * 2.0) - (Math.PI * 0.4)) )
  ctx.arc(this.node.ow/2, this.node.oh/2, this.span/2.5, (Math.PI * wedge), angle, false);
  ctx.lineWidth = this.span/6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = this.colour;
  ctx.stroke();

  if(this.label.indexOf('#') >= 0) {
    text = this.label.replace('#', this.val);
  } else {
    text = this.label;
  }
  var lab_len = Math.max(text.length, 3);
  var font_size = (this.node.ow / lab_len) / 1.6;
  ctx.textAlign = 'center';
  ctx.font = 'bold '+font_size+'px Arial';
  ctx.fillStyle = this.colour;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, this.node.ow/2, (this.node.oh/2) + font_size/3);
  ctx.fillText(text, this.node.ow/2, (this.node.oh/2) + font_size/3);


  for (var i = 0; i < this.midiactions.length; i++) {
    this.midiactions[i].trigger(this.val);
  }
}
