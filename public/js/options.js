(function($) {
  "use strict"; // Start of use strict

  //function for generation of random numbers
  //from: http://stackoverflow.com/questions/1527803/
  //generating-random-numbers-in-javascript-in-a-specific-range
  function randInt(min,max)
  {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  //choose a random image as the header background
  var imageName = 'url(../img/header' + parseInt(randInt(0,2)) + '.jpg)';
  $('header').css({'background-image':imageName});

  $.get("/userStats", function(data){
    $('.min-miles-number').text(data.users.goalDistance + " " + data.users.goalUnits);
    if (data.distToGo > 0){
      $('#distance').prop('disabled', true);
      $('#setDistance').prop('disabled', true);
      $('#day').prop('disabled', true);
      $('#week').prop('disabled', true);
      $('#distance-units-button').prop('disabled', true);
      $('#cant-change-warning').toggle();
      $('#cant-remove-site').toggle();
      $('#modalSet').prop('disabled', true);
    }
  });

// GOAL RATE

  function setGoalRate(){
    $.get("/userStats", function(data){
      var goalRate = data.users.goalRate;
      if (goalRate === "week"){
        $("#week").prop('checked',true);
      }
      if (goalRate === "day"){
        $("#day").prop('checked', true);
      }
    });
  }
  setGoalRate();

  function updateGoalRate(newRate){
    $.ajax({
      url:"/user", 
      method: "PATCH",
      data: { goalRate : newRate }});
    setGoalRate()
  }

  $('#goalRate :input').change( function() {
   updateGoalRate(this.value);
  })

  // BLOCKED SITES
  //updates block sites list to reflect adding/removing sites
  function updateBlockedDomains(newBlockedDomains){
    $("#blockSiteList").empty();
    $.get("/userStats", function(data){
      for(var i = 0; i < newBlockedDomains.length; i++){
        var blockedSite = newBlockedDomains[i];
        if (data.distToGo <= 0){
          $("#blockSiteList").prepend('<li>' + blockedSite + '   <div class="glyphicon glyphicon-remove"> </div>'+'</li>');
        }
        else{
          $("#blockSiteList").prepend('<li>' + blockedSite + '</li>');
        }
      }
    });
  }

  //sets blocked site list on open/refresh
  $.get("/userStats", function(data){
    var blockedSites = data.users.blockedDomains;
    updateBlockedDomains(blockedSites)
    if (data.distToGo <= 0){
      $('#blockSiteList').on('click', 'li', function(){
        var site = $(this).index();
        removeSite(site);
      })
    }
  });

  function addSite() {
    var newSite = document.getElementById("domain").value;
    $.get("/userStats", function(data){
      var currentlyBlocking = data.users.blockedDomains;
      currentlyBlocking.push(newSite);
      updateBlockedDomains(currentlyBlocking);
      $.ajax({
        url:"/user", 
        method: "PATCH",
        data: { blockedDomains : currentlyBlocking }});
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("addSite").addEventListener("click", addSite);
  });

  function removeSite(siteIndex) {
    $.get("/userStats", function(data){
      var currentlyBlocking = data.users.blockedDomains;
      currentlyBlocking.splice(siteIndex, 1);
      updateBlockedDomains(currentlyBlocking);
      currentlyBlocking = [0];
      $.ajax({
        url:"/user", 
        method: "PATCH",
        data: { blockedDomains : currentlyBlocking}});
    });
  }

// GOAL DISTANCE

function updateGoalPlaceholder(){
  $.get("/userStats", function(data){
    $('.distance-units').text(data.users.goalUnits);
    if (isNaN(data.users.goalDistance) === false){ 
      $('#distance').prop('placeholder', data.users.goalDistance.toString() + " " + data.users.goalUnits);
    }
  });
}

updateGoalPlaceholder();

  $('#distance-units-drop li').on('click', function(){
    var units = $(this).text().toLowerCase();
    console.log(units);
    $.ajax({
      url:"/user", 
      method: "PATCH",
      data: { goalUnits : units }});
    updateGoalPlaceholder();
    });

  function updateGoal(distance, units){
    $('.min-miles-number').text(distance + " " + units);
  }

  function validateDistance() {
      var distanceString = document.getElementById("distance").value;
      var distance = parseFloat(distanceString); // this parseInt does have limitations...
      var units = $('#distnace-units-drop li').text().toLowerCase();
      if (isNaN(distance) === true) { // check if number was entered
          alert("Distance must be filled out to set.");
          $('alert alert-danger');
          return false;
      }
      else {
        $.ajax({
          url:"/user", 
          method: "PATCH",
          data: { goalDistance : distance }});
        updateGoal(distance, units);
        updateGoalPlaceholder();
      }
  }

  document.addEventListener("DOMContentLoaded", function() {
      document.getElementById("setDistance").addEventListener("click", validateDistance);
  });

})(jQuery); // End of use strict
