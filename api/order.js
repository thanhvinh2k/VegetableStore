const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
var Product = require('../models/product');

router.get('/addCart/:id', async (req, res) => {
    var productId = req.params.id;
    var cart = new Cart(
        req.session.cart
            ? req.session.cart
            : {
                items: {}
            }
    );
    Product.findById(productId, function (err, product) {
        if (err) {
            return res.json({success: false, msg: 'Product notfound!'});
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.json({success: true, msg: 'Add success', cart: cart});;
    });
});

router.get('/cart', function (req, res) {
    if (!req.session.cart) {
        return res
            .status(400)
            .json({msg: "có lỗi xảy ra"});;
    }
    var cart = new Cart(req.session.cart);
    var user = req.user;
    res
        .status(200)
        .json({
            success: true,
            cart: cart,
            products: cart.convertArray(),
            totalPrice: cart.totalPrice,
            user: user,
            session: req.session
        });
})

router.post('/checkout', function (req, res) {
    let cart = new Cart(req.session.cart);
    let order = new Order({
        user: req.user,
        cart: cart,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        address: req.body.address,
        city: req.body.city
    });

    order.save(function (err, result) {
        if (err) {
            res.json({success: false, msg: "Checkout failed"});
        }
        req.session.cart = null;
        user = req.user;
        res
            .status(200)
            .json({result: result, msg:"Checkout success"});
    });
})

router.get('/orderByid/:id', async (req, res) => {
    try {
        let OrderData = await Order.find({user: req.params.id});
        return res
            .status(200)
            .json({Orders: OrderData});
    } catch (error) {
        return res
            .status(400)
            .json({msg: "có lỗi xảy ra"});
    }
});

router.get('/detail/:id', async (req, res) => {
    try {
        let OrderDetail = await Order.findById(req.params.id);
        return res
            .status(200)
            .json({detailOrder: OrderDetail});
    } catch (error) {
        return res
            .status(400)
            .json({msg: "có lỗi xảy ra"});
    }
});
module.exports = router;