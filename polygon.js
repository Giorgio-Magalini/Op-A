function Polygon(num_sides, x, y, radius, thickness, opening_factor) {
  // empty arrays to fill with N rectangles (one per side of the polygon)
  let rects_render = [];
  let rects_physic = [];
  for (let i = 0; i < num_sides; i++) {
    tmp_rect = new Boundary(
      x + radius * Math.cos((i * 2 * Math.PI) / num_sides),
      y + radius * Math.sin((i * 2 * Math.PI) / num_sides),
      2 * (radius + thickness / 2) * Math.tan(Math.PI / num_sides),
      thickness,
      Math.PI / 2 + i * (Math.PI - (Math.PI * (num_sides - 2)) / num_sides) + opening_factor * Math.PI
    );
    // filling the array with all the N rectangles
    // for physic
    rects_physic.push(tmp_rect.body);
    // for render
    rects_render.push(tmp_rect);
  }

  // the 2 arrays differs because the physic one is made of Matter.js Bodies while the other one is made of Boundary objects
  // console.log(rects_physic);
  // console.log(rects_render);

  var options = {
    parts: rects_physic,
    isStatic: true,
    restitution: 1,
    friction: 0,
    frictionsStatic: 0,
  };
  this.body = Matter.Body.create(options);

  Matter.Composite.add(engine.world, this.body);

  this.show = function () {
    for (let i = 0; i < rects_render.length; i++) {
      rects_render[i].show();
    }
  };

  this.rotate = function (rotation_factor) {
    Matter.Body.rotate(this.body, (Math.PI / 6) * rotation_factor);
  };

  this.open = function (opening_factor) {
    for (let i = 0; i < rects_render.length; i++) {
      rects_render[i].rotate(opening_factor * Math.PI);
      this.angle += opening_factor * Math.PI;
    }
  }

}
