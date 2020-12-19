var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var randomString = require('randomstring');
var nodemailer = require('nodemailer');
var User = require('../models/user');
// var csrf = require('csurf');
// var csrfProtection = csrf();
// router.use(csrfProtection);

require('dotenv').config();

router.get('/', isLoggedIn, function (req, res) {
    res.render('admin/main/index', {
        layout: false,
        user: req.user
    });
});


router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/admin/login');
});

router.get('/login', notisLoggedIn, function (req, res, next) {
    var messages = req.flash('error');
    var successMsg = req.flash('success_msg')[0];
    res.render('admin/login/login_ad', {
    //   csrfToken: req.csrfToken(),
      messages: messages,
      noSuccess: !successMsg,
      success: successMsg,
      hasErrors: messages.length > 0,
      layout: false,
    });
});

router.post('/login', passport.authenticate('local-login_ad', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login',
    failureFlash: true
}));

router.get('/changePass', isLoggedIn, function (req, res, next) {
    const messages = req.flash('error');
    res.render('admin/login/changePassword', {
    //   csrfToken: req.csrfToken(),
      layout: false,
      messages: messages,
      hasErrors: messages.length > 0,
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
            req.user
                .save();
            req.flash('success_msg', 'Đổi mật khẩu thành công!');
            res.redirect('/admin/login');
        }
    });
});
router.get('/forgotPassword', function (req, res, next) {
    const messages = req.flash('error');
    res.render('admin/login/forgotPassword', {
    //   csrfToken: req.csrfToken(),
      layout: false,
      user: req.user,
      messages: messages,
      hasErrors: messages.length > 0,
    });
});

router.post('/forgotPassword', function (req, res, next) {
    const email = req.body.email;
    User.findOne({
        email: email
    }, (err, user) => {
        if (!user) {
            req.flash('error', 'Email không tồn tại!');
            return res.redirect('/admin/forgotPassword');
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
            res.redirect('/admin/login');
        }
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

function notisLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        if (req.isAuthenticated() && req.user.roles !== 1) {
            return next();
        } else {
            res.redirect('/admin');
        }
    }
}
