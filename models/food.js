
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var foodSchema = new Schema({
  calcium : Number,
  calories : Number,
  caloriesfromfat: Number,
  cholesterol : Number,
  dietaryfiber : Number,
  iron : Number,
  protein : Number,
  saturatedfat : Number,
  sodium : Number,
  sugars : Number,
  totalcarbs : Number,
  totalfat : Number,
  transfat : Number,
  vitamina : Number,
  vitaminc : Number,
  name : String,
  portion : String,
  unit : String,
  recipe : Number,
  INQ : Number
});

module.exports.Food = exports.Food = mongoose.model('Food', foodSchema);
