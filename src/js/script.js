/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

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
            const selectedImg = document.querySelector(
              `.${paramId}-${optionId}`
            );
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

      app.cart.add(thisProduct.prepareCartProduct());
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

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.input.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

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

      const event = new Event('updated');
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
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('newCart', thisCart);
    }
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      // console.log(thisCart.dom);
      thisCart.dom.wrapper = element;
      thisCart.dom.productList = select.containerOf.menu;
      // console.log(thisCart.dom.wrapper);
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );

      // console.log(thisCart.dom.toggleTrigger);
      // console.log(select.cart.toggleTrigger);
    }
    initActions() {
      const thisCart = this;

      thisCart.dom.wrapper.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
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
    }
  }
  class CartProduct {
    constuctor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.product = {};
      thisCartProduct.product.dom = element;
      thisCartProduct.product.id = menuProduct.id;
      thisCartProduct.product.name = menuProduct.data.name;
      thisCartProduct.product.amount = menuProduct.amountWidget.value;
      thisCartProduct.product.priceSingle = thisCartProduct.priceSingle;
      thisCartProduct.product.price =
        thisCartProduct.data.price * menuProduct.amountWidget.value;
      thisCartProduct.product.params = menuProduct.prepareCartProductsParams();

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
    }
    getElelments(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = select.cartProduct.amountWidget;
      thisCartProduct.dom.price = select.cartProduct.price;
      thisCartProduct.dom.edit = select.cartProduct.edit;
      thisCartProduct.dom.remove = select.cartProduct.remove;

      console.log('thisCartProduct:', thisCartProduct.product);
    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.singlePrice = thisCartProduct.data.price;
      thisCartProduct.widgetValue = select.widgets.input;

      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.price
      );
      thisCartProduct.dom.price.addEventListener('updated', function () {
        thisCartProduct.product.price =
          thisCartProduct.singlePrice * thisCartProduct.amountWidget;
      });
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;
      // console.log(`thisApp.data:`, thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
