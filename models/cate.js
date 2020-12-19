var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

var Cate = new Schema(
  {
    _id: {type: Number},
    imgCate: {type: String},
    name: {type: String},
  },
  {
    _id: false,
    timestamps: true,
  }
);
Cate.plugin(AutoIncrement);
module.exports = mongoose.model('cate', Cate);
