
/*
Copyright 2013 Sub Protocol and other contributors
http://subprotocol.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Particle, VerletJS;

Particle = function(pos) {
  pos = (new Vec2()).mutableSet(pos);
  return lastPos = (new Vec2()).mutableSet(pos);
};

window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
  return window.setTimeout(callback, 1000 / 60);
};

Particle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "#2dad8f";
  return ctx.fill();
};

VerletJS = function(width, height, canvas) {
  var _this;
  width = width;
  height = height;
  canvas = canvas;
  ctx = canvas.getContext("2d");
  mouse = new Vec2(0, 0);
  mouseDown = false;
  draggedEntity = null;
  selectionRadius = 20;
  highlightColor = "#4f545c";
  bounds = function(particle) {
    if (particle.pos.y > height - 1) {
      particle.pos.y = height - 1;
    }
    if (particle.pos.x < 0) {
      particle.pos.x = 0;
    }
    if (particle.pos.x > width - 1) {
      return particle.pos.x = width - 1;
    }
  };
  _this = this;
  canvas.oncontextmenu = function(e) {
    return e.preventDefault();
  };
  canvas.onmousedown = function(e) {
    var nearest;
    _mouseDown = true;
    nearest = _nearestEntity();
    if (nearest) {
      return _draggedEntity = nearest;
    }
  };
  canvas.onmouseup = function(e) {
    _mouseDown = false;
    return _draggedEntity = null;
  };
  canvas.onmousemove = function(e) {
    var rect;
    rect = _canvas.getBoundingClientRect();
    _mouse.x = e.clientX - rect.left;
    return _mouse.y = e.clientY - rect.top;
  };
  gravity = new Vec2(0, 0.2);
  friction = 0.99;
  groundFriction = 0.8;
  return composites = [];
};

VerletJS.prototype.Composite = function() {
  particles = [];
  constraints = [];
  drawParticles = null;
  return drawConstraints = null;
};

VerletJS.prototype.Composite.prototype.pin = function(index, pos) {
  var pc;
  pos = pos || particles[index].pos;
  pc = new PinConstraint(particles[index], pos);
  constraints.push(pc);
  return pc;
};

VerletJS.prototype.frame = function(step) {
  var c, constraints, i, j, m, particles, stepCoef, velocity, _results;
  i = void 0;
  j = void 0;
  c = void 0;
  for (c in composites) {
    for (i in composites[c].particles) {
      particles = composites[c].particles;
      velocity = particles[i].pos.sub(particles[i].lastPos).scale(friction);
      if (particles[i].pos.y >= height - 1 && velocity.length2() > 0.000001) {
        m = velocity.length();
        velocity.x /= m;
        velocity.y /= m;
        velocity.mutableScale(m * groundFriction);
      }
      particles[i].lastPos.mutableSet(particles[i].pos);
      particles[i].pos.mutableAdd(gravity);
      particles[i].pos.mutableAdd(velocity);
    }
  }
  if (draggedEntity) {
    draggedEntity.pos.mutableSet(mouse);
  }
  stepCoef = 1 / step;
  for (c in composites) {
    constraints = composites[c].constraints;
    i = 0;
    while (i < step) {
      for (j in constraints) {
        constraints[j].relax(stepCoef);
      }
      ++i;
    }
  }
  _results = [];
  for (c in composites) {
    particles = composites[c].particles;
    _results.push((function() {
      var _results1;
      _results1 = [];
      for (i in particles) {
        _results1.push(bounds(particles[i]));
      }
      return _results1;
    }).call(this));
  }
  return _results;
};

VerletJS.prototype.draw = function() {
  var c, constraints, i, nearest, particles;
  i = void 0;
  c = void 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (c in composites) {
    if (composites[c].drawConstraints) {
      composites[c].drawConstraints(ctx, composites[c]);
    } else {
      constraints = composites[c].constraints;
      for (i in constraints) {
        constraints[i].draw(ctx);
      }
    }
    if (composites[c].drawParticles) {
      composites[c].drawParticles(ctx, composites[c]);
    } else {
      particles = composites[c].particles;
      for (i in particles) {
        particles[i].draw(ctx);
      }
    }
  }
  nearest = draggedEntity || nearestEntity();
  if (nearest) {
    ctx.beginPath();
    ctx.arc(nearest.pos.x, nearest.pos.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = highlightColor;
    return ctx.stroke();
  }
};

VerletJS.prototype.nearestEntity = function() {
  var c, constraintsNearest, d2, d2Nearest, entity, i, particles;
  c = void 0;
  i = void 0;
  d2Nearest = 0;
  entity = null;
  constraintsNearest = null;
  for (c in composites) {
    particles = composites[c].particles;
    for (i in particles) {
      d2 = particles[i].pos.dist2(mouse);
      if (d2 <= selectionRadius * selectionRadius && (!(entity != null) || d2 < d2Nearest)) {
        entity = particles[i];
        constraintsNearest = composites[c].constraints;
        d2Nearest = d2;
      }
    }
  }
  for (i in constraintsNearest) {
    if (constraintsNearest[i] instanceof PinConstraint && constraintsNearest[i].a === entity) {
      entity = constraintsNearest[i];
    }
  }
  return entity;
};