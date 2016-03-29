var MOVE_CLAMP = 10;

var active_widget = null;
var old_point = null;

function init() {
  dom_nodes = document.getElementsByClassName("widget button");
  for (var i = 0; i < dom_nodes.length; i++) {
    var params = dom_nodes[i].getAttribute('params').split(',');
    var colour = dom_nodes[i].getAttribute('colour');
    var label = dom_nodes[i].getAttribute('label');

    // Create button object and link dom to object and vice-versa
    but = new Button(dom_nodes[i], params[0], colour, label);
    dom_nodes[i].widget = but;
  }

  dom_nodes = document.getElementsByClassName("widget slider");
  for (var i = 0; i < dom_nodes.length; i++) {
    var params = dom_nodes[i].getAttribute('params').split(',');
    var colour = dom_nodes[i].getAttribute('colour');

    // Create slider object and link dom to object and vice-versa
    slider = new Slider(dom_nodes[i], params[0], colour, parseInt(params[1]), parseInt(params[2]), parseInt(params[3]));
    dom_nodes[i].widget = slider;
  }

  window.addEventListener("mouseup", eventMouseUp, false);
  window.addEventListener("mousemove", eventMove, false);
  window.addEventListener("touchend", eventMouseUp, false);
  window.addEventListener("touchmove", eventMove, false);
}

function eventMouseUp(e) {
  if(active_widget == null) return;

  active_widget.redraw();
  active_widget = null;
}

function eventMove(e) {
  if(active_widget == null) return;

  var dx = 0, dy = 0, new_x = 0, new_y = 0;

  if(old_point) {
    if(e instanceof TouchEvent) {
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

  active_widget.eventMove(dx, dy);
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
