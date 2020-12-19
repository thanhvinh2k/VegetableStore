var express = require('express');
var router = express.Router();
const uploadImage = require('../config/multer');
var Cate = require('../models/cate.js');
const { route } = require('./order');
router.get('/add', isLoggedIn, (req, res, next) => {
	res.render('admin/cate/Add', { layout: false, user: req.user });
});
router.post('/add', isLoggedIn, uploadImage.single('imgCate'), (req, res, next) => {
	const file = req.file;
	if (!file) {
		const error = new Error('Please upload a file');
		error.httpStatusCode = 400;
		return next(error);
	} else {
		var cate = new Cate({
			imgCate: req.file.filename,
			name: req.body.nameCate,
		});
		cate.save(function (err) {
			if (err) {
				res.json({ kq: 0, errMeg: err });
			} else {
				req.flash('success_msg', 'Đã Thêm Thành Công');
				res.redirect('/admin/cate/List');
			}
		});
	}
});
router.get('/list', isLoggedIn, (req, res, next) => {
	var success_msg = req.flash('success_msg')[0];
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Cate.find({})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, cate) {
			Cate.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/cate/List', {
					layout: false,
					data: cate.reverse(),
					current: page,
					hasNextPage: perPage * page < count,
					hasPreviousPage: page > 1,
					nextPage: page + 1,
					previousPage: page - 1,
					pages: Math.ceil(count / perPage),
					user: req.user,
					success_msg: success_msg,
				});
			});
		});
});

router.post('/list', isLoggedIn, function (req, res) {
	var find = req.body.findCategory;
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Cate.find({ name: { $regex: find } })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, cate) {
			Cate.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/cate/List', {
					layout: false,
					data: cate,
					current: page,
					hasNextPage: perPage * page < count,
					hasPreviousPage: page > 1,
					nextPage: page + 1,
					previousPage: page - 1,
					pages: Math.ceil(count / perPage),
					user: req.user,
				});
			});
		});
});

//delete
router.get('/:id/delete', isLoggedIn, (req, res, next) => {
	Cate.findById(req.params.id).deleteOne(function (err) {
		if (err) {
			res.json({ kq: 0, error: err });
		} else {
			req.flash('success_msg', 'Đã Xoá Thành Công');
			res.redirect('/admin/cate/List');
		}
	});
});
router.get('/:id/edit', isLoggedIn, function (req, res, next) {
	Cate.findById(req.params.id, function (err, data) {
		res.render('admin/cate/Edit', {
			errors: null,
			data: data,
			layout: false,
			user: req.user,
		});
	});
});

router.post('/:id/edit', isLoggedIn, uploadImage.single('imgCate'), async (req, res, next) => {
	const { id } = req.params;
	const { name } = req.body;
	try {
		const cate = await Cate.findByIdAndUpdate(id, {
			name: name,
			imgCate: req.file.filename,
		});
		cate.save();
		req.flash('success_msg', 'Đã Sửa Thành Công');
		res.redirect('/admin/cate/List');
	} catch (error) {
		console.log(error);
		res.send(error);
	}
});
module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated() && req.user.roles === 1) {
		return next();
	} else res.redirect('/admin/login');
}
