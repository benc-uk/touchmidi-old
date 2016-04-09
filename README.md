# TouchMIDI
A flexible HTML5 based control surface for controlling external devices via MIDI

Designed primarily for use on touch screen devices, but also compatible with keyboard and mouse. A range of simple widgets is supported:
 * Vertical & horizontal slider
 * Push & toggle button
 * Round encoder
 * XY Pad

Supported MIDI messages are:
 * Note On & Note off
 * Controller change (CC)
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
See [**basic_template.html**](https://github.com/benc-uk/touchmidi/blob/master/basic_template.html) for an example skeleton file to get started with. Within the body of the page there should be at least one div with a class of *main_column*, and this should have width % specified in a style attribute. Within this div, use child divs with classes of *row* & *column* to contain the widgets and controls you want. The widgets themselves are also divs with classes as described below, widget divs should be empty with no children. Row and column divs can be nested to shape your desired layout for the page. Everything is laid out using CSS3 flexbox, to flow and have widgets fill space and the entire page.

The [Developer Guide](https://github.com/benc-uk/touchmidi/wiki/Developer-Guide) has everything you need to know about creating your own pages and control surfaces

#### General Usage & MIDI connectivity
Open the HTML file you have created or one of the examples, in most cases this will be a local file, but can served from a webserver (provided it is uploaded along with the supporting 'lib', 'css' and 'img' folders)
 * The default MIDI output device that will opened is port 0, to change this specify the port on the URL, e.g. `my_file.html?port=4`
 * If you want to have every widget on your page to control a single MIDI channel, which is often the case, this can be added to the URL, e.g. `my_file.html?channel=10`. Note. When this is set, the channel parameter for all MIDI actions is ignored and the supplied value is used as an override

If there was a problem opening the MIDI port you will be notified with a popup. Make sure your MIDI interface is plugged in before opening the browser, and check the port number is correct (also try port=0, 1, 2 etc).

Simply use your mouse or touchscreen to control the widgets. Multi touch is supported so you can control as many parameters as you have fingers!

**Tip: For the best experience, hit F11 to switch Chrome to full screen, then hit F5 to reload the page**

#### Known Issues and Limitations
 * Currently dynamic resizing is not supported - so if you resize the browser window, please hit F5 to reload the page to get the optimal layout
 * 
