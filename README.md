# TouchMIDI
Flexible HTML5 based control surface for controlling external devices via MIDI

Designed for use on touch screen devices, but also compatible with keyboard and mouse. A range of simple widgets is supported:
 * Vertical silder
 * Horizontal slider
 * Push button
 * Toggle button (soon)
 * XY Pad (soon)
 * Round encoder / knob  (soon)

Layout is done via HTML, but simplified, everything is div tags, four basic containers (e.g. row, column) and custom attributes. e.g.
```html
<div class="row">
  <div class="widget slider" params="V, 0, 128, 77" colour="#4488FF"/>
</div>
```

### Tested Browsers
Chrome & Firefox

![Screenshot](https://cloud.githubusercontent.com/assets/14982936/14116750/3c4dbc26-f5d9-11e5-8b05-4adaea02a31d.png)
