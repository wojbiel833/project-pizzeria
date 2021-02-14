/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
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
      thisProduct.processOrder();

      console.log(`newProduct:`, thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);
      // console.log(generateHTML);
      /* create element usint utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
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
      console.log(thisProduct.accordionTrigger);

      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      ); // product__order
      console.log(thisProduct.form);

      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      ); // input, select
      console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      ); // [href="#add-to-cart"]
      console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      ); // .product__total-price .price
      console.log(thisProduct.priceElem);
<<<<<<< HEAD

      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      ); //.product__images
      console.log(thisProduct.imageWrapper);
=======
>>>>>>> 575beab642f77db2666067386cd179278b303448
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
      });

      console.log(`initOrderForm:`);
    }
    processOrder() {
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      // set price to default price
      let price = thisProduct.data.price;
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);
<<<<<<< HEAD
          // access to[param]-[option]' with images
          const optionImage = thisProduct.imageWrapper.querySelectorAll(
            `.${paramId}-${optionId}`
          );
          console.log(optionImage);
          const activeImg = document.querySelector(
            `.product__images .${paramId}-${optionId}`
          );
          console.log(activeImg);
          if (optionImage) {
            // activeImg.classList.remove('active');
            // console.log(activeImg);
          }

          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (option) thisProduct.imageWrapper.innerHTML += activeImg;

=======

          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
>>>>>>> 575beab642f77db2666067386cd179278b303448
            // check if the option is not default
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
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;

      // console.log(`thisApp.data:`, thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      // DLA POJEDYŃCZEGO ELEMENTU
      // const testProduct = new Product();
      // console.log(`testProduct:`, testProduct);
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
