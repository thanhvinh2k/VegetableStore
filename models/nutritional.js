let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Nutritional = new Schema({
    nameProduct: {
        type: String,
        trim: true,
    },
    d1: {
        trim: true,
        type: String,
    },
    d2: {
        trim: true,
        type: String,
    },
    d3: {
        trim: true,
        type: String,
    },
    d4: {
        trim: true,
        type: String,
    },
    d5: {
        trim: true,
        type: String,
    },
    d6: {
        trim: true,
        type: String,
    },
    d7: {
        trim: true,
        type: String,
    },
    d8: {
        trim: true,
        type: String,
    },
    d9: {
        trim: true,
        type: String,
    },
    d10: {
        trim: true,
        type: String,
    },
    d11: {
        trim: true,
        type: String,
    },
    d12: {
        trim: true,
        type: String,
    },
});

module.exports = mongoose.model('nutritional', Nutritional);