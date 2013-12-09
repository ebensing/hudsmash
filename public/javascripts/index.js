


function getNewPair() {
  $.get('/newPair', function (data) {
    if (data.message) {
      console.log(data);
      return;
    }

    data = data.foods;

    $(".item1").text(data[0].portion + " " + data[0].unit + " of " + data[0].name);
    $(".item1").attr("score", data[0].INQ);

    $(".item1-protein").text(data[0].protein + " g");
    $(".item1-carbs").text(data[0].totalcarbs + " g");
    $(".item1-fats").text(data[0].totalfat + " g");


    $(".item2").text(data[1].portion + " " + data[1].unit + " of " + data[1].name);
    $(".item2").attr("score", data[1].INQ);

    $(".item2-protein").text(data[1].protein + " g");
    $(".item2-carbs").text(data[1].totalcarbs + " g");
    $(".item2-fats").text(data[1].totalfat + " g");
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

}

function incScore() {
  var score = parseInt($(".score-value").text());
  score++;
  $(".score-value").text(score);
}

function showSuccess() {
  $(".inforow").removeClass("invisible");
  $("#success").removeClass("hidden");
  $("#failure").addClass("hidden");
  $("#nextBtn").removeClass("hidden");
}

function showFail() {
  $(".inforow").removeClass("invisible");
  $("#failure").removeClass("hidden");
  $("#success").addClass("hidden");
  $("#nextBtn").removeClass("hidden");
}

$("document").ready(function () {
  getNewPair();
  $(".item1").click(onItemClick);
  $(".item2").click(onItemClick);

  $("#nextBtn").click(function () {
    $("#success").addClass("hidden");
    $("#failure").addClass("hidden");
    $("#nextBtn").addClass("hidden");
    $(".inforow").addClass("invisible");
    getNewPair();
  });
});
