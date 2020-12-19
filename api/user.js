const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const randomString = require('randomstring');
const nodemailer = require('nodemailer');
const userMiddleware = require('../middleware/user');
var bcrypt = require('bcrypt-nodejs');

require('dotenv').config();

router.post('/signup', function (req, res) {
	const { username, email, password, phone, roles } = req.body;
	if (!req.body) {
		res.json({ success: false, msg: 'Vui lòng điền đầy đủ thông tin' });
	} else {
		var newUser = new User({
			username: username,
			email: email,
			password: bcrypt.hashSync(password),
			phone: phone,
			roles: roles,
		});
		newUser.save(function (err) {
			if (err) {
				return res.json({ success: false, msg: 'Username already exists.' });
			}
			console.log(process.env.EMAIL);
			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: process.env.EMAIL,
					pass: process.env.PASSWORD,
				},
			});
			User.findOne({ username: username }).then((user) => {
				var verification_token = randomString.generate({ length: 5 });
				console.log(verification_token);
				var mainOptions = {
					from: process.env.EMAIL,
					to: email,
					subject: 'Send mail',
					text: 'Text',
					html:
						'<p>Cảm ơn đã đăng kí tài khoản của Fresh Food. Mã kích hoạt của bạn là:</p>' +
						verification_token,
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
			res.json({ success: true, msg: 'Successful created new user.' });
		});
	}
});

router.post('/verify', [userMiddleware.authentication], async function (req, res) {
	const userLogin = req.user;
	const { verifyCode } = req.body;

	const user = await User.findOne({ _id: userLogin._id }).select('verify_token');
	if (user && user.verify_token !== verifyCode) {
		return res.json({ success: false, msg: 'verify code not match' });
	}
	user.verify_token = undefined;
	user.isAuthenticated = true;
	await user.save();
	return res.json({ success: true, msg: 'Verify code success' });
});

router.post('/login', function (req, res) {
	User.findOne(
		{
			phone: req.body.phone,
		},
		function (err, user) {
			if (err) throw err;
			if (!user) {
				res.status(404).send({ success: false, msg: 'Authentication failed. User not found.' });
			} else {
				user.comparePassword(req.body.password, function (err, isMatch) {
					if (isMatch && !err) {
						var token = jwt.sign({ user }, 'mySecret', { expiresIn: 60 * 60 });
						res.json({
							success: true,
							phone: user.phone,
							password: user.password,
							token: 'JWT ' + token,
						});
					} else {
						res.status(404).send({
							success: false,
							msg: 'Authentication failed. Wrong password.',
						});
					}
				});
			}
		}
	);
});

router.get('/userDetail/:id', async (req, res) => {
	try {
		let UserDetailData = await User.findById(req.params.id).select('-__v');
		return res.status(200).json({ userDetail: UserDetailData });
	} catch (error) {
		return res.status(400).json({ msg: 'có lỗi xảy ra' });
	}
});
router.post('/changePass', function (req, res) {
	bcrypt.compare(req.body.oldPass, req.user.password, function (err, result) {
		if (!result) {
			return res.status(400).json({ success: false, msg: 'Mật khẩu cũ không đúng!' });
		} else {
			req.user.password = bcrypt.hashSync(req.body.newPass);
			req.user.save();
			res.status(200).json({ success: true, msg: 'Đổi mật khẩu thành công!' });
		}
	});
});
module.exports = router;
