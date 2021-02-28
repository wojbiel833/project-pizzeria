import { settings, select } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    if (thisWidget.input.value.length > 0)
      thisWidget.setValue(thisWidget.input.value);
    else thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
    // console.log(thisWidget.input);

    // console.log('AmountWidget:', AmountWidget);
    // console.log('constructor arguments:', element);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }
  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: Add validation */

    if (
      thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue <= settings.amountWidget.defaultMax &&
      newValue >= settings.amountWidget.defaultMin
    ) {
      thisWidget.value = newValue;
    } else {
      thisWidget.value != newValue;
    }
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }
  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
