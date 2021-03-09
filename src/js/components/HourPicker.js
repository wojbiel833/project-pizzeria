import BaseWidget from '../components/BaseWidget.js';
import { select, settings } from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    // console.log(settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    // console.log(thisWidget.dom.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.output
    );
    // console.log(thisWidget.dom.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
    // console.log(thisWidget.value);
  }

  initPlugin() {
    const thisWidget = this;
    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function () {
      thisWidget.value = thisWidget.dom.input.value;
      // console.log(thisWidget.value);
      // console.log(thisWidget.dom.input.value);
      // thisWidget.dom.output.innerHTML = utils.numberToHour(
      //   thisWidget.dom.input.value
      // );
    });
  }

  parseValue(value) {
    // console.log(value);
    // console.log(utils.numberToHour(value));
    return utils.numberToHour(value);
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = utils.numberToHour(
      thisWidget.dom.input.value
    );
  }
}

export default HourPicker;
