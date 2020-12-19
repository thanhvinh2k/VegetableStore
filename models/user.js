var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var userSchema = new Schema({
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        require: true
    },
    phone: {
        type: Number,
        trim: true
    },
    roles: {
        type: Number,
        default: 0,
        trim: true
    },
    verify_token: {
        type: String,
        required: false
    },
    isAuthenticated: {
        type: Boolean,
        required: false,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        picture: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        picture: String
    }
});

// Các phương thức ====================== Tạo mã hóa mật khẩu
userSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

// kiểm tra mật khẩu có trùng khớp
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.isGroupAdmin = function (checkRole) {
    if (checkRole === 1) {
        return true;
    } else {
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);
