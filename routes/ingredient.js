const express = require('express');
const router = express.Router();

var Ingredient = require('../models/ingredient');
router.post('/add', (req, res, next) => {
	let ing = new Ingredient({
		nameFood: req.body.nameFood,
		n1: req.body.n1,
		n2: req.body.n2,
		n3: req.body.n3,
		n4: req.body.n4,
		n5: req.body.n5,
		n6: req.body.n6,
		n7: req.body.n7,
		n8: req.body.n8,
		n9: req.body.n9,
		n10: req.body.n10,
		n11: req.body.n11,
		n12: req.body.n12,
	});
	ing.save((err) => {
		if (err) {
			res.json({ kq: 0, errMeg: err });
		} else {
			req.flash('success_msg', 'Đã Thêm Thành Công');
			res.redirect('/admin/ingredient/List');
		}
	});
});

router.get('/list', isLoggedIn, function (req, res) {
	var success_msg = req.flash('success_msg')[0];
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Ingredient.find({})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, ingredients) {
			Ingredient.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/recipe/ListIngredient', {
					layout: false,
					ingredient: ingredients.reverse(),
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
	var find = req.body.findIngredient;
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Ingredient.find({
		nameFood: {
			$regex: find,
		},
	})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, ingredients) {
			Ingredient.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/recipe/ListIngredient', {
					layout: false,
					ingredient: ingredients,
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
	Ingredient.findById(req.params.id, function (err, data) {
		res.render('admin/recipe/EditIngredient', {
			errors: null,
			ingredient: data,
			layout: false,
			user: req.user,
		});
	});
});

router.post('/:id/edit', isLoggedIn, async (req, res, next) => {
	const { id } = req.params;
	const { nameFood, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10 } = req.body;
	try {
		const ing = await Ingredient.findByIdAndUpdate(id, {
			nameFood: nameFood,
			n1: n1,
			n2: n2,
			n3: n3,
			n4: n4,
			n4: n5,
			n6: n6,
			n7: n7,
			n8: n8,
			n9: n9,
			n10: n10,
		});
		ing.save();
		req.flash('success_msg', 'Đã Cập Nhật Thành Công');
		res.redirect('/admin/ingredient/List');
	} catch (error) {
		console.log(error);
		res.send(error);
	}
});

router.get('/:id/delete', isLoggedIn, (req, res) => {
	Ingredient.findById(req.params.id).remove(function (err) {
		if (err) {
			res.json({ kq: 0, error: err });
		} else {
			req.flash('success_msg', 'Đã Xoá Thành Công');
			res.redirect('/admin/ingredient/List');
		}
	});
});
module.exports = router;
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated() && req.user.roles === 1) {
		return next();
	} else res.redirect('/admin/login');
}
