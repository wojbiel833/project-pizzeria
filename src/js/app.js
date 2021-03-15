import { settings, select, classNames } from './settings.js'; //zawsze od ./ !!! {} kiedy wiecej niż jedna rzecz != default
import Product from './components/Product.js'; // default exported moze byc bez {}
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initBooking: function () {
    // const thisApp = this;
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    // console.log(bookingWrapper);
    new Booking(bookingWrapper);
  },
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    // console.log(thisApp.pages);
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    // console.log(thisApp.navLinks);
    const idFromHash = window.location.hash.replace('#/', '');
    // console.log(idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for (const page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash); // zmienić na thisApp.pages[0].id
    // console.log(pageMatchingHash);
  },
  activatePage: function (pageId) {
    const thisApp = this;
    //add class avtive to matching pages, remove from non-matching
    for (const page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    //add class avtive to matching links, remove from non-matching
    for (const link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
    for (const link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href att
        const id = clickedElement.getAttribute('href').replace('#', '');
        // call thisApp.activePage with that id
        thisApp.activatePage(id);
        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  initMenu: function () {
    const thisApp = this;
    // console.log(`thisApp.data:`, thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData: function () {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.product;
    thisApp.data = {};

    fetch(url)
      .then(function (rawResopnse) {
        return rawResopnse.json();
      })
      .then(function (parsedResponse) {
        // console.log('parsedResponse:', parsedResponse);

        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        // execute initMenu method
        thisApp.initMenu();
      });

    // console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.porductList = document.querySelector(select.containerOf.menu);
    thisApp.porductList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
