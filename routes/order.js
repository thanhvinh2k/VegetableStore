var express = require('express');
var router = express.Router();

var Order = require('../models/order.js');
var Cart = require('../models/cart.js');

router.get('/', isLoggedIn, function (req, res, next) {
    res.render('admin/order/list', {layout: false});
});

router.get('/list', isLoggedIn, function (req, res, next) {
    var success_msg = req.flash('success_msg')[0];
    Order
        .find()
        .then(function (data) {
            res.render('admin/order/list', {
                data: data,
                layout: false,
                user: req.user,
                success_msg: success_msg
            });
        });
});

router.post('/statistical', isLoggedIn, function (req, res, next) {
    Order.aggregate([
        {
            '$match': {
                "date": {
                    '$gte': new Date("2020-11-01"),
                    '$lt': new Date("2020-11-31")
                }
            }
        }, {
            $group: {
                "_id": {
                    date: "$date",
                    "day": {
                        "$dayOfMonth": "$date"
                    }
                },
                Total: {
                    $sum: "$gia"
                }
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err)
            res.send({err})
        } else {
            console.log(result)
            return res.send({data: result})
        }
    })
});

router.get('/:id/view', isLoggedIn, function (req, res, next) {
    var id = req.params.id;
    Order
        .findById(id)
        .then(function (data) {
            var cart = data.cart;
            res.render('admin/order/view', {
                pro: data,
                layout: false,
                totalPrice: cart.totalPrice,
                cart: cart.items,
                user: req.user
            });
        });
});

router.get('/:id/delete', isLoggedIn, function (req, res, next) {
    var id = req.params.id;
    Order.findOneAndRemove({
        _id: id
    }, function (err, offer) {
        req.flash('success_msg', 'Đã Xoá Thành Công');
        res.redirect('/admin/order/list');
    });
});

router.get('/:id/pay', isLoggedIn, function (req, res, next) {
    var id = req.params.id;
    Order.findById(id, function (err, data) {
        data.payment = true;
        data.save();
        req.flash('success_msg', 'Đã Thanh Toán');
        res.redirect('/admin/order/' + id + '/view');
    });
});
module.exports = router;

// Hàm được sử dụng để kiểm tra đã login hay chưa
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.roles === 1) {
        return next();
    } else 
        res.redirect('/admin/login');
    }
