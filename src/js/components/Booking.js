import { select, templates, settings } from '../settings.js';
// import { utils } from '../utils.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    // thisBooking.getData();
  }
  // getData() {
  //   const thisBooking = this;

  //   const startDateParam =
  //     settings.db.dateStartParamKey +
  //     '=' +
  //     utils.dateToStr(thisBooking.datePicker.minDate);
  //   const endDateParam =
  //     settings.db.dateEndParamKey +
  //     '=' +
  //     utils.dateToStr(thisBooking.datePicker.maxDate);

  //   const params = {
  //     booking: [startDateParam, endDateParam],
  //     eventsCurrent: [
  //       settings.db.notReperatParam,
  //       startDateParam,
  //       endDateParam,
  //     ],
  //     eventsRepeat: [settings.db.reperatParam, endDateParam],
  //   };

  //   console.log('getData params:', params);

  //   const urls = {
  //     booking:
  //       settings.db.url +
  //       '/' +
  //       settings.db.booking +
  //       '&' +
  //       params.booking.join('&'),
  //     eventsCurrent:
  //       settings.db.url +
  //       '/' +
  //       settings.db.event +
  //       '&' +
  //       params.eventsCurrent.join('&'),
  //     eventsRepeat:
  //       settings.db.url +
  //       '/' +
  //       settings.db.event +
  //       '&' +
  //       params.eventsRepeat.join('&'),
  //   };
  //   console.log(urls);
  //   Promise.all([
  //     fetch(urls.booking),
  //     fetch(urls.eventsCurrent),
  //     fetch(urls.eventsRepeat),
  //   ]);
  //   fetch(urls.booking)
  //     .then(function (allResponses) {
  //       const bookingsResponse = allResponses[0];
  //       const eventsCurrentResponse = allResponses[1];
  //       const eventsRepeatResponse = allResponses[2];
  //       return Promise.all([
  //         bookingsResponse.json(),
  //         eventsCurrentResponse.json(),
  //         eventsRepeatResponse.json(),
  //       ]);
  //     })
  //     .then(function ([bookings, eventsCurrent, eventsRepeat]) {
  //       console.log(bookings);
  //       console.log(eventsCurrent);
  //       console.log(eventsRepeat);
  //     });
  // }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new AmountWidget(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new AmountWidget(thisBooking.dom.hourPicker);

    thisBooking.dom.hoursAmount.addEventListener('click', function () {});
    thisBooking.dom.peopleAmount.addEventListener('click', function () {});
  }
}

export default Booking;
