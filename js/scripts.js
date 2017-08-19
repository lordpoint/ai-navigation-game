"use strict";



let running = false;
let zonesVis = false;
let chartVis = false;
let cycles = 1;
let cyclesArr = [];
let tenCycles = 0;
let tenCyclesArr = []; //10 cycles
let ticks = 0;
let maxTicks = 28;

let runCycle;
let asteroidQuadrant = 1;
let aiQuadrant = 1;
let hits = 0;
let tenHits = 0;
let tenHitsArr = []; //10 cycles
let avoided = 0;
let tenAvoided = 0;
let tenAvoidedArr = []; //10 cycles

let thisConfig = 111;
let goTo = 1;
let tenChart;
let successRates = [];
let tenSuccessRates = []; //10 cycles

// function to start / stop simulation
function startStop() {
  running = !running;
  if (running == true) {
    runCycle = setInterval('run()', 100);
    $('#startStop').html('Stop');
    $('#startStop').css('backgroundColor', '#f47b66');

  } else {
    clearInterval(runCycle);
    $('#startStop').html('Start');
    $('#startStop').css('backgroundColor', '#6a8bf7');
  }
}

function showZones() {
  zonesVis = !zonesVis;
  if (zonesVis == true) {
    $('#showZones').html('Hide Zones');
    $('#showZones').css('backgroundColor', '#f47b66');
    $('.zone').css('opacity', '0.2');
  } else {
    $('#showZones').html('Show Zones');
    $('#showZones').css('backgroundColor', '#8e3ebc');
    $('.zone').css('opacity', '0');
  }
}

function chartToggle() {
  chartVis = !chartVis;
  if (chartVis == true) {
    $('#chartToggle').html('Show Config Success Rates');
    $('#chartToggle').css('backgroundColor', '#f47b66');
    $('.progressChart').css('display', 'block');
    $('.data').css('display', 'none');
  } else {
    $('#chartToggle').html('Show Graph');
    $('#chartToggle').css('backgroundColor', '#bc368f');
    $('.progressChart').css('display', 'none');
    $('.data').css('display', 'block');
  }
}

function run() {
  if (ticks === 0) {
    randAsteroid();
    getGoTo();
  };
  ticks++;
  if (ticks > 0) {
    moveAsteroid(thisConfig);
    moveAi();
  };
  if (ticks === maxTicks) {
    ticks = 0;
  }
}

// randomly assign asteroid position
function randAsteroid() {
  let asteroid_y = Math.floor(Math.random() * 300);
  // determine asteroid's quadrant
  let asteroid_middle = asteroid_y + 50;
  if (asteroid_middle <= 100) {
    asteroid_y = 0;
    asteroidQuadrant = 1
  } else if (asteroid_middle > 100 && asteroid_middle <= 200) {
    asteroid_y = 100;
    asteroidQuadrant = 2
  } else if (asteroid_middle > 200 && asteroid_middle <= 300) {
    asteroid_y = 200;
    asteroidQuadrant = 3
  } else if (asteroid_middle > 300 && asteroid_middle <= 400) {
    asteroid_y = 300;
    asteroidQuadrant = 4
  }
  $('#asteroid').css('top', asteroid_y + "px");
  $('#asteroidQuad').html(asteroidQuadrant);
}

// Then figure out where the ship should move to (starts off random, then learns from experience)
function getGoTo() {
  let tempGoTo;
  // First, randomly select a quadrant for the ship to try going to
  tempGoTo = Math.floor(Math.random() * 5);
  if (tempGoTo == 0) {tempGoTo = 1};
  if (tempGoTo == 5) {tempGoTo = 4};
  thisConfig = asteroidQuadrant.toString() + aiQuadrant.toString() + tempGoTo.toString();

  if (cycles >= 20) {
    $('#cyclesRemaining').css('display', 'none');
    $('#trainingDetail').html("COMPLETE");

    if (cycles === 21) {
      $('#trainingHeader').html("AI");
      $('#trainingDetail').html("RUNNING");
    };
    if (cycles >= 22) {$('#trainingCountdown').css('display', 'none')}
    // before finalizing the goTo value, check it against other possible goTos in
    //the current asteroid quadrant / ai quadrant configuration
    let randGotoSuccess = $('#succ_' + thisConfig).html();
      console.log("Guessed config: " + thisConfig + " Guessed success rate: " + randGotoSuccess);
    let expGotoSuccess = [];
    // add all other configurations & success rates to the array "expGotoSuccess"
    for (let i = 1; i <= 4; i++) {
      if (i != tempGoTo) {
        let thisExpConfig = asteroidQuadrant.toString() + aiQuadrant.toString() + i;
        let thisExpSucc = $('#succ_' + thisExpConfig).html();
        expGotoSuccess.push({'config': thisExpConfig, 'success': parseInt(thisExpSucc), 'goTo': i});
      }
    }
    // Next, loop through the array and compare the success rates to the success rate of the random goTo
    for (let c = 0; c < expGotoSuccess.length; c++) {
      // if any item in the experience array has a greater success rate than the
      // randomly guessed goTo, replace the goTo value with the better performing goTo
      if (randGotoSuccess < expGotoSuccess[c].success) {
        thisConfig = expGotoSuccess[c].config;
        tempGoTo = expGotoSuccess[c].goTo;
        console.log("Better goTo discovered! #################" + thisConfig);
      }
    }
  } else {
    $('#cyclesRemaining').html(20 - cycles);
  }

  let finalGotoSuccess = $('#succ_' + thisConfig).html();
  goTo = tempGoTo;
  console.log("Final goTo: " + thisConfig + " final success: " + finalGotoSuccess);
  $('#trying').html(goTo);
}



// Move the asteroid across the screen
function moveAsteroid(tc) {
  let asteroid_pos = $('#asteroid').offset();
  let ai_pos = $('#ai').offset();
  let asteroid_x = asteroid_pos.left;
  let asteroid_y = asteroid_pos.top;
  let ai_x = ai_pos.left;
  let ai_y = ai_pos.top;

  if (asteroid_x > 0) { // asteroid is still moving
    asteroid_x = asteroid_x - 30;
    $('#asteroid').css('left', asteroid_x + 'px');
    if ((ai_y + 30) > asteroid_y && (asteroid_y + 100) >= ai_y && ticks === maxTicks -1) {
      hits++;
      tenHits++
      $('#hitCount').html(hits);
      $('#average').html(Math.floor((avoided/(avoided+hits)*100)) + " %");
      successRates.push(Math.floor((avoided/(avoided+hits)*100)));

      let getConfigSuccess = $('#succ_' + tc).html();
      let newSuccessNumber = parseInt(getConfigSuccess) - 2;
      $('#succ_' + tc).html(newSuccessNumber);
      $('#succ_' + tc).css('backgroundColor', '#f47b66');


    } else if (ticks === maxTicks -1){
      avoided++;
      tenAvoided++;
      $('#avoidCount').html(avoided);
      $('#average').html(Math.floor((avoided/(avoided+hits)*100)) + " %");
      successRates.push(Math.floor((avoided/(avoided+hits)*100)));


      let getConfigSuccess = $('#succ_' + tc).html();
      let newSuccessNumber = parseInt(getConfigSuccess) + 1;
      $('#succ_' + tc).html(newSuccessNumber);
      $('#succ_' + tc).css('backgroundColor', '#76f466');
    }

  } else { // asteroid reaches left side of screen
    cyclesArr.push(cycles);
    if (cycles % 10 === 0) { // every 10th cycle, run averages for that cycle
      tenCycles += 10;
      tenCyclesArr.push(tenCycles);
      tenSuccessRates.push(Math.floor((tenAvoided/(tenAvoided+tenHits)*100)));
      tenChart.update();
      tenAvoided = 0;
      tenHits = 0;

    }
    cycles++;
    $('#asteroid').css('left', '800px');
    $('#cyclesCount').html(cycles);
  }
}

function moveAi() {
  // get ai's current quadrant
  let ai_pos = $('#ai').offset();
  let ai_y = Math.floor(ai_pos.top);
  let newAi_y;
  // set target
  let target_y = 0;
  if (goTo == 1) {target_y = 35};
  if (goTo == 2) {target_y = 135};
  if (goTo == 3) {target_y = 235};
  if (goTo == 4) {target_y = 335};

  // determine ai's quadrant
  let ai_middle = ai_y + 15;
  if (ai_middle <= 100) {aiQuadrant = 1};
  if (ai_middle > 100 && ai_middle <= 200) {aiQuadrant = 2}
  if (ai_middle > 200 && ai_middle <= 300) {aiQuadrant = 3}
  if (ai_middle > 300 && ai_middle <= 400) {aiQuadrant = 4}
  $('#aiQuad').html(aiQuadrant);

  // move ai
  if (ai_y < target_y) {
    if (target_y - ai_y < 10) {
      newAi_y = Math.floor(ai_y + 5);
      $('#ai').css('marginTop', newAi_y + 'px');
    } else {
      newAi_y = Math.floor(ai_y + 10);
      $('#ai').css('marginTop', newAi_y + 'px');
    }

  } else if (ai_y > target_y) {
    if (ai_y - target_y < 10) {
      newAi_y = Math.floor(ai_y - 5);
      $('#ai').css('marginTop', newAi_y + 'px');
    } else {
      newAi_y = Math.floor(ai_y - 10);
      $('#ai').css('marginTop', newAi_y + 'px');
    }

  }
}

function tenStatsChart() {
  var ctx = document.getElementById("tenChart").getContext('2d');
  tenChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: tenCyclesArr,
          datasets: [{
              label: 'Success Rate / Ten Cycles',
              data: tenSuccessRates,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });
}

tenStatsChart();
