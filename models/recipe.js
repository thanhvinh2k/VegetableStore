let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Recipe = new Schema({
    nameFood: {
        type: String,
        trim: true,
    },
    imgFood: {
        type: String,
    },
    b1: {
        trim: true,
        type: String,
    },
    b2: {
        trim: true,
        type: String,
    },
    b3: {
        trim: true,
        type: String,
    },
    b4: {
        trim: true,
        type: String,
    },
    ingredient: {
        type: Object,
    },
});

module.exports = mongoose.model('recipe', Recipe);