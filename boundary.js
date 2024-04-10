function Boundary(x, y, w, h, a) {
    var options = {
        isStatic: true,
        angle: a,
        restitution: 1,
        friction: 0,
    }
    this.body = Matter.Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;

    this.show = function() {
        var pos = this.body.position;
        var angle = this.body.angle;
        push();
        noStroke();
        fill(200, 200, 255);
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = color(200, 200, 255);
        translate(pos.x, pos.y);
        rotate(angle);
        rotate
        rectMode(CENTER);
        rect(0, 0, this.w, this.h);
        pop();
    }

    this.rotate = function(angle) {
        Matter.Body.rotate(this.body, angle);
    }
}