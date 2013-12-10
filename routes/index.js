
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
      return res.json(err);
    }

    var rand = Math.floor(Math.random() * count);
    Food.find({}, {}, { skip : rand, limit : 1 }, function (err, food1) {
      if (err) {
        console.log(err);
        return res.json(err);
      }

      food1 = food1[0];

      Food.find({ INQ : { $gte : (food1.INQ - 5), $lte : (food1.INQ + 5) }, _id : { $ne : food1._id }}, function (err, foods) {
        if (err) {
          return res.json(err);
        }

        var index = Math.floor(Math.random() * foods.length);
        var food2 = foods[index];

        var rObj = {};
        var r = Math.random();
        if (r > .5) {
          rObj = {
            foods : [food1.toObject(), food2.toObject()]
          };
        } else {
          rObj = {
            foods : [food2.toObject(), food1.toObject()]
          };
        }

        return res.json(rObj);
      });
    });
  });
}

exports.methods = function(req, res){
  res.render('methods', { title: 'HUDS Mash' });
};

exports.about = function(req, res){
  res.render('about', { title: 'HUDS Mash' });
};
