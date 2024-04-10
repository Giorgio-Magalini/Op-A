var engine;
var balls = [];

var apertureDiff = 0;

const ballRadius = 5;
const ballsMaxQuantity = 16;
const ballsMaxVelocity = 10;
const ballMass = 0.1;

const canvas = document.getElementById("canvas_poly");

// Get the rendering context for the canvas (2D)
const ctx = canvas.getContext("2d");

var ledColor = getComputedStyle(document.documentElement).getPropertyValue(
  "--color-leds-screen"
);

// get the font from the css
var font = getComputedStyle(document.documentElement).getPropertyValue(
  "--font"
);

function translateAndScaleGlossHeight(screenId, glossId) {
  var screen = document.querySelector(screenId);
  var screenHeight = screen.offsetHeight;
  var svgGloss = document.getElementById(glossId);
  var svgGlossHeight = svgGloss.getBoundingClientRect().height;
  svgGloss.style.transform =
    "translateY(" + (screenHeight / svgGlossHeight - 1) + ")";
  svgGloss.style.transform = "scaleY(" + screenHeight / svgGlossHeight + ")";
  document.addEventListener("DOMContentLoaded", function () {
    // transform gloss.svg to fit the screen
    svgGloss.style.transform =
      "translateY(" + (screenHeight / svgGlossHeight - 1) + ")";
    svgGloss.style.transform = "scaleY(" + screenHeight / svgGlossHeight + ")";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  translateAndScaleGlossHeight("#matterScreen", "glossMatter");
  translateAndScaleGlossHeight("#modeScreen", "glossMode");
  translateAndScaleGlossHeight("#keyScreen", "glossKey");
});

// get window width and height from css .screen object
var screen = document.querySelector("#matterScreen");
var screenWidth = screen.offsetWidth;
var screenHeight = screen.offsetHeight;

gradient = ctx.createLinearGradient(
  0,
  0,
  screenWidth * 0.9,
  screenHeight * 0.9
);

gradient.addColorStop(0, "rgb(0, 25, 40)");
gradient.addColorStop(1, "rgb(0, 40, 25)");

var cellSize = screenWidth / 127;

var ledSize = cellSize * 0.6;

function setup() {
  createCanvas(screenWidth, screenHeight, canvas);
  engine = Matter.Engine.create();
  world = engine.world;
  Matter.Runner.run(engine);

  exagon = new Polygon(
    6,
    width / 2,
    height / 2,
    130,
    8,
    opAmodel.tombola.aperture.value
  );

  collisionHandler();
}

document.addEventListener("newBall", (event) => {
  generateBallFromMidiNote(event.detail.note);
});

function collisionHandler() {
  Matter.Events.on(engine, "collisionStart", (event) => {
    var bodyA = event.pairs[0].bodyA;
    var bodyB = event.pairs[0].bodyB;

    // if a body id is between 1 and 6 it's a ball
    if ((bodyA.id >= 1 && bodyA.id <= 6) || (bodyB.id >= 1 && bodyB.id <= 6)) {
      if (bodyA.id <= 6) {
        ball = bodyB;
      } else {
        ball = bodyA;
      }

      velocity = getMidiVelocity(ball);

      if (velocity > 0) {
        customEvent = new CustomEvent("collision", {
          detail: { note: ball.note, velocity: velocity },
        });
        document.dispatchEvent(customEvent);
      }
    }
  });
}

function getMidiVelocity(ball, maxVelocity = ball.maxVelocity) {
  var absVel =
    ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y;
  // get the velocity from a range of 0 maxVelocity^2 into a range from 0 to 127
  var MidiVelocity = map(absVel, 0, maxVelocity * maxVelocity, 0, 127);
  return Math.round(MidiVelocity);
}

// function to generate a ball from a midi note
function generateBallFromMidiNote(note, x = width / 2, y = height / 2) {
  // Fifo List Implementation
  if (balls.length >= ballsMaxQuantity) {
    balls[0].removeFromWorld();
    balls.splice(0, 1);
  }

  balls.push(new Ball(x, y, ballRadius, note, ballsMaxVelocity, ballMass));
}

// // function to generate a random position in a circle
// function randomPositionInCircle(r) {
//   let x = random(-r, r);
//   let y = random(-r, r);
//   while (x * x + y * y > r * r) {
//     x = random(-r, r);
//     y = random(-r, r);
//   }
//   return [x + width / 2, y + height / 2];
// }

// function checkBallsPosition(x, y) {
//   for (let i = 0; i < balls.length; i++) {
//     if (ball[i].x + 2 * ball[i].r > x && ball[i].x - 2 * ball[i].r < x && ball[i].y + 2 * ball[i].r > y && ball[i].y - 2 * ball[i].r < y) {
//       return true;
//     }
//   }
//   return false;
// }

function draw() {
  background(0);

  ctx.fillStyle = gradient;

  drawRoundedRectangle(ctx, 0, 0, width, height, 10);

  engine.world.gravity.y = opAmodel.tombola.gravity.value;

  Matter.Engine.update(engine);

  exagon.show();
  exagon.rotate(opAmodel.tombola.rotation_speed.value);

  // draw all the balls present in the array
  for (let i = 0; i < balls.length; i++) {
    balls[i].checkVelocity(); // check if the velocity is too high
    balls[i].show();
    // remove the ball from the array and from the world if it's off screen
    if (balls[i].isOffScreen()) {
      balls[i].removeFromWorld();
      balls.splice(i, 1);
      i--;
    }
  }

  if (apertureDiff != opAmodel.tombola.aperture.value) {
    exagon.open(opAmodel.tombola.aperture.value - apertureDiff);
    apertureDiff = opAmodel.tombola.aperture.value;
  }

  // to check if the balls get removed from the world
  // console.log(balls.length + " " + world.bodies.length);

  var text = "";

  if (octaveTranspose > 0) {
    text = "Oct: +" + octaveTranspose;
  } else {
    text = "Oct: " + octaveTranspose;
  }

  // Fill the text on the canvas
  ctx.fillStyle = ledColor;
  ctx.shadowColor = ledColor;
  ctx.shadowBlur = 30;
  ctx.font = "Bold 45px " + font;
  ctx.fillText(text, 10, height - 10);

  // reset the shadow
  ctx.shadowBlur = 0;
  ctx.fillStyle = "black";

  for (var x = 0; x < canvas.width; x += cellSize) {
    ctx.fillRect(0, x, width, cellSize - ledSize);
    ctx.fillRect(x, 0, cellSize - ledSize, height);
  }
}

function changeKeyModeBalls(mode, key) {
  for (let i = 0; i < balls.length; i++) {
    balls[i].changeKeyModeBall(mode, key);
  }
}

function drawRoundedRectangle(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
