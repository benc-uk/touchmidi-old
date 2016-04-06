# TouchMIDI
A flexible HTML5 based control surface for controlling external devices via MIDI

Designed for use on touch screen devices, but also compatible with keyboard and mouse. A range of simple widgets is supported:
 * Vertical & horizontal slider
 * Push & toggle button
 * Round encoder
 * XY Pad

Supported MIDI messages are:
 * Note On & Note off
 * Controler change (CC)
 * NRPN
 * Program change / bank select

Layout is done in HTML with simple `div` tags. A series of custom (not standard HTML) attributes extend the model. For example:
```html
<div class="row">
  <div class="slider" colour="#EE8800" midicc="1, 51" label="#"></div>
</div>
```
This example adds a row to the page with a slider widget, with a orange colour which will send MIDI control change (CC) number 51 on MIDI channel 1

#### Tested Browsers
Tested on Chrome v49. Chrome is the only browser currently known to work due to limited MIDI support in other browsers e.g. Firefox and Safari do not support the Web MIDI API spec https://www.w3.org/TR/webmidi/

#### Example Screenshots
![Screenshot](https://cloud.githubusercontent.com/assets/14982936/14225681/730c9920-f8c3-11e5-8b15-d5865770c0a2.png)

---

## Layout and Introduction
See **basic_template.html** for an example skeleton file to get started with. Within the body of the page there should be at least one div with a class of *main_column*, and this should have width % specified in a style attribute. Within this div, use child divs with classes of *row* & *column* to contain the widgets and controls you want. The widgets themselves are also divs with classes as described below, widget divs should be empty with no children. Row and column divs can be nested to shape your desired layout for the page. Everything is laid out using CSS3 flexbox, to flow and have widgets fill space and the entire page.

#### General Usage & MIDI connectivity
Open the HTML file you have created, in most cases this will be a local file, but can served from a webserver (provided it is uploaded with the lib, css and img folders)


## Widget Types
There are four base types of widget, which are set via the standard HTML `class` attribute. These classes are: `slider`, `button`, `encoder` & `xypad`.
The button widget takes an optional specifier if it is to act as toggle on/off button, as follows: `button toggle`
The slider widget can be specified as `vertical` or `horizontal`, (e.g. `slider horizontal`) if omitted the default is `vertical`.

#### Widget Common Parameters
Widgets have several common parameters. All attributes are added to the div tag, even though they are not parts of the HTML standard. All of these parameters are optional.

* **`colour="{colour_hex_value}"`**
Sets the colour of the widget, used for the widget border and other styling. Specify this using standard HTML hex colour syntax, e.g. `#33FF22`. If omitted the default colour used is bright green #00FF00. Note. bright colours tend to work best, oh and yes it is spelt _colour_.

* **`label="{label_text}"`**
Provides a text label to be displayed on the widget. A hash '#' in the text string will be substituted with the widget's current value. Note. button widgets don't have a value

* **`min="{min_value_int}"`**
Sets the minimum value the widget can hold and send. If omitted the default minimum is zero. Note. doesn't apply to buttons which don't hold values.

* **`max="{max_value_int}"`**
Sets the maximum value the widget can hold and send. If omitted the default maximum is 127. Note. doesn't apply to buttons which don't hold values.

#### Slider
A slider is a vertical or horizontal control used to send a MIDI value, the user can slide the position to change the value. Used with CC and NRPN messages
```html
<div class="slider"> <!-- default is vertical -->
<div class="slider horizontal">
<div class="slider vertical">
```

#### Button
A press or toggle button, can be used to send CC/NRPN, MIDI notes or program changes. Toggle buttons are "held down" even after the user lifts their finger or mouse button, so require a second click or press to release them.
```html
<div class="button"> <!-- default is vertical -->
<div class="button toggle">
```

#### Encoder
Acts functionally identically to a slider, except it represents a dial or knob that a user would turn to change values. To change values click and slide your finger or mouse vertically; up to increase and down to decrease (like a vertical slider)
```html
<div class="encoder">
```

#### XY Pad
Represents a touch pad with a pair of axis, allowing you to control two parameters at once. The X and Y position on the pad is shown with a crosshair and the X and Y values can control two MIDI parameters
```html
<div class="xypad">
```

## MIDI Actions
There are various MIDI actions that can be attached to a widget, done the same as the common parameters via HTML attributes `midinote="1, 2, 3"`. The parameters are positional so **_order is important_**. Parameters are comma separated and expected to be integers, some minimal parsing and type checking is done, but beware. Multiple actions of the same type can be specified, separated with a pipe, e.g. `midinote="1, 55, 127|1, 57, 64`. MIDI actions are not mandatory, but without an action the widget will do nothing. The action types closely map to various MIDI message types, as follows:

#### MIDI Action — Note
Send MIDI note on and off messages. Supported widget types: **`button`** only. Note on is sent when the button is first pressed, Note off sent when it is released. For toggle buttons the note will be held, which is useful for latching arpeggiators and creating chords and pads. The Note off message is sent with a velocity of zero.
```bash
midinote="channel, note_number, velocity"
```

#### MIDI Action —  Control Change (CC)
This is used to send control change messages with a range of values. Supported widget types: **ALL**. This action sends standard MIDI control messages, where the CC number = 0-127, for additional or equipment specific control messages a NRPN should be used (see below).
Note. A min value of 0, and max value of 127 is assumed, as this is the permitted range for standard MIDI CC
```bash
midicc="channel, cc_number [, val_on] [, val_off]"
```
The value sent with the CC message is dependent on the widget type:
 * *`slider`* & *`encoder`*: Value sent is dynamic based the current value/position of the widget. The message is sent when the user changes the value via the mouse or touch action.
 * *`xypad`*: Sends two values based on the X, Y position of the crosshair on the pad. You **must** provide two actions separated by a pipe, the first is mapped to X and the second Y. e.g. `midicc="1, 71|1, 74"` the X position on the pad will be sent as CC 71 and the Y position sent as CC 74.
 * *`button`*: You must supply two extra parameters after the CC number, these are `val_on` and `val_off`. The button will send `val_on` when the button is pressed down, and `val_off` when the button is released. Combined with toggle buttons, you can perform mutes or disable/enable effects. for example `<div class="button toggle" label="Mute" midicc="3, 7, 0, 127">` will create a button for muting MIDI channel 3 (as 7 is the CC number for volume)

#### MIDI Action — NRPN
This is used to send NRPN (Non-Registered Parameter Number) messages. Supported widget types: *`slider`* & *`encoder`*.
```bash
midinrpn="channel, msb, lsb"
```
Note. Unlike the mididcc action, where a max of 127 is assumed you should supply the max value as a parameter described above (e.g. max="250"). As per the MIDI spec NRPN messages can send values greater than 127, if the max parameter is set to greater than 127, then the value will sent as a 14-bit MSB/LSB pair
The value sent with the NRPN message is dependent on the widget type:
 * *`slider`* & *`encoder`*: Value sent is dynamic based the current value of the widget. The message is sent when the user changes the value via the mouse or touch action.
 * *`xypad`*: Sends two values based on the X, Y position of the crosshair on the pad. You **must** provide two actions separated by a pipe, the first is mapped to X and the second Y. e.g. `midinrpn="1, 2, 68|1, 2, 55"` the X position on the pad will be sent as NRPN 2:68 and the Y position sent as 2:55. NOTE. The min and max values are common for both the X and Y axises

#### MIDI Action — Program Change
This is used to send program change / bank select messages. Supported widget types: **ALL**..
```bash
midiprog="channel, msb, lsb [, prog_num]"
```
The value sent with the program change message is dependent on the widget type:
 * *`slider`* & *`encoder`*: Value sent is dynamic based the current value of the widget. The message is sent when the user changes the value via the mouse or touch action.
 * *`xypad`*: Sends two values based on the X, Y position of the crosshair on the pad. You **must** provide two actions separated by a pipe, the first is mapped to X and the second Y. e.g. `midiprog="1, 2, 68|1, 2, 55"` the X position on the pad will be sent as the first program number, the Y position sends the second program change. NOTE. The min and max values are common for both the X and Y axis
 * *`button`*: You must supply one extra parameter after the  msb and lsb values, this is `prog_num`. The button will send `prog_num` when the button is pressed down, nothing is sent when the button is released.
