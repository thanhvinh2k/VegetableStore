const express = require('express');
const router = express.Router();

var Nutritional = require('../models/nutritional');
router.post('/add', (req, res, next) => {
	let nut = new Nutritional({
		nameProduct: req.body.nameProduct,
		d1: req.body.d1,
		d2: req.body.d2,
		d3: req.body.d3,
		d4: req.body.d4,
		d5: req.body.d5,
		d6: req.body.d6,
		d7: req.body.d7,
		d8: req.body.d8,
		d9: req.body.d9,
		d10: req.body.d10,
		d11: req.body.d11,
		d12: req.body.d12,
	});
	nut.save((err) => {
		if (err) {
			res.json({ kq: 0, errMeg: err });
		} else {
			req.flash('success_msg', 'Đã Thêm Thành Công');
			res.redirect('/admin/nutritional/List');
		}
	});
});
router.get('/list', isLoggedIn, function (req, res) {
	var success_msg = req.flash('success_msg')[0];
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Nutritional.find({})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, nutritionals) {
			Nutritional.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/product/ListNutritional', {
					layout: false,
					nutritional: nutritionals.reverse(),
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
	var find = req.body.findNutritional;
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Nutritional.find({
		nameProduct: {
			$regex: find,
		},
	})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, nutritionals) {
			Nutritional.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/product/ListNutritional', {
					layout: false,
					nutritional: nutritionals,
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

router.get('/:id/edit', isLoggedIn, function (req, res) {
	Nutritional.findById(req.params.id, function (err, data) {
		res.render('admin/product/EditNutritional', {
			errors: null,
			nutritional: data,
			layout: false,
			user: req.user,
		});
	});
});

router.post('/:id/edit', isLoggedIn, async(req, res, next) => {
	const { id } = req.params;
	const { nameProduct, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12 } = req.body;
	try {
		const nut = await Nutritional.findByIdAndUpdate(id, {
			nameProduct: nameProduct,
			d1: d1,
			d2: d2,
			d3: d3,
			d4: d4,
			d4: d5,
			d6: d6,
			d7: d7,
			d8: d8,
			d9: d9,
			d10: d10,
			d11: d11,
			d12: d12,
		})
		nut.save();
		req.flash('success_msg', 'Đã Cập Nhật Thành Công');
		res.redirect('/admin/nutritional/List');
	} catch (error) {
		console.log(error);
		res.send(error);
	}
});

router.get('/:id/delete', isLoggedIn, (req, res) => {
	Nutritional.findById(req.params.id).remove(function (err) {
		if (err) {
			res.json({ kq: 0, error: err });
		} else {
			req.flash('success_msg', 'Đã Xoá Thành Công');
			res.redirect('/admin/nutritional/List');
		}
	});
});
module.exports = router;
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated() && req.user.roles === 1) {
		return next();
	} else res.redirect('/admin/login');
}
