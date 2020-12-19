function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;
  
  this.add = function (item, id) {
    var order = this.items[id];
    if (!order) {
      order = this.items[id] = {item: item, qty: 0, price: 0};
    }
    order.qty++;
    order.price = order.item.price * order.qty;
    this.totalQty++;
    this.totalPrice += order.item.price;
  };
  //xóa 1 sp
  this.delCart = function (id) {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.totalPrice -= this.items[id].item.price;
    this.totalQty--;
    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };
  //xóa nhiều sp
  this.remove = function (id) {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  };

  //update sp
  this.updateCart = function (id, quantity) {
    var qtyAdvance, qtyAfter;
    var order = this.items[id];

    qtyAdvance = order.qty;
    qtyAfter = parseInt(quantity);

    let oldQty = order.qty;
    order.qty = qtyAfter;
    order.price = order.qty * order.item.price;
    this.totalQty += qtyAfter - oldQty;
    this.totalPrice += (qtyAfter - qtyAdvance) * order.item.price;
  };

  this.convertArray = function () {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
}

module.exports = Cart;
