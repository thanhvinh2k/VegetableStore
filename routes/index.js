var express = require('express');
var router = express.Router();
var randomString = require('randomstring');
var nodemailer = require('nodemailer');
var Users = require('../models/user');
var Product = require('../models/product');
var Cate = require('../models/cate');
var Cart = require('../models/cart');
var Order = require('../models/order');
var passport = require('passport');

var perPage = 12;
var searchText;

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    var page = parseInt(req.query.page) || 1;
    var SORT_ITEM;
    var sort_value = 'Giá từ thấp tới cao';
    var price;
    SORT_ITEM = req.query.orderby;
    if (SORT_ITEM == -1) {
        sort_value = 'Giá từ cao tới thấp';
        price = '-1';
    }
    if (SORT_ITEM == 1) {
        sort_value = 'Giá từ thấp tới cao';
        price = '1';
    }
    Product
        .find({})
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({price})
        .exec(function (err, products) {
            Product
                .countDocuments()
                .exec(function (err, count) {
                    if (err) 
                        return next(err);
                    res.render('shop/index', {
                        products: products,
                        currentPage: page != 1,
                        current: page,
                        hasNextPage: perPage * page < count,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        pages: Math.ceil(count / perPage),
                        next: page < Math.ceil(count / perPage),
                        successMsg: successMsg,
                        noMessages: !successMsg,
                        sort_value: sort_value,
                        perPage: perPage,
                        session: req.session,
                        user: req.user
                    });
                });
        });
});
router.post('/?', (req, res, next) => {
    perPage = parseInt(req.body.numItems);
    res.redirect('back');
});

//trang category
router.get('/product', function (req, res) {
    var perPage = 6;
    var page = parseInt(req.query.page) || 1;
    Product
        .find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .then(function (product) {
            Cate
                .find()
                .then(function (cate) {
                    Product
                        .countDocuments()
                        .exec(function (err, count) {
                            if (err) 
                                return next(err);
                            res.render('shop/product', {
                                product: product,
                                currentPage: page != 1,
                                next: page < Math.ceil(count / perPage),
                                current: page,
                                hasNextPage: perPage * page < count,
                                hasPreviousPage: page > 1,
                                nextPage: page + 1,
                                previousPage: page - 1,
                                pages: Math.ceil(count / perPage),
                                perPage: perPage,
                                session: req.session,
                                user: req.user,
                                cate: cate
                            });
                        });
                });
        });
});

router.get('/cate/:name.:id', function (req, res) {
  Product.find(
    {
      cateId: req.params.id,
    },
    function (err, data) {
      Cate.find().then(function (cate) {
        res.render('shop/product', {
          product: data,
          cate: cate,
          user: req.user,
        });
      });
    }
  );
});
//trang chi tiết sp
router.get('/detail/:id', function (req, res) {
    var user = req.user;
    Product
        .findById(req.params.id)
        .then(function (data) {
            var cmt = data.comment;
            res.render('shop/detail', {
                products: data,
                session: req.session,
                user: user,
                noUser: !user,
                comments: cmt.items,
                allComment: cmt.total,
                viewCounts: ++data.viewCounts
            });
        });
});

router.post('/detail/:id', function (req, res) {
    const prodId = req.params.id;
    var commentator;
    if (req.user) {
        commentator = req.user.username;
    } else {
        commentator = req.body.inputName;
    }
    Product
        .findOne({_id: prodId})
        .then((product) => {
            var today = new Date();
            product
                .comment
                .items
                .push({
                    title: req.body.inputTitle,
                    content: req.body.inputContent,
                    name: commentator,
                    date: today,
                    user: req.user,
                    star: req.body.rating
                });
            product.comment.total++;
            product.save();
        });
    res.redirect('back');
});

//find

router.get('/search', function (req, res, next) {
  searchText = req.query.searchText !== undefined ? req.query.searchText : searchText;
  var perPage = 6;
  var page = parseInt(req.query.page) || 1;
  Cate
      .find()
      .then(function (cate) {
          Product.find({
            $text: {
              $search: searchText,
            },
          })
            .countDocuments()
            .then((totalItem) => {
              count = totalItem;
              return Product.find({
                $text: {
                  $search: searchText,
                },
              })
                .skip((page - 1) * perPage)
                .limit(perPage);
            })
            .then((products) => {
              res.render('shop/product', {
                product: products,
                currentPage: page != 1,
                next: page < Math.ceil(count / perPage),
                current: page,
                hasNextPage: perPage * page < count,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                pages: Math.ceil(count / perPage),
                perPage: perPage,
                session: req.session,
                user: req.user,
                cate: cate,
              });
            });
      });
});

router.post('/product', function (req, res) {
    var find = req.body.findPro;
    Cate
        .find()
        .then(function (cate) {
            Product.find({
                name: {
                    $regex: find
                }
            }, function (err, result) {
                res.render('shop/product', {
                    product: result,
                    cate: cate,
                    user: req.user,
                    session: req.session
                });
            });
        });
});

// add product to cart
router.get('/addToCart/:id', function (req, res, next) {
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
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/cart');
    });
});

router.get('/cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var user = req.user;
    res.render('shop/cart', {
        products: cart.convertArray(),
        totalPrice: cart.totalPrice,
        user: user,
        session: req.session
    });
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/checkout', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    var user = req.user;
    res.render('shop/checkout', {
        products: cart.convertArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty,
        errMsg: errMsg,
        noError: !errMsg,
        user: user,
        session: req.session,
        isAuthenticated: !user.isAuthenticated
    });
});

router.post('/payment', isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        return res.redirect('/checkout', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var order = new Order({
        user: req.user,
        cart: cart,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        address: req.body.address,
        city: req.body.city
    });

    order.save(function (err, result) {
        req.flash('success', 'Đã thanh toán thành công!');
        req.session.cart = null;
        user = req.user;
        res.redirect('/user/userProfile');
    });
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/checkout', {products: null});
    }
    var cart = new Cart(req.session.cart);
    const Stripe = require('stripe');
    const stripe = Stripe(
        'sk_test_51HmsPSC7JsqB6DBPXkeiqfMqMcYABVSeUWEcwNkU7yAeUB0CGO6gD0nkHRRp8zCHyFmfq' +
        'mpcDbEJt08mL3hKxnEt00StkPeHyO'
    );
    stripe
        .charges
        .create({
            amount: cart.totalPrice * 100,
            currency: 'usd',
            source: req.body.stripeToken, // obtained with Stripe.js
            description: 'Payment charge'
        }, function (err, charge) {
            // asynchronously called
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            var order = new Order({user: req.user, cart: cart, paymentId: charge.id});
            order.save(function (err, result) {
                req.flash('success', 'Đã thanh toán thành công!');
                req.session.cart = null;
                user = req.user;
                res.redirect('/user/userProfile');
            });
        });
});

//del 1 product
router.get('/delCart/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(
        req.session.cart
            ? req.session.cart
            : {}
    );

    cart.delCart(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});

//del all
router.get('/remove/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(
        req.session.cart
            ? req.session.cart
            : {}
    );
    cart.remove(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});

//remove all
router.get('/delete', function (req, res) {
    req.session.cart = null;
    if (req.user) {
        req.user.cart = {};
        req
            .user
            .save();
    }
    res.redirect('cart');
});

//update sp
router.post('/update/:id', function (req, res) {
    var productId = req.params.id;
    var qty = req.body.qty;
    var cart = new Cart(
        req.session.cart
            ? req.session.cart
            : {}
    );
    cart.updateCart(productId, qty);
    req.session.cart = cart;
    var data = cart.convertArray();
    res.render('shop/cart', {
        products: data,
        totalPrice: cart.totalPrice,
        session: req.session,
        user: req.user
    });
});

router.get('/verify-email', function (req, res, next) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    Users
        .findOne({username: req.user.username})
        .then((user) => {
            var verification_token = randomString.generate({length: 5});
            var mainOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: 'Send mail',
                text: 'Text',
                html: '<p>Cảm ơn đã đăng kí tài khoản của Fresh Food. Mã kích hoạt của bạn là:</p>' +
                        verification_token
            };
            transporter.sendMail(mainOptions, (err, info) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Sent:' + info.response);
                }
            });
            user.verify_token = verification_token;
            user.save();
        });
    var messages = req.flash('error')[0];
    var user =  req.user;
    res.render('user/verify-email', {
      noMessages: !messages,
      messages: messages,
      user: user,
      isAuthenticated: user.isAuthenticated,
    });
});

router.post('/verify-email', function (req, res, next) {
    var token = req.body.token;
    Users.findOne({
        username: req.user.username
    }, (err, user) => {
        if (token == user.verify_token) {
            user.isAuthenticated = true;
            user.save();
            return res.redirect('/');
        } else if (token != user.verify_token) {
            req.flash('error', 'Mã xác thực không hợp lệ ');
            return res.redirect('/verify-email');
        }
    });
});

router.get('/contact-us', function (req, res, next) {
    var messages = req.flash('success')[0];
    res.render('shop/contact-us', {
        session: req.session,
        user: req.user,
        messages: messages,
        noMessages: !messages
    });
});

router.post('/contact', function (req, res, next) {
    var body = req.body;
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    var mainOptions = {
        from: body.email,
        to: process.env.EMAIL,
        subject: body.name,
        text: body.title,
        html: '<p>You have got a new message</b><ul><li>Username:' + body.name + '</li><li>Em' +
                'ail:' + body.email + '</li><li>Title:' + body.title + '</li><li>Message:' +
                body.content + '</li></ul>'
    };
    transporter.sendMail(mainOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Sent:' + info.response);
        }
    });
    req.flash('success', 'Đã gửi thành công');
    res.redirect('/contact-us');
});

module.exports = router;
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/login');
}
