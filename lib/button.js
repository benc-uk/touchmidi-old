

function Button(node, type, colour, label_str) {
  this.node = node;
  this.type = type.toUpperCase();  // String, either: 'vertical' or 'horizontal'
  this.colour = colour;
  this.dark_colour = shadeBlend(-0.6, this.colour);
  this.label_str = label_str;

  this.node.addEventListener("click", this.eventClick, false);

  this.label = document.createElement("p");
  this.label.className = "widget_label";
  this.label.style.color = this.colour;
  this.label.innerHTML = label_str;
  this.node.appendChild(this.label);

  this.node.style.borderColor = this.colour;
}

Button.prototype.eventClick = function(e) {
  console.log("Clicked on "+this.widget.label.innerHTML);
  this.style.backgroundColor = this.widget.dark_colour;
  setTimeout(function(that){that.style.backgroundColor = 'black'}, 150, this);
}
