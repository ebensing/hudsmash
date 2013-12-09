var http = require('http');
var Food = require('../models/food').Food;
var utils = require('../utils');
var mongoose = require('mongoose');

var startDate = new Date("3/21/2011");

var LIMIT = 50;
var count = 0;
var end = LIMIT - 1;
var foodCount = 0;

var HOST = "cs50-prod.apigee.net";

var items = {};
var foods = [];

var KEY = "";

var RDA = {
  fat : 65.0,
  carbs : 300.0,
  protein : 50.0,
  calories : 2000.0
};

function getResp(host, path, callback) {
  var options = {
    hostname : host,
    path : path,
    method : "GET"
  };
  //console.log(options);
  var req = http.request(options, function (res) {
    var content = "";

    res.on('data', function (data) {
      content += data.toString();
    });

    res.on('end', function () {
      var respObj = utils.parseJSON(content);

      if (respObj instanceof Error || respObj.fault) {
        return callback(respObj);
      } else {
        return callback(null, respObj);
      }
    });
  });

  req.end();
}


function scrapeNextDay() {
  startDate.setDate(startDate.getDate() + 1);

  var sd = new Date(startDate.getTime());

  (function(scrapeDate) {
    var path = getMenuPath(scrapeDate);

    getResp(HOST, path, daycb);

    function daycb(err, menu) {
      if (err && err.fault) {
        console.log(err);
        // server fault on the api's end, re-try
        setTimeout(function () {
          getResp(HOST, path, daycb);
        }, 60 * 1000);
        return;
      }
      if (err) {
        console.log(err);
        return;
      }

      var flen = menu.length;
      if (flen == 0) {
        return cont();
      }
      for (var i=0; i < menu.length; i++) {
        var rawFood = menu[i];

        saveFood(rawFood, function (err, food) {
          if (err) {
            console.log(err);
            return;
          }
          if (items[food.recipe] === undefined) {
            items[food.recipe] = food;
          }

          --flen || cont();
        });
      }

      function cont() {
        var today =  new Date();
        today.setHours(0,0,0,0);
        console.log("Date Finished: " + scrapeDate.toString());

        if (scrapeDate < today) {
          setTimeout(function() {
            scrapeNextDay();
          }, 1000 * 60);
        } else {
          setTimeout(function() {
            --count || startNutrition();
          }, 1000 * 60);
        }
      }
    }
  })(sd);
}

function getMenuPath(date) {
  var temp = "/food/2/menus?key=KEY&sdt=%date%&output=json".replace("KEY", KEY);

  var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  return temp.replace("%date%", dateStr);
}

function saveFood(rawData, callback) {
  var saveItem = {};

  saveItem.recipe = rawData.recipe;
  saveItem.name = rawData.name;
  saveItem.portion = rawData.portion;
  saveItem.unit = rawData.unit;

  Food.findOneAndUpdate(saveItem, saveItem, { upsert : true }, callback);

}

function startNutrition() {

  var keys = Object.keys(items);

  for (var i=0; i < keys.length; i++) {
    foods.push(items[keys[i]]);
  }

  for (var i=0; i < LIMIT; i++) {
    scrapeNutrition();
  }
}

function scrapeNutrition() {
  if (foodCount < foods.length) {
    (function(x) {
      foodCount++;
      var path = getNutritionPath(foods[x]);
      getResp(HOST, path, function (err, facts) {
        if (err) {
          console.log(err);
          return;
        }

        if (facts.length && facts[0].amount) {
          for (var i=0; i < facts.length; i++) {
            var f = facts[i];

            var key = f.fact.replace(" ","").toLowerCase();
            foods[x][key] = f.amount;
          }

          foods[x].INQ = calculateINQ(foods[x]);
          if (isNaN(foods[x].INQ)) {
            foods[x].INQ = -1;
          }
        }

        foods[x].save(function (err) {
          if (err) {
            console.log(err);
            return;
          }

          setTimeout(function () {
            scrapeNutrition();
          }, 60 * 1000);
        });
      });
    })(foodCount);
  } else {
    --end || console.log("done");
  }
}

function getNutritionPath(food) {
  var temp = "/food/2/facts?key=KEY&recipe=%rec%&portion=1&output=json".replace("KEY", KEY);
  return temp.replace("%rec%", food.recipe);
}

function calculateINQ(food) {
  var cal = food.calories / RDA.calories;
  var protein = (food.protein / RDA.protein) / cal;
  var fat = (food.totalfat / RDA.fat) / cal;
  var carbs = (food.totalcarbs / RDA.carbs) / cal;

  return ((protein+fat+carbs)/4);
}

mongoose.connect("mongodb://localhost/huds", function (err) {
  if (err) {
    console.log(err);
    return;
  }
  Food.find({}, function (err, allFoods) {
    if (err) {
      console.log(err);
      return;
    }
    if (allFoods.length == 0) {
      for (var i=0; i < LIMIT; i++) {
        scrapeNextDay();
        count++;
      }
    } else {
      foods = allFoods;

      for (var i=0; i < LIMIT; i++) {
        scrapeNutrition();
      }
    }
  });
});

