import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    // console.log(thisCartProduct.amount);
    thisCartProduct.inputValue = element.querySelector(
      select.widgets.amount.input
    );
    // console.log(thisCartProduct.inputValue);
    // console.log(thisCartProduct.inputValue.value);
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price * menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    console.log('thisCartProduct:', thisCartProduct);

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    // console.log(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
    // console.log(thisCartProduct.dom);
  }
  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.inputValue.innerHTML = thisCartProduct.amount;
    });
  }
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('Removed');
  }
  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function () {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function () {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getData() {
    const thisCartProduct = this;

    thisCartProduct.readyToSend = {};
    // thisCartProduct.readyToSend.id = thisCartProduct.id;
    thisCartProduct.readyToSend.name = thisCartProduct.name;
    thisCartProduct.readyToSend.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.readyToSend.priceSingle = thisCartProduct.priceSingle;
    thisCartProduct.readyToSend.price =
      thisCartProduct.readyToSend.priceSingle *
      thisCartProduct.readyToSend.amount;
    thisCartProduct.readyToSend.params = JSON.parse(
      JSON.stringify(thisCartProduct.params)
    );

    console.log(thisCartProduct.readyToSend);
    return thisCartProduct.readyToSend;
  }
}
export default CartProduct;
