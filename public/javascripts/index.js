


function getNewPair() {
  $.get('/newPair', function (data) {
    if (data.message) {
      console.log(data);
      return;
    }

    $(".item1").text(data[0].portion + " " + data[0].unit + " of " + data[0].name);
    $(".item1").attr("score", data[0].INQ);


    $(".item2").text(data[1].portion + " " + data[1].unit + " of " + data[1].name);
    $(".item2").attr("score", data[1].INQ);
  });
}

function onItemClick() {
  var item = $(this).attr("class");

  var picked = parseFloat($(this).attr("score"));
  var other = 0.0;

  if (item == "item1") {
    other = parseFloat($(".item2").attr("score"));
  } else {
    other = parseFloat($(".item1").attr("score"));
  }

  if (picked > other) {
    // correct
    incScore();
    showSuccess();
  } else {
    showFail();
  }

  getNewPair();
}

function incScore() {
  var score = parseInt($(".score-value").text());
  score++;
  $(".score-value").text(score);
}

function showSuccess() {
  $("#success").removeClass("hidden");
  $("#failure").addClass("hidden");
}

function showFail() {
  $("#failure").removeClass("hidden");
  $("#success").addClass("hidden");
}

$("document").ready(function () {
  getNewPair();
});
