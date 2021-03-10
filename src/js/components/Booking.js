import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    // console.log('getData params:', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };
    // console.log(urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings)
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    for (let item of eventsCurrent)
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
      // console.log('thisBooking.booked', thisBooking.booked);
      thisBooking.updateDOM();
    }
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      // console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  createBooking() {
    console.log('clicked');
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    console.log(url);

    thisBooking.bookingInfo = {};
    thisBooking.bookingInfo.date = thisBooking.datePicker.value;
    thisBooking.bookingInfo.hour = thisBooking.hourPicker.value;
    thisBooking.bookingInfo.table = thisBooking.table; // ????????????
    thisBooking.bookingInfo.duration = thisBooking.hoursAmount.correctValue;
    thisBooking.bookingInfo.ppl = thisBooking.peopleAmount.correctValue;
    thisBooking.bookingInfo.starters = thisBooking.starters;
    thisBooking.bookingInfo.phone = thisBooking.dom.phone.value;
    thisBooking.bookingInfo.address = thisBooking.dom.address.value;

    thisBooking.makeBooked(
      thisBooking.bookingInfo.date,
      thisBooking.bookingInfo.hour,
      thisBooking.bookingInfo.duration,
      thisBooking.bookingInfo.table
    );
    console.log(thisBooking.bookingInfo);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thisBooking.bookingInf),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse:', parsedResponse);
      });
    console.log(thisBooking.booked);
  }
  setStarters() {
    const thisBooking = this;
    thisBooking.starters = [];
    if (thisBooking.dom.water.checked) {
      thisBooking.starters.push(thisBooking.dom.water.value);
    }

    if (thisBooking.dom.bread.checked) {
      thisBooking.starters.push(thisBooking.dom.bread.value);
      if (!thisBooking.starters.includes('water')) {
        thisBooking.starters.push(thisBooking.dom.water.value);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;
    // console.log(thisBooking.dom.tables);
    // PICK A TABLE
    if (event.target.classList.contains('booked')) {
      alert('This table is already booked');
    } else if (
      !event.target.classList.contains('booked') &&
      event.target.classList.contains('table')
    ) {
      // add 'active' class
      thisBooking.dom.tables.forEach(function (table) {
        // console.log(table);
        table.classList.remove(classNames.booking.tableClicked);
        event.target.classList.add(classNames.booking.tableClicked);
      });
      // put table info (nr) to Booking as an property
      thisBooking.table = Number(
        event.target.getAttribute(settings.booking.tableIdAttribute)
      );
      // thisBooking.table.push(tableId);
      console.log(thisBooking.table);
      if (
        !thisBooking.booked[thisBooking.date][thisBooking.hour].includes(
          thisBooking.table
        )
      ) {
        thisBooking.booked[thisBooking.date][thisBooking.hour].push(
          thisBooking.table
        );
      } else {
        const tableIndex = thisBooking.booked[thisBooking.date][
          thisBooking.hour
        ].indexOf(thisBooking.table);
        // console.log(tableIndex);
        thisBooking.booked[thisBooking.date][thisBooking.hour].splice(
          tableIndex,
          1
        );
      }
      console.log(thisBooking.booked);
    }
    thisBooking.updateDOM();
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    // console.log(thisBooking.date);
    // console.log(thisBooking.hourPicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    // console.log(thisBooking.hour);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      // console.log(table);
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      // console.log(tableId);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.restaurant = document.querySelector(
      select.booking.restaurant
    );
    // console.log('thisBooking.dom.restaurant', thisBooking.dom.restaurant);
    thisBooking.dom.submitButton = document.querySelector(
      select.booking.button
    );
    // console.log(thisBooking.dom.submitButton);
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    // console.log(thisBooking.dom.phone);
    thisBooking.dom.address = document.querySelector(select.booking.address);
    // console.log(thisBooking.dom.address);
    thisBooking.dom.water = document.querySelector(select.booking.water);
    // console.log(thisBooking.dom.water);
    thisBooking.dom.bread = document.querySelector(select.booking.bread);
    // console.log(thisBooking.dom.bread);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.hoursAmount.addEventListener('click', function () {});
    thisBooking.dom.peopleAmount.addEventListener('click', function () {});
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
    thisBooking.dom.restaurant.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.initTables(event);
    });
    thisBooking.dom.submitButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.createBooking();
    });
    thisBooking.dom.water.addEventListener('click', function () {
      thisBooking.setStarters();
    });
    thisBooking.dom.bread.addEventListener('click', function () {
      thisBooking.setStarters();
    });
  }
}

export default Booking;
