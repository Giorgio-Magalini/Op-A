function Ball(x, y, r, note, maxVelocity, mass) {
  var options = {
    mass: mass,
    friction: 0,
    restitution: 1,
    note: note,
    maxVelocity: maxVelocity,
    frictionAir: 0,
    frictionStatic: 0,
    inertia: Infinity,
  };
  this.body = Matter.Bodies.circle(x, y, r, options);
  this.maxVelocityX = maxVelocity;
  this.maxVelocityY = maxVelocity;
  this.r = r;
  this.x = x;
  this.y = y;
  
  Matter.Composite.add(engine.world, this.body);

  this.show = function () {
    var pos = this.body.position;
    push();
    translate(pos.x, pos.y);
    noStroke();
    fill(200, 200, 255);
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(200, 200, 255);
    ellipse(0, 0, r * 2); // r * 2 because the p5 function needs the diameter
    pop();
  };

  this.isOffScreen = function () {
    var pos = this.body.position;
    return pos.y > height + 100;
  };

  this.removeFromWorld = function () {
    Matter.Composite.remove(engine.world, this.body);
  };

  this.checkVelocity = function () {
    var vel = this.body.velocity;
    if (vel.x > this.maxVelocityX) {
      console.log("velocity x too high");
      Matter.Body.setVelocity(this.body, { x: this.maxVelocityX, y: vel.y });
    }
    if (vel.x < -this.maxVelocityX) {
      console.log("velocity -x too high");
      Matter.Body.setVelocity(this.body, { x: -this.maxVelocityX, y: vel.y });
    }
    if (vel.y > this.maxVelocityY) {
      console.log("velocity y too high");
      Matter.Body.setVelocity(this.body, { x: vel.x, y: this.maxVelocityY });
    }
    if (vel.y < -this.maxVelocityY) {
      console.log("velocity -y too high");
      Matter.Body.setVelocity(this.body, { x: vel.x, y: -this.maxVelocityY });
    }
  };

  this.changeKeyModeBall = function(mode, key){
    this.body.note = convertMidiNoteValueToNoteString(quantizeMidi(convertNoteStringToMidiNoteValue(options.note), mode, key));
  }
}