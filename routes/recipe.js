var express = require('express');
var router = express.Router();
const uploadImage = require('../config/multer');
let Ingredient = require('../models/ingredient');
let Recipe = require('../models/recipe.js');
const { route } = require('./order');
router.get('/add', isLoggedIn, (req, res, next) => {
	res.render('admin/recipe/Add', { layout: false, user: req.user });
});
router.post('/add', isLoggedIn, uploadImage.single('imgFood'),async (req, res, next) => {
	const file = req.file;
	if (!file) {
		const error = new Error('Please upload a file');
		error.httpStatusCode = 400;
		return next(error);
	} else {
        let ingre = await Ingredient.findOne({ nameFood: req.body.nameFood }).select('-_id -__v -nameFood');
		let recipe = new Recipe({
            nameFood: req.body.nameFood,
            imgFood: req.file.filename,
            b1: req.body.b1,
            b2: req.body.b2,
            b3: req.body.b3,
            b4: req.body.b4,
            ingredient: ingre,
		});
		recipe.save(function (err) {
			if (err) {
				res.json({ kq: 0, errMeg: err });
			} else {
				req.flash('success_msg', 'Đã Thêm Thành Công');
				res.redirect('/admin/recipe/List');
			}
		});
	}
});
router.get('/list', isLoggedIn, (req, res, next) => {
	var success_msg = req.flash('success_msg')[0];
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Recipe.find({})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, recipe) {
			Recipe.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/recipe/List', {
					layout: false,
					data: recipe.reverse(),
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
	var find = req.body.findName;
	var perPage = 8;
	var page = parseInt(req.query.page) || 1;
	Recipe.find({ nameFood: { $regex: find } })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.exec(function (err, recipe) {
			Recipe.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('admin/recipe/List', {
					layout: false,
					data: recipe,
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
	Recipe.findById(req.params.id).deleteOne(function (err) {
		if (err) {
			res.json({ kq: 0, error: err });
		} else {
			req.flash('success_msg', 'Đã Xoá Thành Công');
			res.redirect('/admin/recipe/List');
		}
	});
});
router.get('/:id/edit', isLoggedIn, function (req, res, next) {
	Recipe.findById(req.params.id, function (err, data) {
		res.render('admin/recipe/Edit', {
			errors: null,
			data: data,
			layout: false,
			user: req.user,
		});
	});
});

router.post('/:id/edit', isLoggedIn, uploadImage.single('imgFood'), async (req, res, next) => {
	const { id } = req.params;
	const { name, b1, b2, b3, b4 } = req.body;
	try {
		const recipe = await Recipe.findByIdAndUpdate(id, {
			nameFood: name,
            imgFood: req.file.filename,
            b1: b1,
            b2: b2,
            b3: b3,
            b4: b4,
		});
		recipe.save();
		req.flash('success_msg', 'Đã Sửa Thành Công');
		res.redirect('/admin/recipe/List');
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
