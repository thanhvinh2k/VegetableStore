var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User
        .findById({_id: id})
        .then(function (user) {
            done(null, user);
        })
        .catch(function (err) {
            console.log(err);
        });
});
//đăng ký
passport.use('local-registration', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {

    req
        .checkBody('phone', 'Số điện thoại không hợp lệ.')
        .matches(/^(\([0-9]{3}\) |[0-9]{3})[0-9]{3}[0-9]{4}/)
        .notEmpty();
    req
        .checkBody('email', 'Địa chỉ email không hợp lệ vui, lòng kiểm tra lại.')
        .notEmpty()
        .isEmail();
    req
        .checkBody('password', 'Mật khẩu không hợp lệ, tối thiểu phải có 6 ký tự.')
        .notEmpty()
        .isLength({min: 6});
    req
        .checkBody('password', 'Nhập lại mật khẩu sai, vui lòng kiểm tra lại.')
        .notEmpty()
        .equals(req.body.confirmPassword);

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(
                null,
                false,
                {message: 'Email đã được sử dụng, vui lòng sử dụng email khác.'}
            );
        }
        var newUser = new User();
        newUser.username = req.body.username;
        newUser.phone = req.body.phone;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);
        newUser.roles = req.body.roles;
        newUser.save(function (err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser, {message: 'Chúc mừng bạn đã đăng kí thành công'});
        });
    });
}));

//login
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req
        .checkBody('email', 'Invalid Email')
        .notEmpty()
        .isEmail();
    req
        .checkBody('password', 'Invalid Password')
        .notEmpty()
        .isLength({min: 6});

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'Không tìm thấy người dùng.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Sai mật khẩu.'});
        }
        req.session.user = user
            ? true
            : false;
        return done(null, user);
    });
}));

//login admin
passport.use('local-login_ad', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req
        .checkBody('email', 'Địa chỉ email không hợp lệ vui, lòng kiểm tra lại.')
        .notEmpty()
        .isEmail();
    req
        .checkBody('password', 'Mật khẩu không hợp lệ.')
        .notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'Không tìm thấy người dùng.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Sai mật khẩu.'});
        }
        if (!user.isGroupAdmin(user.roles)) {
            return done(null, false, {
                message: 'Bạn không có quyền đăng nhập vào trang administrator, vui lòng quay lạy trang ' +
                        'chủ.'
            });
        }
        return done(null, user);
    });
}));

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'name', 'link', 'picture.type(large)']
}, function (token, refreshToken, profile, done) {
    process.nextTick(function () {
        User.findOne({
            'facebook.id': profile.id
        }, function (err, user) {
            if (err) 
                return done(err);
            if (user) {
                return done(null, user);
            } else {
                var newUser = new User();
                newUser.facebook.id = profile.id;
                newUser.facebook.token = token;
                newUser.facebook.name = profile.name.familyName + ' ' + profile.name.middleName +
                        ' ' + profile.name.givenName;
                newUser.facebook.email = profile
                    .emails[0]
                    .value;
                newUser.facebook.picture = profile
                    .photos[0]
                    .value;
                newUser.save(function (err) {
                    if (err) 
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}));

passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        User.findOne({
            'google.id': profile.id
        }, function (err, user) {
            if (err) 
                return done(err);
            if (user) {
                return done(null, user);
            } else {
                var newUser = new User();
                newUser.google.id = profile.id;
                newUser.google.token = accessToken;
                newUser.google.name = profile.name.familyName + ' ' + profile.name.middleName +
                        ' ' + profile.name.givenName;
                newUser.google.email = profile
                    .emails[0]
                    .value;
                newUser.google.picture = profile
                    .photos[0]
                    .value;
                newUser.save(function (err) {
                    if (err) 
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}));