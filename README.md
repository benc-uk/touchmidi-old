# TouchMIDI
Flexible HTML5 based control surface for controlling external devices via MIDI

Designed for use on touch screen devices, but also compatible with keyboard and mouse. A range of simple widgets is supported:
 * Vertical slider
 * Horizontal slider
 * Push button
 * Toggle button
 * Round encoder / knob
 * XY Pad

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

## MIDI Actions
There are various MIDI actions that can be attached to a widget, this is done via standard XML/HTML attribute, e.g. `midinote="1, 2, 3"`. The parameters are positional so **_order is important_**. Parameters are comma seperated and expected to be integers, some minimal parsing and type checking is done, but beware. Multiple actions of the same type can be specified, seperated with a pipe, e.g. `midinote="1, 55, 127|1, 57, 64`. The action types closely map to various MIDI message types, as follows:

#### MIDI Action — Note

Send MIDI note on and off messages. Supported widget types: **`button`** only. Note on is sent when the button is first pressed, Note off sent when it is released. For toggle buttons the note will be held, which is useful for latching arpegigators
```bash
midinote="channel, note_number, velocity"
```

#### MIDI Action —  Control Change (CC)

This is used to send control change messages with a range of values. Supported widget types: **ALL**. This action sends standard MIDI control messages, where the CC number = 0-127, for additional or equipment specific control messages a NRPN should be used (see below).
Note. A min value of 0, and max value of 127 is assumed, as this is the permitted range for standard MIDI CC
```bash
midicc="channel, cc_number [, val_on] [, val_off]"
```
The value sent with the CC message is dependant on the widget type:
 * *`slider`* & *`encoder`*: Value sent is dynamic based the current value of the widget. The message is sent when the user changes the value via the mouse or touch action.
 * *`xypad`*: Sends two values based on the X, Y position of the crosshair on the pad. You **must** provide two actions seperated by a pipe, the first is mapped to X and the second Y. e.g. `midicc="1, 71|1, 74"` the X position on the pad will be sent as CC 71 and the Y position sent as CC 74.
 * *`button`*: You must supply two extra parameters after the CC number, these are `val_on` and `val_off`. The widget will send `val_on` when the button is pressed down, and `val_off` when the button is released.

#### MIDI Action — NRPN Change

This is used to send NRPN (Non-Registered Parameter Number) messages. Supported widget types: *`slider`*, *`encoder`*.
```bash
midinrpn="channel, msb, lsb"
```
Note. Unlike the mididcc action, where a max of 127 is assumed you should supply the max value as described above. As per the MIDI spec NRPN messsages can send values greater than 127. If the max parameter is set to greater than 127, then the value will sent as a 14-bit MSB/LSB pair

The value sent with the NRPN message is dependant on the widget type:
 * *`slider`* & *`encoder`*: Value sent is dynamic based the current value of the widget. The message is sent when the user changes the value via the mouse or touch action.
 * *`xypad`*: Sends two values based on the X, Y position of the crosshair on the pad. You **must** provide two actions seperated by a pipe, the first is mapped to X and the second Y. e.g. `midinrpn="1, 2, 68, 200|1, 2, 55, 200"` the X position on the pad will be sent as CC 71 and the Y position sent as CC 74.



### Tested Browsers
Tested on Chrome v49. Chrome is the only browser known to work due to limited MIDI support in other browsers e.g. Firefox and Safari do not support the Web MIDI API spec https://www.w3.org/TR/webmidi/

### Example Screenshots
![Screenshot](https://cloud.githubusercontent.com/assets/14982936/14225681/730c9920-f8c3-11e5-8b15-d5865770c0a2.png)
