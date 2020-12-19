let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Ingredient = new Schema({
    nameFood: {
        type: String,
        trim: true,
    },
    n1: {
        trim: true,
        type: String,
    },
    n2: {
        trim: true,
        type: String,
    },
    n3: {
        trim: true,
        type: String,
    },
    n4: {
        trim: true,
        type: String,
    },
    n5: {
        trim: true,
        type: String,
    },
    n6: {
        trim: true,
        type: String,
    },
    n7: {
        trim: true,
        type: String,
    },
    n8: {
        trim: true,
        type: String,
    },
    n9: {
        trim: true,
        type: String,
    },
    n10: {
        trim: true,
        type: String,
    },
    n11: {
        trim: true,
        type: String,
    },
    n12: {
        trim: true,
        type: String,
    },
});

module.exports = mongoose.model('ingredient', Ingredient);