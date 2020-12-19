var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cart = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cart: {
        type: Object,
        required: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    birthday: {
        type: Date
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    date: {
        type: Date,
        required: false,
        default: Date.now
    },
    payment: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String
    }
});
module.exports = mongoose.model('order', Cart);
