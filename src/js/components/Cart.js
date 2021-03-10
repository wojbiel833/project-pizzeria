import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    // console .log('newCart', thisCart);
  }
  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    // console.log(thisCart.dom);
    thisCart.dom.wrapper = element;
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    // console.log(thisCart.dom.wrapper);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    // console.log(thisCart.dom.toggleTrigger);
    // console.log(select.cart.toggleTrigger);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    // console.log(thisCart.dom.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    // console.log(thisCart.dom.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    // console.log(thisCart.dom.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    ); //ilosc sztuk w kółku
    // console.log(thisCart.dom.totalNumber);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    // console.log(thisCart.dom.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    // console.log(thisCart.dom.phone);
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      thisCart.sendOrder();
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
    });
  }
  add(menuProduct) {
    const thisCart = this;

    // console.log('adding product', menuProduct);
    /* generate HTML based on template */
    const generateHTML = templates.cartProduct(menuProduct); //thisProduct.productSummary
    // console.log(generateHTML);
    /* create element usint utils.createElementFromHTML */
    thisCart.element = utils.createDOMFromHTML(generateHTML);
    // console.log(thisCart.element);
    /* find cart container */
    const cartContainer = document.querySelector(select.cart.productList);
    // console.log(cartContainer);
    /* add element to menu */
    cartContainer.appendChild(thisCart.element);
    // pushing info to an array
    thisCart.products.push(new CartProduct(menuProduct, thisCart.element)); // thisCart.element? zamiast generatedDom
    // console.log('thisCart.products:', thisCart.products);

    thisCart.update();
  }
  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0; // ilosc sztuk
    thisCart.subtotalPrice = 0; // cena bez wysylki

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount; // cena(szt*cena pord.)
      // console.log(product.amount);
      thisCart.subtotalPrice += product.price; // * cena poszczególnego produktu
    }

    if (thisCart.subtotalPrice > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }

    // aktualziacja html
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    for (let elem of thisCart.dom.totalPrice) {
      elem.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber; // * ?
    // console.log(thisCart.dom.totalNumber);
  }
  remove(product) {
    const thisCart = this;
    // staramy się ustalić pozycję produktu w tablicy
    const elementOfIndex = thisCart.products.indexOf(product);
    console.log(elementOfIndex);
    // usuwamy cały div, który reprezentował produkt
    product.dom.wrapper.remove();
    // usuwamy z tablicy jeden produkt z pozycji elementOfIndex
    thisCart.products.splice(elementOfIndex, 1);
    // kazemy js-owi od nowa przeliczyc koszty itp.
    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    thisCart.payload = {};
    thisCart.payload.address = thisCart.dom.address.value;
    thisCart.payload.phone = thisCart.dom.phone.value;
    thisCart.payload.totalPrice = thisCart.totalPrice;
    thisCart.payload.subtotalPrice = thisCart.subtotalPrice;
    thisCart.payload.totalNumber = thisCart.totalNumber;
    thisCart.payload.deliveryFee = thisCart.deliveryFee;
    thisCart.payload.products = [];

    for (let prod of thisCart.products) {
      thisCart.payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thisCart.payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse:', parsedResponse);
      });
  }
}
export default Cart;
