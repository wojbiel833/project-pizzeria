import { select } from '../settings.js';
import app from '../app.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initPageChange();
  }

  render(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    console.log(thisHome.dom.wrapper);
    thisHome.dom.order = document.querySelector(select.home.order);
    console.log(thisHome.dom.order);
    thisHome.dom.booking = document.querySelector(select.home.booking);
    console.log(thisHome.dom.booking);
  }

  initPageChange() {
    const thisHome = this;

    thisHome.dom.order.addEventListener('click', app.initPages());
    thisHome.dom.booking.addEventListener('click', app.initPages());
  }
}

export default Home;
