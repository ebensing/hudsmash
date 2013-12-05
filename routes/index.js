
/*
 * GET home page.
 */

var Food = require('../models/food').Food;

exports.index = function(req, res){
  res.render('index', { title: 'HUDs Mash' });
};

exports.play = function(req, res){
  res.render('play', { title: 'HUDS Mash' });
};

exports.getNewPair = function (req, res) {
  Food.count(function (err, count) {
    if (err) {
      return res.sendJson(err);
    }

    var rand = Math.floor(Math.random() * num);
    Food.find({}, { skip : rand, limit : 1 }, function (err, food1) {
      if (err) {
        return res.sendJson(err);
      }

      Food.find({ INQ : { $gte : (food1.INQ - 1), $lte : (food1.INQ + 1) }}, function (err, foods) {
        if (err) {
          return res.sendJson(err);
        }

        var index = Math.floor(Math.random() * foods.length);
        var food2 = foods[index];

        var rObj = {
          foods : [food1, food2]
        };

        return res.sendJson(rObj);
      });
    });
  });
}
