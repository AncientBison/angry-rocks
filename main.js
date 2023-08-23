var mouseUp = false;
var reloadCommand = false;
var loadingCatapult = false;
var createStackAndClear = false;
var loaded = true;
const DEFAULT_PYRAMID_SIZE = 9;
var oldAudio;


var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  Events = Matter.Events,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies, 
  Body = Matter.Body;

var debris = Matter.Composite.create();
var engine = Engine.create();
var world = engine.world;
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {


    width: 800, 
    height: 600,
    showAngleIndicator: true,
    showVelocity: true,
    pixelRatio: 2
  }
});

render.options.hasBounds = true;

let veiwBounds = Matter.Bounds.create([{x: 0, y: 0}, {x: 800, y: 600}]);

render.bounds = veiwBounds;

Render.run(render);
var runner = Runner.create();
Runner.run(runner, engine);

var defaultCategory = 0x0001,
  mouseCategory = 0x0002;
var ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true, render: { fillStyle: '#060a19' }, friction: 1});

var rockOptions = {
  density: 10,
  airFriction: 0.005,
  collisionFilter: {
    category: mouseCategory
  }, 
  friction: 1
};

var targetOptions = {
  density: 1, 
  friction: 0.5, 
  slop: 0.4
};

var rock = Bodies.polygon(170, 450, 8, 20, rockOptions);

var anchor = { x: 170, y: 450 };

var elastic = Constraint.create({
  pointA: anchor,
  bodyB: rock,
  stiffness: 0.01
});

function createPyramid(size, sides = 4) {
  let pyramid = Composites.pyramid(340, 340, size * 2 - 1, size, 0, 0, function (x, y) {

    return Bodies.polygon(x, y, sides, 20, targetOptions);
  });

  Composite.add(engine.world, pyramid);
  Composite.add(debris, pyramid);
}

function createStack(row, col, sides = 4) {
  let pyramid = Composites.stack(500, 300, row, col, 0, 0, function (x, y) {

    return Bodies.polygon(x, y, sides, 20, targetOptions);
  });

  Composite.add(engine.world, pyramid);
  Composite.add(debris, pyramid);
}

Composite.add(engine.world, [ground, rock, elastic]);
createStack(9, 9);
var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    },
  });

mouseConstraint.collisionFilter.mask = mouseCategory;

const fireRadius = 20;

function isPositive(number) {
  return number > 0;
}

function inDifferentQuadrants(point1, point2) {
 return isPositive(point1.y) != isPositive(point2.y) ||  isPositive(point1.x) != isPositive(point2.x);
}

function subtractPoints(point1, point2) {
  return {x: point1.x - point2.x, y: point1.y - point2.y};
}

let rockPositionWhenFired;

Events.on(engine, "afterUpdate", function () {
  if (mouseUp) {
    let relativePositionFromWhenFired = subtractPoints(rockPositionWhenFired, elastic.pointA);
    let relativeNewPosition = subtractPoints(rock.position, elastic.pointA);
    if (inDifferentQuadrants(relativePositionFromWhenFired, relativeNewPosition)) {
      mouseUp = false;
      placeholder = Bodies.circle(elastic.pointA.x, elastic.pointA.y, 1)
      elastic.bodyB = placeholder;
      Composite.add(debris, rock);
      loaded = false;
      try {
        oldAudio.currentTime = 0;
        oldAudio.play();
      } catch (e) {
        oldAudio = new Audio("./donkey.mp3");
        oldAudio.play();
      } 
    }
  } else if (reloadCommand) {
    reloadCommand = false;
    if (!loadingCatapult && !loaded) {
      loaded = true;
      rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
      Composite.add(engine.world, rock);
      elastic.bodyB = rock;
    }
  }

  if (createStackAndClear) {
    reloadCommand = true;

    for (let body of Composite.allComposites(debris)) {
      Composite.remove(world, body);
    }

    for (let body of Composite.allBodies(debris)) {
      Composite.remove(world, body);
    }

    Composite.clear(debris);
    if (document.getElementById("formation-of-objects").value == "stack") {
      createStack(DEFAULT_PYRAMID_SIZE, DEFAULT_PYRAMID_SIZE);
    } else {
      createPyramid(DEFAULT_PYRAMID_SIZE);
    }
    createStackAndClear = false;
  }
});

Events.on(mouseConstraint, "enddrag", function () {
  mouseUp = true;
  loadingCatapult = false;
  rockPositionWhenFired = {...rock.position};
});

Events.on(mouseConstraint, "startdrag", function () {
  loadingCatapult = true;
});

document.addEventListener("keypress", (e) => { if (e.key == "r") { reloadCommand = true } else if (e.key == "b") { createStackAndClear = true } });

Composite.add(world, mouseConstraint);
render.mouse = mouse;
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});

render.canvas.classList.add("bordered");

function setDensityOfTargets() {
  document.getElementById("density-of-objects-display").innerHTML = document.getElementById("density-of-objects").value + " g/m<sup>2</sup>";
  targetOptions.density = parseInt(document.getElementById("density-of-objects").value) / 1000;
  createStackAndClear = true;
}

setDensityOfTargets()

document.getElementById("density-of-objects").addEventListener("input", setDensityOfTargets);


function setDensityOfRock() {
  document.getElementById("density-of-rock-display").innerHTML = document.getElementById("density-of-rock").value + " g/m<sup>2</sup>";
  rockOptions.density = parseInt(document.getElementById("density-of-rock").value) / 1000;
  if (loaded) {
    Body.setDensity(rock, rockOptions.density);
  } else {
    reloadCommand = true;
  }
}

setDensityOfRock()

document.getElementById("density-of-rock").addEventListener("input", setDensityOfRock);

document.getElementById("reload-rock").addEventListener("click", () => {reloadCommand = true});

document.getElementById("reload-targets").addEventListener("click", () => {createStackAndClear = true});

document.getElementById("formation-of-objects").addEventListener("change", () => {createStackAndClear = true});

$(function() {
        $("#dialog").dialog({
          autoOpen: true,
          modal: true, 
          width: 800,
          height: 600,
          position: { my: "left top", at: "left top", of: render.canvas},
          show: {
            effect: "blind",
            duration: 1000
          },
          hide: {
            effect: "explode",
            duration: 1000
          }, 
        buttons: {
          "Play the game!": function() {
            $(this).dialog("close");
          },
        }
        });
     
        $("#opener").on("click", function() {
          $("#dialog").dialog("open");
        });
      });