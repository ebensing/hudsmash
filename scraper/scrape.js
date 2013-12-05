var http = require('http');
var Food = require('../models/food').Food;
var utils = require('../utils');

var startDate = new Date("3/21/2011");

var LIMIT = 50;
var count = 0;
var end = LIMIT - 1;

var HOST = "api.cs50.net";

var items = {};
var foods = [];

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

  var req = http.request(options, function (res) {
    var content = "";

    res.on('data', function (data) {
      content += data.toString();
    });

    res.on('end', function () {
      var respObj = utils.parseJSON(content);

      if (respObj instanceof Error) {
        return callback(respObj);
      } else {
        return callback(null, data);
      }
    });
  });

  req.end();
}


function scrapeNextDay() {
  startDate.setDate(startDate.getDate() + 1);

  var scrapeDate = startDate;

  var path = getMenuPath(scrapeDate);

  getResp(HOST, path, function (err, menu) {
    if (err) {
      console.log(err);
      return;
    }

    for (var i=0; i < menu.length; i++) {
      var rawFood = menu[i];

      saveFood(rawFood, function (err, food) {
        var today =  new Date();
        today.setHours(0,0,0,0);

        if (items[food.recipe] === undefined) {
          items[recipe] = food;
        }

        if (startDate < today) {
          setTimeout(function() {
            scrapeNextDay();
          }, 1000 * 60);
        } else {
          setTimeout(function() {
            --count || startNutrition();
          }, 1000 * 60);
        }
      });
    }
  });
}

function getMenuPath(date) {
  var temp = "/food/2/menus?key=KEY&sdt=%date%&output=json";

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
  var food = foods.pop();

  if (food) {
    var path = getNutritionPath(food);

    getResp(HOST, path, function (err, facts) {
      if (err) {
        console.log(err);
        return;
      }

      for (var i=0; i < facts.length; i++) {
        var f = facts[i];

        var key = f.fact.replace(" ","").toLowerCase();
        food[key] = f.amount;
      }

      food.INQ = calculateINQ(food);

      food.save(function (err) {
        if (err) {
          console.log(err);
          return;
        }

        setTimeout(function () {
          scrapeNutrition();
        }, 60 * 1000);
      });
    });
  } else {
    --end || console.log("done");
  }
}

function getNutritionPath(food) {
  var temp = "/food/2/facts?key=KEY&recipe=%rec%&output=json";
  return temp.replace("%rec%", food.recipe);
}

function calculateINQ(food) {
  var cal = food.calories / RDA.calories;
  var protein = (food.protein / RDA.protein) / cal;
  var fat = (food.totalfat / RDA.fat) / cal;
  var carbs = (food.totalcarbs / RDA.carbs) / cal;

  return ((protein+fat+carbs)/4);
}

for (var i=0; i < LIMIT; i++) {
  scrapeNextDay();
  count++;
}

