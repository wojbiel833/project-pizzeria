import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log(`newProduct:`, thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
    // console.log(generateHTML);
    /* create element usint utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    // console.log(thisProduct.element);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    // console.log(menuContainer);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }
  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    ); // product__header
    // console.log(thisProduct.accordionTrigger);
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    ); // product__order
    // console.log(thisProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    ); // input, select
    // console.log(thisProduct.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    ); // [href="#add-to-cart"]
    // console.log(thisProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    ); // .product__total-price .price
    // console.log(thisProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    ); //.product__images
    // console.log(thisProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    ); // .widget-amount
    // console.log(thisProduct.amountWidgetElem);
  }
  initAccordion() {
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      // console.log('click');
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active');
      // console.log(activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct != thisProduct.element) {
        activeProduct.classList.remove('active');
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
    /* toggle active class on thisProduct.element */
  }
  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder() {
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);
    // set price to default price
    let price = thisProduct.data.price;
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);
        // access to[param]-[option]' with images
        const activeImgs = document.querySelectorAll(
          `.${paramId}-${optionId}.active`
        );

        let activeImg;
        for (activeImg of activeImgs) {
          // console.log(activeImg);
          activeImg.classList.remove('active');
        }

        if (formData[paramId] && formData[paramId].includes(optionId)) {
          const selectedImg = document.querySelector(`.${paramId}-${optionId}`);
          // console.log(selectedImg);
          if (selectedImg)
            // console.log('ZNALAZŁO:', selectedImg);
            selectedImg.classList.add('active');

          if (!option.default) {
            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (option.default) {
            // reduce price variable
            price -= option.price;
          }
        }
      }
    }
    // create single price property
    thisProduct.priceSingle = price;
    // multiply price by ammount
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct() {
    const thisProduct = this;

    thisProduct.productSummary = {};
    thisProduct.productSummary.id = thisProduct.id;
    thisProduct.productSummary.name = thisProduct.data.name;
    thisProduct.productSummary.amount = thisProduct.amountWidget.value;
    thisProduct.productSummary.priceSingle = thisProduct.priceSingle;
    thisProduct.productSummary.price =
      thisProduct.data.price * thisProduct.amountWidget.value;
    thisProduct.productSummary.params = thisProduct.prepareCartProductsParams();

    return thisProduct.productSummary;
    // console.log(productSummary);
  }
  prepareCartProductsParams() {
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);
    // set price to default price
    thisProduct.dishOpt = {};
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);
      // console.log(formData[paramId]);

      thisProduct.dishOpt[paramId] = {
        label: param.label,
        options: {},
      };
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        // const option = param.options[optionId];
        // console.log(optionId, option);
        // access to[param]-[option]' with images

        if (formData[paramId] && formData[paramId].includes(optionId)) {
          const opts = [...formData[paramId]];
          // for (let i = 0; i < formData[paramId].length; i++)
          thisProduct.dishOpt[paramId].options = {
            optionId: `${opts}`,
          };
        }
        // ${optionId}: ${option} ${formData[paramId]}
      }
    }
    return thisProduct.dishOpt;
  }
}
export default Product;
