# TouchMIDI
Flexible HTML5 based control surface for controlling external devices via MIDI

Designed for use on touch screen devices, but also compatible with keyboard and mouse. A range of simple widgets is supported:
 * Vertical slider
 * Horizontal slider
 * Push button
 * Toggle button
 * XY Pad (planned)
 * Round encoder / knob (planned)

Supported MIDI messages are:
 * Note On & Note Off - For button widgets
 * CC - For all widgets
 * NRPN - For all widgets (planned)
 * Bank/patch change - For all widgets (planned)

Layout is done via HTML, but simplified, everything is laid out with div tags, four basic containers (e.g. row, column) and custom attributes. e.g.
```html
<div class="row">
  <div class="widget slider_v" colour="#EE8800" midicc="1, 51" label="#"></div>
</div>
```
Adds a slider widget, with a orange colour which will send MIDI control change (CC) number 51 on MIDI channel 1

### Tested Browsers
Tested on Chrome v49. Chrome is the only browser known to work due to limited MIDI support in other browsers e.g. Firefox and Safari do not support the Web MIDI API spec https://www.w3.org/TR/webmidi/

### Example Screenshots
![Screenshot](https://cloud.githubusercontent.com/assets/14982936/14225681/730c9920-f8c3-11e5-8b15-d5865770c0a2.png)
