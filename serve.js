const express = require('express');
const expressHbs = require('express-handlebars');
const app = express();
const port = process.env.PORT || 3000;
const Handlebars = require('handlebars');
const cors = require('cors');
var passport = require('passport');
var flash = require('connect-flash');
app.use(flash());
var session = require('express-session');
var createError = require('http-errors');
var bodyParser = require('body-parser');
var express_handlebars_sections = require('express-handlebars-sections');
var validator = require('express-validator');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
const hbs = require('hbs');

var admin = require('./routes/admin');
var product = require('./routes/product');
var cate = require('./routes/cate');
var user = require('./routes/user');
var users = require('./routes/userAdmin');
var indexRouter = require('./routes/index');
var order = require('./routes/order');
let nutritional = require('./routes/nutritional');
let ingredient = require('./routes/ingredient');
let recipe = require('./routes/recipe');

//connect mongoose
app.use(cors());
const mongoose = require('mongoose');
const urlConnect = process.env.DB;
mongoose.connect(
	urlConnect,
	{
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	},
	function (err) {
		if (err) {
			console.log('Mongoose connect err' + err);
		} else {
			console.log('Mongoose connected successful');
		}
	}
);

//socket serving static files
app.use(express.static(__dirname + '/public'));
app.use('/upload', express.static('/public/upload'));

//configure handlebars
app.engine('.hbs', expressHbs());
app.set('view engine', '.hbs');

app.engine(
	'hbs',
	expressHbs({
		extname: 'hbs',
		defaultLayout: 'layout',
		partialsDir: __dirname + '/views/partials/',
		handlebars: allowInsecurePrototypeAccess(Handlebars),
		section: express_handlebars_sections(),
	})
);
hbs.registerPartials(__dirname + '/views/partials');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());

//Lưu dữ liệu phiên đăng nhập
app.use(
	session({
		secret: 'mySecret',
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		cookie: {
			maxAge: 180 * 60 * 1000,
			secure: false,
			httpOnly: false,
			domain: 'localhost',
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
app.use('/admin', admin);
app.use('/admin/product', product);
app.use('/admin/cate', cate);
app.use('/admin/user', users);
app.use('/admin/order', order);
app.use('/admin/nutritional', nutritional);
app.use('/admin/ingredient', ingredient);
app.use('/admin/recipe', recipe);
app.use('/user', user);
app.use('/', indexRouter);

//api
app.use('/api/product', require('./api/product'));
app.use('/api/cate', require('./api/cate'));
app.use('/api/order', require('./api/order'));
app.use('/api/user', require('./api/user'));
app.use('/api/recipe', require('./api/recipe'));

app.use(function (req, res, next) {
	res.locals.login = req.isAuthenticated();
	res.locals.success_msg = req.flash('success_msg');
	res.locals.currentUser = req.user || null;
	res.locals.session = req.session;
	next();
});

//404
app.use(function (req, res, next) {
	next(createError(404));
});

app.listen(port, () => {
	console.log('server listening on port', port);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});
