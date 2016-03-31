# TouchMIDI
Flexible HTML5 based control surface for controlling external devices via MIDI

Designed for use on touch screen devices, but also compatible with keyboard and mouse. A range of simple widgets is supported:
 * Vertical slider
 * Horizontal slider
 * Push button
 * Toggle button (soon)
 * XY Pad (soon)
 * Round encoder / knob  (soon)

Layout is done via HTML, but simplified, everything is laid out with div tags, four basic containers (e.g. row, column) and custom attributes. e.g.
```html
<div class="row">
  <div class="widget slider_v" colour="#EE8800" midicc="1, 51" label="#"></div>
</div>
```
Adds a slider widget, with a orange colour which will send MIDI control change number 51 on MIDI channel 1

### Tested Browsers
Tested on Chrome v49. Chrome is the only browser known to work due to limited MIDI support in other browsers e.g. Firefox and Safari do not support the Web MIDI API spec https://www.w3.org/TR/webmidi/

![Screenshot](https://cloud.githubusercontent.com/assets/14982936/14171601/b0087d10-f72b-11e5-9369-19930949bdb9.png)
