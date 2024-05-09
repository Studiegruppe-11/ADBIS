// /server/models/Order.js
class Order {
    constructor(id, date, time, guests, specialRequests, menu) {
      this.id = id;
      this.date = date;
      this.time = time;
      this.guests = guests;
      this.specialRequests = specialRequests;
      this.menu = menu;
    }
  }
  
  module.exports = Order;