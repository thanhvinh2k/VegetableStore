var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);
var bcrypt = require('bcrypt-nodejs');
var randomString = require('randomstring');
var nodemailer = require('nodemailer');
var User = require('../models/user');
var Order = require('../models/order');
var Cart = require('../models/cart');

require('dotenv').config();

router.get('/userProfile', function (req, res, next) {
    var user = req.user;
    Order.find({
        user
    }, function (err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);
            order.items = cart.convertArray();
        });
        res.render('user/profile', {
            orders: orders,
            user: req.user,
            session: req.session
        });
    });
});

router.get('/changePass', isLoggedIn, function (req, res, next) {
    const messages = req.flash('error');
    res.render('user/changePassword', {
        csrfToken: req.csrfToken(),
        user: req.user,
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post('/changePass', isLoggedIn, function (req, res, next) {
    bcrypt.compare(req.body.oldPass, req.user.password, function (err, result) {
        if (!result) {
            req.flash('error', 'Mật khẩu cũ không đúng!');
            return res.redirect('back');
        } else if (req.body.newPass != req.body.newPass2) {
            req.flash('error', 'Nhập lại mật khẩu không khớp!');
            return res.redirect('back');
        } else {
            req.user.password = bcrypt.hashSync(req.body.newPass);
            req
                .user
                .save();
            req.flash('success_msg', 'Đổi mật khẩu thành công!');
            res.redirect('/user/login');
        }
    });
});

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    req.session.user = null;
    req.flash('success_msg', 'Bạn đã đăng xuất');
    req
        .session
        .destroy();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/registration', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/registration', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        user: req.user
    });
});

router.post('/registration', passport.authenticate('local-registration', {
    successReturnToOrRedirect: '/verify-email',
    failureRedirect: '/user/registration',
    failureFlash: true
}));

router.get('/login', function (req, res, next) {
    var messages = req.flash('error');
    var success_msg = req.flash('success_msg')[0];
    res.render('user/login', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        user: req.user,
        success_msg: success_msg,
        noSuccess: !success_msg
    });
});
router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/user/login',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        res.redirect(req.session.oldUrl);
        req.session.oldUrl = null;
    } else {
        res.redirect(oldUrl);
    }
});

router.get('/forgotPassword', function (req, res, next) {
    const messages = req.flash('error');
    res.render('user/forgotPassword', {
        csrfToken: req.csrfToken(),
        user: req.user,
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post('/forgotPassword', function (req, res, next) {
    const email = req.body.email;
    User.findOne({
        email: email
    }, (err, user) => {
        if (!user) {
            req.flash('error', 'Email không tồn tại!');
            return res.redirect('/user/forgotPassword');
        } else {
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });
            var pass = randomString.generate({length: 6});
            let mailDetails = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Send Password',
                html: '<p>Mật khẩu mới của bạn là:</p>' + pass
            };

            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Send email successful');
                }
            });
            user.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(5), null);
            user.save();
            req.flash('success_msg', 'Mật khẩu mới đã được gửi đến email của bạn!');
            res.redirect('/user/login');
        }
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
