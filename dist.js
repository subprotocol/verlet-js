;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

//this exports all the verlet methods globally, so that the demos work.

var VerletJS = require('./verlet')
var constraint = require('./constraint')
                 require('./objects') //patches VerletJS.prototype (bad)
window.Vec2 = require('./vec2')
window.VerletJS = VerletJS

window.Particle = VerletJS.Particle

window.DistanceConstraint = constraint.DistanceConstraint
window.PinConstraint      = constraint.PinConstraint
window.AngleConstraint    = constraint.AngleConstraint



},{"./verlet":2,"./constraint":3,"./objects":4,"./vec2":5}],3:[function(require,module,exports){

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

// DistanceConstraint -- constrains to initial distance
// PinConstraint -- constrains to static/fixed point
// AngleConstraint -- constrains 3 particles to an angle

exports.DistanceConstraint = DistanceConstraint
exports.PinConstraint = PinConstraint
exports.AngleConstraint = AngleConstraint

function DistanceConstraint(a, b, stiffness, distance /*optional*/) {
  this.a = a;
  this.b = b;
  this.distance = typeof distance != "undefined" ? distance : a.pos.sub(b.pos).length();
  this.stiffness = stiffness;
}

DistanceConstraint.prototype.relax = function(stepCoef) {
  var normal = this.a.pos.sub(this.b.pos);
  var m = normal.length2();
  normal.mutableScale(((this.distance*this.distance - m)/m)*this.stiffness*stepCoef);
  this.a.pos.mutableAdd(normal);
  this.b.pos.mutableSub(normal);
}

DistanceConstraint.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(this.a.pos.x, this.a.pos.y);
  ctx.lineTo(this.b.pos.x, this.b.pos.y);
  ctx.strokeStyle = "#d8dde2";
  ctx.stroke();
}



function PinConstraint(a, pos) {
  this.a = a;
  this.pos = (new Vec2()).mutableSet(pos);
}

PinConstraint.prototype.relax = function(stepCoef) {
  this.a.pos.mutableSet(this.pos);
}

PinConstraint.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 6, 0, 2*Math.PI);
  ctx.fillStyle = "rgba(0,153,255,0.1)";
  ctx.fill();
}


function AngleConstraint(a, b, c, stiffness) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.angle = this.b.pos.angle2(this.a.pos, this.c.pos);
  this.stiffness = stiffness;
}

AngleConstraint.prototype.relax = function(stepCoef) {
  var angle = this.b.pos.angle2(this.a.pos, this.c.pos);
  var diff = angle - this.angle;
  
  if (diff <= -Math.PI)
    diff += 2*Math.PI;
  else if (diff >= Math.PI)
    diff -= 2*Math.PI;

  diff *= stepCoef*this.stiffness;
  
  this.a.pos = this.a.pos.rotate(this.b.pos, diff);
  this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
  this.b.pos = this.b.pos.rotate(this.a.pos, diff);
  this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
}

AngleConstraint.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(this.a.pos.x, this.a.pos.y);
  ctx.lineTo(this.b.pos.x, this.b.pos.y);
  ctx.lineTo(this.c.pos.x, this.c.pos.y);
  var tmp = ctx.lineWidth;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,0,0.2)";
  ctx.stroke();
  ctx.lineWidth = tmp;
}

},{}],5:[function(require,module,exports){

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

// A simple 2-dimensional vector implementation

module.exports = Vec2

function Vec2(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vec2.prototype.add = function(v) {
  return new Vec2(this.x + v.x, this.y + v.y);
}

Vec2.prototype.sub = function(v) {
  return new Vec2(this.x - v.x, this.y - v.y);
}

Vec2.prototype.mul = function(v) {
  return new Vec2(this.x * v.x, this.y * v.y);
}

Vec2.prototype.div = function(v) {
  return new Vec2(this.x / v.x, this.y / v.y);
}

Vec2.prototype.scale = function(coef) {
  return new Vec2(this.x*coef, this.y*coef);
}

Vec2.prototype.mutableSet = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
}

Vec2.prototype.mutableAdd = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
}

Vec2.prototype.mutableSub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
}

Vec2.prototype.mutableMul = function(v) {
  this.x *= v.x;
  this.y *= v.y;
  return this;
}

Vec2.prototype.mutableDiv = function(v) {
  this.x /= v.x;
  this.y /= v.y;
  return this;
}

Vec2.prototype.mutableScale = function(coef) {
  this.x *= coef;
  this.y *= coef;
  return this;
}

Vec2.prototype.equals = function(v) {
  return this.x == v.x && this.y == v.y;
}

Vec2.prototype.epsilonEquals = function(v, epsilon) {
  return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
}

Vec2.prototype.length = function(v) {
  return Math.sqrt(this.x*this.x + this.y*this.y);
}

Vec2.prototype.length2 = function(v) {
  return this.x*this.x + this.y*this.y;
}

Vec2.prototype.dist = function(v) {
  return Math.sqrt(this.dist2(v));
}

Vec2.prototype.dist2 = function(v) {
  var x = v.x - this.x;
  var y = v.y - this.y;
  return x*x + y*y;
}

Vec2.prototype.normal = function() {
  var m = Math.sqrt(this.x*this.x + this.y*this.y);
  return new Vec2(this.x/m, this.y/m);
}

Vec2.prototype.dot = function(v) {
  return this.x*v.x + this.y*v.y;
}

Vec2.prototype.angle = function(v) {
  return Math.atan2(this.x*v.y-this.y*v.x,this.x*v.x+this.y*v.y);
}

Vec2.prototype.angle2 = function(vLeft, vRight) {
  return vLeft.sub(this).angle(vRight.sub(this));
}

Vec2.prototype.rotate = function(origin, theta) {
  var x = this.x - origin.x;
  var y = this.y - origin.y;
  return new Vec2(x*Math.cos(theta) - y*Math.sin(theta) + origin.x, x*Math.sin(theta) + y*Math.cos(theta) + origin.y);
}

Vec2.prototype.toString = function() {
  return "(" + this.x + ", " + this.y + ")";
}

function test_Vec2() {
  var assert = function(label, expression) {
    console.log("Vec2(" + label + "): " + (expression == true ? "PASS" : "FAIL"));
    if (expression != true)
      throw "assertion failed";
  };
  
  assert("equality", (new Vec2(5,3).equals(new Vec2(5,3))));
  assert("epsilon equality", (new Vec2(1,2).epsilonEquals(new Vec2(1.01,2.02), 0.03)));
  assert("epsilon non-equality", !(new Vec2(1,2).epsilonEquals(new Vec2(1.01,2.02), 0.01)));
  assert("addition", (new Vec2(1,1)).add(new Vec2(2, 3)).equals(new Vec2(3, 4)));
  assert("subtraction", (new Vec2(4,3)).sub(new Vec2(2, 1)).equals(new Vec2(2, 2)));
  assert("multiply", (new Vec2(2,4)).mul(new Vec2(2, 1)).equals(new Vec2(4, 4)));
  assert("divide", (new Vec2(4,2)).div(new Vec2(2, 2)).equals(new Vec2(2, 1)));
  assert("scale", (new Vec2(4,3)).scale(2).equals(new Vec2(8, 6)));
  assert("mutable set", (new Vec2(1,1)).mutableSet(new Vec2(2, 3)).equals(new Vec2(2, 3)));
  assert("mutable addition", (new Vec2(1,1)).mutableAdd(new Vec2(2, 3)).equals(new Vec2(3, 4)));
  assert("mutable subtraction", (new Vec2(4,3)).mutableSub(new Vec2(2, 1)).equals(new Vec2(2, 2)));
  assert("mutable multiply", (new Vec2(2,4)).mutableMul(new Vec2(2, 1)).equals(new Vec2(4, 4)));
  assert("mutable divide", (new Vec2(4,2)).mutableDiv(new Vec2(2, 2)).equals(new Vec2(2, 1)));
  assert("mutable scale", (new Vec2(4,3)).mutableScale(2).equals(new Vec2(8, 6)));
  assert("length", Math.abs((new Vec2(4,4)).length() - 5.65685) <= 0.00001);
  assert("length2", (new Vec2(2,4)).length2() == 20);
  assert("dist", Math.abs((new Vec2(2,4)).dist(new Vec2(3,5)) - 1.4142135) <= 0.000001);
  assert("dist2", (new Vec2(2,4)).dist2(new Vec2(3,5)) == 2);

  var normal = (new Vec2(2,4)).normal()
  assert("normal", Math.abs(normal.length() - 1.0) <= 0.00001 && normal.epsilonEquals(new Vec2(0.4472, 0.89443), 0.0001));
  assert("dot", (new Vec2(2,3)).dot(new Vec2(4,1)) == 11);
  assert("angle", (new Vec2(0,-1)).angle(new Vec2(1,0))*(180/Math.PI) == 90);
  assert("angle2", (new Vec2(1,1)).angle2(new Vec2(1,0), new Vec2(2,1))*(180/Math.PI) == 90);
  assert("rotate", (new Vec2(2,0)).rotate(new Vec2(1,0), Math.PI/2).equals(new Vec2(1,1)));
  assert("toString", (new Vec2(2,4)) == "(2, 4)");
}


},{}],2:[function(require,module,exports){

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

window.requestAnimFrame = window.requestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.oRequestAnimationFrame
|| window.msRequestAnimationFrame
|| function(callback) {
  window.setTimeout(callback, 1000 / 60);
};

var Vec2 = require('./vec2')

exports = module.exports = VerletJS
exports.Particle = Particle
exports.Composite = Composite

function Particle(pos) {
  this.pos = (new Vec2()).mutableSet(pos);
  this.lastPos = (new Vec2()).mutableSet(pos);
}

Particle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 2, 0, 2*Math.PI);
  ctx.fillStyle = "#2dad8f";
  ctx.fill();
}

function VerletJS(width, height, canvas) {
  this.width = width;
  this.height = height;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.mouse = new Vec2(0,0);
  this.mouseDown = false;
  this.draggedEntity = null;
  this.selectionRadius = 20;
  this.highlightColor = "#4f545c";
  
  this.bounds = function (particle) {
    if (particle.pos.y > this.height-1)
      particle.pos.y = this.height-1;
    
    if (particle.pos.x < 0)
      particle.pos.x = 0;

    if (particle.pos.x > this.width-1)
      particle.pos.x = this.width-1;
  }
  
  var _this = this;
  
  // prevent context menu
  this.canvas.oncontextmenu = function(e) {
    e.preventDefault();
  };
  
  this.canvas.onmousedown = function(e) {
    _this.mouseDown = true;
    var nearest = _this.nearestEntity();
    if (nearest) {
      _this.draggedEntity = nearest;
    }
  };
  
  this.canvas.onmouseup = function(e) {
    _this.mouseDown = false;
    _this.draggedEntity = null;
  };
  
  this.canvas.onmousemove = function(e) {
    var rect = _this.canvas.getBoundingClientRect();
    _this.mouse.x = e.clientX - rect.left;
    _this.mouse.y = e.clientY - rect.top;
  };  
  
  // simulation params
  this.gravity = new Vec2(0,0.01);
  this.friction = 0.99;
  this.groundFriction = 0.8;
  
  // holds composite entities
  this.composites = [];
}

VerletJS.prototype.Composite = Composite

function Composite() {
  this.particles = [];
  this.constraints = [];
  
  this.drawParticles = null;
  this.drawConstraints = null;
}

Composite.prototype.pin = function(index, pos) {
  pos = pos || this.particles[index].pos;
  var pc = new PinConstraint(this.particles[index], pos);
  this.constraints.push(pc);
  return pc;
}

VerletJS.prototype.frame = function(step) {
  var i, j, c;

  for (c in this.composites) {
    for (i in this.composites[c].particles) {
      var particles = this.composites[c].particles;
      
      // calculate velocity
      var velocity = particles[i].pos.sub(particles[i].lastPos).scale(this.friction);
    
      // ground friction
      if (particles[i].pos.y >= this.height-1 && velocity.length2() > 0.000001) {
        var m = velocity.length();
        velocity.x /= m;
        velocity.y /= m;
        velocity.mutableScale(m*this.groundFriction);
      }
    
      // save last good state
      particles[i].lastPos.mutableSet(particles[i].pos);
    
      // gravity
      particles[i].pos.mutableAdd(this.gravity);
    
      // inertia  
      particles[i].pos.mutableAdd(velocity);
    }
  }
  
  // handle dragging of entities
  if (this.draggedEntity)
    this.draggedEntity.pos.mutableSet(this.mouse);
    
  // relax
  var stepCoef = 1/step;
  for (c in this.composites) {
    var constraints = this.composites[c].constraints;
    for (i=0;i<step;++i)
      for (j in constraints)
        constraints[j].relax(stepCoef);
  }
  
  // bounds checking
  for (c in this.composites) {
    var particles = this.composites[c].particles;
    for (i in particles)
      this.bounds(particles[i]);
  }
}

VerletJS.prototype.draw = function() {
  var i, c;
  
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  
  
  for (c in this.composites) {
    // draw constraints
    if (this.composites[c].drawConstraints) {
      this.composites[c].drawConstraints(this.ctx, this.composites[c]);
    } else {
      var constraints = this.composites[c].constraints;
      for (i in constraints)
        constraints[i].draw(this.ctx);
    }
    
    // draw particles
    if (this.composites[c].drawParticles) {
      this.composites[c].drawParticles(this.ctx, this.composites[c]);
    } else {
      var particles = this.composites[c].particles;
      for (i in particles)
        particles[i].draw(this.ctx);
    }
  }

  // highlight nearest / dragged entity
  var nearest = this.draggedEntity || this.nearestEntity();
  if (nearest) {
    this.ctx.beginPath();
    this.ctx.arc(nearest.pos.x, nearest.pos.y, 8, 0, 2*Math.PI);
    this.ctx.strokeStyle = this.highlightColor;
    this.ctx.stroke();
  }
}

VerletJS.prototype.nearestEntity = function() {
  var c, i;
  var d2Nearest = 0;
  var entity = null;
  var constraintsNearest = null;
  
  // find nearest point
  for (c in this.composites) {
    var particles = this.composites[c].particles;
    for (i in particles) {
      var d2 = particles[i].pos.dist2(this.mouse);
      if (d2 <= this.selectionRadius*this.selectionRadius && (entity == null || d2 < d2Nearest)) {
        entity = particles[i];
        constraintsNearest = this.composites[c].constraints;
        d2Nearest = d2;
      }
    }
  }
  
  // search for pinned constraints for this entity
  for (i in constraintsNearest)
    if (constraintsNearest[i] instanceof PinConstraint && constraintsNearest[i].a == entity)
      entity = constraintsNearest[i];
  
  return entity;
}


},{"./vec2":5}],4:[function(require,module,exports){

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

// generic verlet entities

var VerletJS = require('./verlet')
var Particle = VerletJS.Particle
var constraints = require('./constraint')
var DistanceConstraint = constraints.DistanceConstraint

VerletJS.prototype.point = function(pos) {
  var composite = new this.Composite();
  composite.particles.push(new Particle(pos));
  this.composites.push(composite);
  return composite;
}

VerletJS.prototype.lineSegments = function(vertices, stiffness) {
  var i;
  
  var composite = new this.Composite();
  
  for (i in vertices) {
    composite.particles.push(new Particle(vertices[i]));
    if (i > 0)
      composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[i-1], stiffness));
  }
  
  this.composites.push(composite);
  return composite;
}

VerletJS.prototype.cloth = function(origin, width, height, segments, pinMod, stiffness) {
  
  var composite = new this.Composite();
  
  var xStride = width/segments;
  var yStride = height/segments;
  
  var x,y;
  for (y=0;y<segments;++y) {
    for (x=0;x<segments;++x) {
      var px = origin.x + x*xStride - width/2 + xStride/2;
      var py = origin.y + y*yStride - height/2 + yStride/2;
      composite.particles.push(new Particle(new Vec2(px, py)));
      
      if (x > 0)
        composite.constraints.push(new DistanceConstraint(composite.particles[y*segments+x], composite.particles[y*segments+x-1], stiffness));
      
      if (y > 0)
        composite.constraints.push(new DistanceConstraint(composite.particles[y*segments+x], composite.particles[(y-1)*segments+x], stiffness));
    }
  }
  
  for (x=0;x<segments;++x) {
    if (x%pinMod == 0)
    composite.pin(x);
  }
  
  this.composites.push(composite);
  return composite;
}

VerletJS.prototype.tire = function(origin, radius, segments, spokeStiffness, treadStiffness) {
  var stride = (2*Math.PI)/segments;
  var i;
  
  var composite = new this.Composite();
  
  // particles
  for (i=0;i<segments;++i) {
    var theta = i*stride;
    composite.particles.push(new Particle(new Vec2(origin.x + Math.cos(theta)*radius, origin.y + Math.sin(theta)*radius)));
  }
  
  var center = new Particle(origin);
  composite.particles.push(center);
  
  // constraints
  for (i=0;i<segments;++i) {
    composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[(i+1)%segments], treadStiffness));
    composite.constraints.push(new DistanceConstraint(composite.particles[i], center, spokeStiffness))
    composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[(i+5)%segments], treadStiffness));
  }
    
  this.composites.push(composite);
  return composite;
}


},{"./verlet":2,"./constraint":3}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL2Rpc3QuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL2NvbnN0cmFpbnQuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL3ZlYzIuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL3ZlcmxldC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlcmxldC1qcy9saWIvb2JqZWN0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiXG4vL3RoaXMgZXhwb3J0cyBhbGwgdGhlIHZlcmxldCBtZXRob2RzIGdsb2JhbGx5LCBzbyB0aGF0IHRoZSBkZW1vcyB3b3JrLlxuXG52YXIgVmVybGV0SlMgPSByZXF1aXJlKCcuL3ZlcmxldCcpXG52YXIgY29uc3RyYWludCA9IHJlcXVpcmUoJy4vY29uc3RyYWludCcpXG4gICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vb2JqZWN0cycpIC8vcGF0Y2hlcyBWZXJsZXRKUy5wcm90b3R5cGUgKGJhZClcbndpbmRvdy5WZWMyID0gcmVxdWlyZSgnLi92ZWMyJylcbndpbmRvdy5WZXJsZXRKUyA9IFZlcmxldEpTXG5cbndpbmRvdy5QYXJ0aWNsZSA9IFZlcmxldEpTLlBhcnRpY2xlXG5cbndpbmRvdy5EaXN0YW5jZUNvbnN0cmFpbnQgPSBjb25zdHJhaW50LkRpc3RhbmNlQ29uc3RyYWludFxud2luZG93LlBpbkNvbnN0cmFpbnQgICAgICA9IGNvbnN0cmFpbnQuUGluQ29uc3RyYWludFxud2luZG93LkFuZ2xlQ29uc3RyYWludCAgICA9IGNvbnN0cmFpbnQuQW5nbGVDb25zdHJhaW50XG5cblxuIiwiXG4vKlxuQ29weXJpZ2h0IDIwMTMgU3ViIFByb3RvY29sIGFuZCBvdGhlciBjb250cmlidXRvcnNcbmh0dHA6Ly9zdWJwcm90b2NvbC5jb20vXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbkxJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbk9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG4vLyBEaXN0YW5jZUNvbnN0cmFpbnQgLS0gY29uc3RyYWlucyB0byBpbml0aWFsIGRpc3RhbmNlXG4vLyBQaW5Db25zdHJhaW50IC0tIGNvbnN0cmFpbnMgdG8gc3RhdGljL2ZpeGVkIHBvaW50XG4vLyBBbmdsZUNvbnN0cmFpbnQgLS0gY29uc3RyYWlucyAzIHBhcnRpY2xlcyB0byBhbiBhbmdsZVxuXG5leHBvcnRzLkRpc3RhbmNlQ29uc3RyYWludCA9IERpc3RhbmNlQ29uc3RyYWludFxuZXhwb3J0cy5QaW5Db25zdHJhaW50ID0gUGluQ29uc3RyYWludFxuZXhwb3J0cy5BbmdsZUNvbnN0cmFpbnQgPSBBbmdsZUNvbnN0cmFpbnRcblxuZnVuY3Rpb24gRGlzdGFuY2VDb25zdHJhaW50KGEsIGIsIHN0aWZmbmVzcywgZGlzdGFuY2UgLypvcHRpb25hbCovKSB7XG4gIHRoaXMuYSA9IGE7XG4gIHRoaXMuYiA9IGI7XG4gIHRoaXMuZGlzdGFuY2UgPSB0eXBlb2YgZGlzdGFuY2UgIT0gXCJ1bmRlZmluZWRcIiA/IGRpc3RhbmNlIDogYS5wb3Muc3ViKGIucG9zKS5sZW5ndGgoKTtcbiAgdGhpcy5zdGlmZm5lc3MgPSBzdGlmZm5lc3M7XG59XG5cbkRpc3RhbmNlQ29uc3RyYWludC5wcm90b3R5cGUucmVsYXggPSBmdW5jdGlvbihzdGVwQ29lZikge1xuICB2YXIgbm9ybWFsID0gdGhpcy5hLnBvcy5zdWIodGhpcy5iLnBvcyk7XG4gIHZhciBtID0gbm9ybWFsLmxlbmd0aDIoKTtcbiAgbm9ybWFsLm11dGFibGVTY2FsZSgoKHRoaXMuZGlzdGFuY2UqdGhpcy5kaXN0YW5jZSAtIG0pL20pKnRoaXMuc3RpZmZuZXNzKnN0ZXBDb2VmKTtcbiAgdGhpcy5hLnBvcy5tdXRhYmxlQWRkKG5vcm1hbCk7XG4gIHRoaXMuYi5wb3MubXV0YWJsZVN1Yihub3JtYWwpO1xufVxuXG5EaXN0YW5jZUNvbnN0cmFpbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKHRoaXMuYS5wb3MueCwgdGhpcy5hLnBvcy55KTtcbiAgY3R4LmxpbmVUbyh0aGlzLmIucG9zLngsIHRoaXMuYi5wb3MueSk7XG4gIGN0eC5zdHJva2VTdHlsZSA9IFwiI2Q4ZGRlMlwiO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cblxuXG5mdW5jdGlvbiBQaW5Db25zdHJhaW50KGEsIHBvcykge1xuICB0aGlzLmEgPSBhO1xuICB0aGlzLnBvcyA9IChuZXcgVmVjMigpKS5tdXRhYmxlU2V0KHBvcyk7XG59XG5cblBpbkNvbnN0cmFpbnQucHJvdG90eXBlLnJlbGF4ID0gZnVuY3Rpb24oc3RlcENvZWYpIHtcbiAgdGhpcy5hLnBvcy5tdXRhYmxlU2V0KHRoaXMucG9zKTtcbn1cblxuUGluQ29uc3RyYWludC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5hcmModGhpcy5wb3MueCwgdGhpcy5wb3MueSwgNiwgMCwgMipNYXRoLlBJKTtcbiAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDE1MywyNTUsMC4xKVwiO1xuICBjdHguZmlsbCgpO1xufVxuXG5cbmZ1bmN0aW9uIEFuZ2xlQ29uc3RyYWludChhLCBiLCBjLCBzdGlmZm5lc3MpIHtcbiAgdGhpcy5hID0gYTtcbiAgdGhpcy5iID0gYjtcbiAgdGhpcy5jID0gYztcbiAgdGhpcy5hbmdsZSA9IHRoaXMuYi5wb3MuYW5nbGUyKHRoaXMuYS5wb3MsIHRoaXMuYy5wb3MpO1xuICB0aGlzLnN0aWZmbmVzcyA9IHN0aWZmbmVzcztcbn1cblxuQW5nbGVDb25zdHJhaW50LnByb3RvdHlwZS5yZWxheCA9IGZ1bmN0aW9uKHN0ZXBDb2VmKSB7XG4gIHZhciBhbmdsZSA9IHRoaXMuYi5wb3MuYW5nbGUyKHRoaXMuYS5wb3MsIHRoaXMuYy5wb3MpO1xuICB2YXIgZGlmZiA9IGFuZ2xlIC0gdGhpcy5hbmdsZTtcbiAgXG4gIGlmIChkaWZmIDw9IC1NYXRoLlBJKVxuICAgIGRpZmYgKz0gMipNYXRoLlBJO1xuICBlbHNlIGlmIChkaWZmID49IE1hdGguUEkpXG4gICAgZGlmZiAtPSAyKk1hdGguUEk7XG5cbiAgZGlmZiAqPSBzdGVwQ29lZip0aGlzLnN0aWZmbmVzcztcbiAgXG4gIHRoaXMuYS5wb3MgPSB0aGlzLmEucG9zLnJvdGF0ZSh0aGlzLmIucG9zLCBkaWZmKTtcbiAgdGhpcy5jLnBvcyA9IHRoaXMuYy5wb3Mucm90YXRlKHRoaXMuYi5wb3MsIC1kaWZmKTtcbiAgdGhpcy5iLnBvcyA9IHRoaXMuYi5wb3Mucm90YXRlKHRoaXMuYS5wb3MsIGRpZmYpO1xuICB0aGlzLmIucG9zID0gdGhpcy5iLnBvcy5yb3RhdGUodGhpcy5jLnBvcywgLWRpZmYpO1xufVxuXG5BbmdsZUNvbnN0cmFpbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKHRoaXMuYS5wb3MueCwgdGhpcy5hLnBvcy55KTtcbiAgY3R4LmxpbmVUbyh0aGlzLmIucG9zLngsIHRoaXMuYi5wb3MueSk7XG4gIGN0eC5saW5lVG8odGhpcy5jLnBvcy54LCB0aGlzLmMucG9zLnkpO1xuICB2YXIgdG1wID0gY3R4LmxpbmVXaWR0aDtcbiAgY3R4LmxpbmVXaWR0aCA9IDU7XG4gIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgyNTUsMjU1LDAsMC4yKVwiO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5saW5lV2lkdGggPSB0bXA7XG59XG4iLCJcbi8qXG5Db3B5cmlnaHQgMjAxMyBTdWIgUHJvdG9jb2wgYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuaHR0cDovL3N1YnByb3RvY29sLmNvbS9cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG5hIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcblwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xud2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG5wZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbnRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG5XSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbi8vIEEgc2ltcGxlIDItZGltZW5zaW9uYWwgdmVjdG9yIGltcGxlbWVudGF0aW9uXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjMlxuXG5mdW5jdGlvbiBWZWMyKHgsIHkpIHtcbiAgdGhpcy54ID0geCB8fCAwO1xuICB0aGlzLnkgPSB5IHx8IDA7XG59XG5cblZlYzIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55KTtcbn1cblxuVmVjMi5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gbmV3IFZlYzIodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnkpO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbih2KSB7XG4gIHJldHVybiBuZXcgVmVjMih0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSk7XG59XG5cblZlYzIucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCAvIHYueCwgdGhpcy55IC8gdi55KTtcbn1cblxuVmVjMi5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbihjb2VmKSB7XG4gIHJldHVybiBuZXcgVmVjMih0aGlzLngqY29lZiwgdGhpcy55KmNvZWYpO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdXRhYmxlU2V0ID0gZnVuY3Rpb24odikge1xuICB0aGlzLnggPSB2Lng7XG4gIHRoaXMueSA9IHYueTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblZlYzIucHJvdG90eXBlLm11dGFibGVBZGQgPSBmdW5jdGlvbih2KSB7XG4gIHRoaXMueCArPSB2Lng7XG4gIHRoaXMueSArPSB2Lnk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdXRhYmxlU3ViID0gZnVuY3Rpb24odikge1xuICB0aGlzLnggLT0gdi54O1xuICB0aGlzLnkgLT0gdi55O1xuICByZXR1cm4gdGhpcztcbn1cblxuVmVjMi5wcm90b3R5cGUubXV0YWJsZU11bCA9IGZ1bmN0aW9uKHYpIHtcbiAgdGhpcy54ICo9IHYueDtcbiAgdGhpcy55ICo9IHYueTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblZlYzIucHJvdG90eXBlLm11dGFibGVEaXYgPSBmdW5jdGlvbih2KSB7XG4gIHRoaXMueCAvPSB2Lng7XG4gIHRoaXMueSAvPSB2Lnk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdXRhYmxlU2NhbGUgPSBmdW5jdGlvbihjb2VmKSB7XG4gIHRoaXMueCAqPSBjb2VmO1xuICB0aGlzLnkgKj0gY29lZjtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblZlYzIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIHRoaXMueCA9PSB2LnggJiYgdGhpcy55ID09IHYueTtcbn1cblxuVmVjMi5wcm90b3R5cGUuZXBzaWxvbkVxdWFscyA9IGZ1bmN0aW9uKHYsIGVwc2lsb24pIHtcbiAgcmV0dXJuIE1hdGguYWJzKHRoaXMueCAtIHYueCkgPD0gZXBzaWxvbiAmJiBNYXRoLmFicyh0aGlzLnkgLSB2LnkpIDw9IGVwc2lsb247XG59XG5cblZlYzIucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIE1hdGguc3FydCh0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSk7XG59XG5cblZlYzIucHJvdG90eXBlLmxlbmd0aDIgPSBmdW5jdGlvbih2KSB7XG4gIHJldHVybiB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueTtcbn1cblxuVmVjMi5wcm90b3R5cGUuZGlzdCA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3QyKHYpKTtcbn1cblxuVmVjMi5wcm90b3R5cGUuZGlzdDIgPSBmdW5jdGlvbih2KSB7XG4gIHZhciB4ID0gdi54IC0gdGhpcy54O1xuICB2YXIgeSA9IHYueSAtIHRoaXMueTtcbiAgcmV0dXJuIHgqeCArIHkqeTtcbn1cblxuVmVjMi5wcm90b3R5cGUubm9ybWFsID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtID0gTWF0aC5zcXJ0KHRoaXMueCp0aGlzLnggKyB0aGlzLnkqdGhpcy55KTtcbiAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueC9tLCB0aGlzLnkvbSk7XG59XG5cblZlYzIucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIHRoaXMueCp2LnggKyB0aGlzLnkqdi55O1xufVxuXG5WZWMyLnByb3RvdHlwZS5hbmdsZSA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy54KnYueS10aGlzLnkqdi54LHRoaXMueCp2LngrdGhpcy55KnYueSk7XG59XG5cblZlYzIucHJvdG90eXBlLmFuZ2xlMiA9IGZ1bmN0aW9uKHZMZWZ0LCB2UmlnaHQpIHtcbiAgcmV0dXJuIHZMZWZ0LnN1Yih0aGlzKS5hbmdsZSh2UmlnaHQuc3ViKHRoaXMpKTtcbn1cblxuVmVjMi5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24ob3JpZ2luLCB0aGV0YSkge1xuICB2YXIgeCA9IHRoaXMueCAtIG9yaWdpbi54O1xuICB2YXIgeSA9IHRoaXMueSAtIG9yaWdpbi55O1xuICByZXR1cm4gbmV3IFZlYzIoeCpNYXRoLmNvcyh0aGV0YSkgLSB5Kk1hdGguc2luKHRoZXRhKSArIG9yaWdpbi54LCB4Kk1hdGguc2luKHRoZXRhKSArIHkqTWF0aC5jb3ModGhldGEpICsgb3JpZ2luLnkpO1xufVxuXG5WZWMyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCIoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gdGVzdF9WZWMyKCkge1xuICB2YXIgYXNzZXJ0ID0gZnVuY3Rpb24obGFiZWwsIGV4cHJlc3Npb24pIHtcbiAgICBjb25zb2xlLmxvZyhcIlZlYzIoXCIgKyBsYWJlbCArIFwiKTogXCIgKyAoZXhwcmVzc2lvbiA9PSB0cnVlID8gXCJQQVNTXCIgOiBcIkZBSUxcIikpO1xuICAgIGlmIChleHByZXNzaW9uICE9IHRydWUpXG4gICAgICB0aHJvdyBcImFzc2VydGlvbiBmYWlsZWRcIjtcbiAgfTtcbiAgXG4gIGFzc2VydChcImVxdWFsaXR5XCIsIChuZXcgVmVjMig1LDMpLmVxdWFscyhuZXcgVmVjMig1LDMpKSkpO1xuICBhc3NlcnQoXCJlcHNpbG9uIGVxdWFsaXR5XCIsIChuZXcgVmVjMigxLDIpLmVwc2lsb25FcXVhbHMobmV3IFZlYzIoMS4wMSwyLjAyKSwgMC4wMykpKTtcbiAgYXNzZXJ0KFwiZXBzaWxvbiBub24tZXF1YWxpdHlcIiwgIShuZXcgVmVjMigxLDIpLmVwc2lsb25FcXVhbHMobmV3IFZlYzIoMS4wMSwyLjAyKSwgMC4wMSkpKTtcbiAgYXNzZXJ0KFwiYWRkaXRpb25cIiwgKG5ldyBWZWMyKDEsMSkpLmFkZChuZXcgVmVjMigyLCAzKSkuZXF1YWxzKG5ldyBWZWMyKDMsIDQpKSk7XG4gIGFzc2VydChcInN1YnRyYWN0aW9uXCIsIChuZXcgVmVjMig0LDMpKS5zdWIobmV3IFZlYzIoMiwgMSkpLmVxdWFscyhuZXcgVmVjMigyLCAyKSkpO1xuICBhc3NlcnQoXCJtdWx0aXBseVwiLCAobmV3IFZlYzIoMiw0KSkubXVsKG5ldyBWZWMyKDIsIDEpKS5lcXVhbHMobmV3IFZlYzIoNCwgNCkpKTtcbiAgYXNzZXJ0KFwiZGl2aWRlXCIsIChuZXcgVmVjMig0LDIpKS5kaXYobmV3IFZlYzIoMiwgMikpLmVxdWFscyhuZXcgVmVjMigyLCAxKSkpO1xuICBhc3NlcnQoXCJzY2FsZVwiLCAobmV3IFZlYzIoNCwzKSkuc2NhbGUoMikuZXF1YWxzKG5ldyBWZWMyKDgsIDYpKSk7XG4gIGFzc2VydChcIm11dGFibGUgc2V0XCIsIChuZXcgVmVjMigxLDEpKS5tdXRhYmxlU2V0KG5ldyBWZWMyKDIsIDMpKS5lcXVhbHMobmV3IFZlYzIoMiwgMykpKTtcbiAgYXNzZXJ0KFwibXV0YWJsZSBhZGRpdGlvblwiLCAobmV3IFZlYzIoMSwxKSkubXV0YWJsZUFkZChuZXcgVmVjMigyLCAzKSkuZXF1YWxzKG5ldyBWZWMyKDMsIDQpKSk7XG4gIGFzc2VydChcIm11dGFibGUgc3VidHJhY3Rpb25cIiwgKG5ldyBWZWMyKDQsMykpLm11dGFibGVTdWIobmV3IFZlYzIoMiwgMSkpLmVxdWFscyhuZXcgVmVjMigyLCAyKSkpO1xuICBhc3NlcnQoXCJtdXRhYmxlIG11bHRpcGx5XCIsIChuZXcgVmVjMigyLDQpKS5tdXRhYmxlTXVsKG5ldyBWZWMyKDIsIDEpKS5lcXVhbHMobmV3IFZlYzIoNCwgNCkpKTtcbiAgYXNzZXJ0KFwibXV0YWJsZSBkaXZpZGVcIiwgKG5ldyBWZWMyKDQsMikpLm11dGFibGVEaXYobmV3IFZlYzIoMiwgMikpLmVxdWFscyhuZXcgVmVjMigyLCAxKSkpO1xuICBhc3NlcnQoXCJtdXRhYmxlIHNjYWxlXCIsIChuZXcgVmVjMig0LDMpKS5tdXRhYmxlU2NhbGUoMikuZXF1YWxzKG5ldyBWZWMyKDgsIDYpKSk7XG4gIGFzc2VydChcImxlbmd0aFwiLCBNYXRoLmFicygobmV3IFZlYzIoNCw0KSkubGVuZ3RoKCkgLSA1LjY1Njg1KSA8PSAwLjAwMDAxKTtcbiAgYXNzZXJ0KFwibGVuZ3RoMlwiLCAobmV3IFZlYzIoMiw0KSkubGVuZ3RoMigpID09IDIwKTtcbiAgYXNzZXJ0KFwiZGlzdFwiLCBNYXRoLmFicygobmV3IFZlYzIoMiw0KSkuZGlzdChuZXcgVmVjMigzLDUpKSAtIDEuNDE0MjEzNSkgPD0gMC4wMDAwMDEpO1xuICBhc3NlcnQoXCJkaXN0MlwiLCAobmV3IFZlYzIoMiw0KSkuZGlzdDIobmV3IFZlYzIoMyw1KSkgPT0gMik7XG5cbiAgdmFyIG5vcm1hbCA9IChuZXcgVmVjMigyLDQpKS5ub3JtYWwoKVxuICBhc3NlcnQoXCJub3JtYWxcIiwgTWF0aC5hYnMobm9ybWFsLmxlbmd0aCgpIC0gMS4wKSA8PSAwLjAwMDAxICYmIG5vcm1hbC5lcHNpbG9uRXF1YWxzKG5ldyBWZWMyKDAuNDQ3MiwgMC44OTQ0MyksIDAuMDAwMSkpO1xuICBhc3NlcnQoXCJkb3RcIiwgKG5ldyBWZWMyKDIsMykpLmRvdChuZXcgVmVjMig0LDEpKSA9PSAxMSk7XG4gIGFzc2VydChcImFuZ2xlXCIsIChuZXcgVmVjMigwLC0xKSkuYW5nbGUobmV3IFZlYzIoMSwwKSkqKDE4MC9NYXRoLlBJKSA9PSA5MCk7XG4gIGFzc2VydChcImFuZ2xlMlwiLCAobmV3IFZlYzIoMSwxKSkuYW5nbGUyKG5ldyBWZWMyKDEsMCksIG5ldyBWZWMyKDIsMSkpKigxODAvTWF0aC5QSSkgPT0gOTApO1xuICBhc3NlcnQoXCJyb3RhdGVcIiwgKG5ldyBWZWMyKDIsMCkpLnJvdGF0ZShuZXcgVmVjMigxLDApLCBNYXRoLlBJLzIpLmVxdWFscyhuZXcgVmVjMigxLDEpKSk7XG4gIGFzc2VydChcInRvU3RyaW5nXCIsIChuZXcgVmVjMigyLDQpKSA9PSBcIigyLCA0KVwiKTtcbn1cblxuIiwiXG4vKlxuQ29weXJpZ2h0IDIwMTMgU3ViIFByb3RvY29sIGFuZCBvdGhlciBjb250cmlidXRvcnNcbmh0dHA6Ly9zdWJwcm90b2NvbC5jb20vXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbkxJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbk9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG53aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnx8IHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG58fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnx8IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xufTtcblxudmFyIFZlYzIgPSByZXF1aXJlKCcuL3ZlYzInKVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBWZXJsZXRKU1xuZXhwb3J0cy5QYXJ0aWNsZSA9IFBhcnRpY2xlXG5leHBvcnRzLkNvbXBvc2l0ZSA9IENvbXBvc2l0ZVxuXG5mdW5jdGlvbiBQYXJ0aWNsZShwb3MpIHtcbiAgdGhpcy5wb3MgPSAobmV3IFZlYzIoKSkubXV0YWJsZVNldChwb3MpO1xuICB0aGlzLmxhc3RQb3MgPSAobmV3IFZlYzIoKSkubXV0YWJsZVNldChwb3MpO1xufVxuXG5QYXJ0aWNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5hcmModGhpcy5wb3MueCwgdGhpcy5wb3MueSwgMiwgMCwgMipNYXRoLlBJKTtcbiAgY3R4LmZpbGxTdHlsZSA9IFwiIzJkYWQ4ZlwiO1xuICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiBWZXJsZXRKUyh3aWR0aCwgaGVpZ2h0LCBjYW52YXMpIHtcbiAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gIHRoaXMuY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgdGhpcy5tb3VzZSA9IG5ldyBWZWMyKDAsMCk7XG4gIHRoaXMubW91c2VEb3duID0gZmFsc2U7XG4gIHRoaXMuZHJhZ2dlZEVudGl0eSA9IG51bGw7XG4gIHRoaXMuc2VsZWN0aW9uUmFkaXVzID0gMjA7XG4gIHRoaXMuaGlnaGxpZ2h0Q29sb3IgPSBcIiM0ZjU0NWNcIjtcbiAgXG4gIHRoaXMuYm91bmRzID0gZnVuY3Rpb24gKHBhcnRpY2xlKSB7XG4gICAgaWYgKHBhcnRpY2xlLnBvcy55ID4gdGhpcy5oZWlnaHQtMSlcbiAgICAgIHBhcnRpY2xlLnBvcy55ID0gdGhpcy5oZWlnaHQtMTtcbiAgICBcbiAgICBpZiAocGFydGljbGUucG9zLnggPCAwKVxuICAgICAgcGFydGljbGUucG9zLnggPSAwO1xuXG4gICAgaWYgKHBhcnRpY2xlLnBvcy54ID4gdGhpcy53aWR0aC0xKVxuICAgICAgcGFydGljbGUucG9zLnggPSB0aGlzLndpZHRoLTE7XG4gIH1cbiAgXG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIFxuICAvLyBwcmV2ZW50IGNvbnRleHQgbWVudVxuICB0aGlzLmNhbnZhcy5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfTtcbiAgXG4gIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oZSkge1xuICAgIF90aGlzLm1vdXNlRG93biA9IHRydWU7XG4gICAgdmFyIG5lYXJlc3QgPSBfdGhpcy5uZWFyZXN0RW50aXR5KCk7XG4gICAgaWYgKG5lYXJlc3QpIHtcbiAgICAgIF90aGlzLmRyYWdnZWRFbnRpdHkgPSBuZWFyZXN0O1xuICAgIH1cbiAgfTtcbiAgXG4gIHRoaXMuY2FudmFzLm9ubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBfdGhpcy5tb3VzZURvd24gPSBmYWxzZTtcbiAgICBfdGhpcy5kcmFnZ2VkRW50aXR5ID0gbnVsbDtcbiAgfTtcbiAgXG4gIHRoaXMuY2FudmFzLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciByZWN0ID0gX3RoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIF90aGlzLm1vdXNlLnggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgX3RoaXMubW91c2UueSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuICB9OyAgXG4gIFxuICAvLyBzaW11bGF0aW9uIHBhcmFtc1xuICB0aGlzLmdyYXZpdHkgPSBuZXcgVmVjMigwLDAuMDEpO1xuICB0aGlzLmZyaWN0aW9uID0gMC45OTtcbiAgdGhpcy5ncm91bmRGcmljdGlvbiA9IDAuODtcbiAgXG4gIC8vIGhvbGRzIGNvbXBvc2l0ZSBlbnRpdGllc1xuICB0aGlzLmNvbXBvc2l0ZXMgPSBbXTtcbn1cblxuVmVybGV0SlMucHJvdG90eXBlLkNvbXBvc2l0ZSA9IENvbXBvc2l0ZVxuXG5mdW5jdGlvbiBDb21wb3NpdGUoKSB7XG4gIHRoaXMucGFydGljbGVzID0gW107XG4gIHRoaXMuY29uc3RyYWludHMgPSBbXTtcbiAgXG4gIHRoaXMuZHJhd1BhcnRpY2xlcyA9IG51bGw7XG4gIHRoaXMuZHJhd0NvbnN0cmFpbnRzID0gbnVsbDtcbn1cblxuQ29tcG9zaXRlLnByb3RvdHlwZS5waW4gPSBmdW5jdGlvbihpbmRleCwgcG9zKSB7XG4gIHBvcyA9IHBvcyB8fCB0aGlzLnBhcnRpY2xlc1tpbmRleF0ucG9zO1xuICB2YXIgcGMgPSBuZXcgUGluQ29uc3RyYWludCh0aGlzLnBhcnRpY2xlc1tpbmRleF0sIHBvcyk7XG4gIHRoaXMuY29uc3RyYWludHMucHVzaChwYyk7XG4gIHJldHVybiBwYztcbn1cblxuVmVybGV0SlMucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oc3RlcCkge1xuICB2YXIgaSwgaiwgYztcblxuICBmb3IgKGMgaW4gdGhpcy5jb21wb3NpdGVzKSB7XG4gICAgZm9yIChpIGluIHRoaXMuY29tcG9zaXRlc1tjXS5wYXJ0aWNsZXMpIHtcbiAgICAgIHZhciBwYXJ0aWNsZXMgPSB0aGlzLmNvbXBvc2l0ZXNbY10ucGFydGljbGVzO1xuICAgICAgXG4gICAgICAvLyBjYWxjdWxhdGUgdmVsb2NpdHlcbiAgICAgIHZhciB2ZWxvY2l0eSA9IHBhcnRpY2xlc1tpXS5wb3Muc3ViKHBhcnRpY2xlc1tpXS5sYXN0UG9zKS5zY2FsZSh0aGlzLmZyaWN0aW9uKTtcbiAgICBcbiAgICAgIC8vIGdyb3VuZCBmcmljdGlvblxuICAgICAgaWYgKHBhcnRpY2xlc1tpXS5wb3MueSA+PSB0aGlzLmhlaWdodC0xICYmIHZlbG9jaXR5Lmxlbmd0aDIoKSA+IDAuMDAwMDAxKSB7XG4gICAgICAgIHZhciBtID0gdmVsb2NpdHkubGVuZ3RoKCk7XG4gICAgICAgIHZlbG9jaXR5LnggLz0gbTtcbiAgICAgICAgdmVsb2NpdHkueSAvPSBtO1xuICAgICAgICB2ZWxvY2l0eS5tdXRhYmxlU2NhbGUobSp0aGlzLmdyb3VuZEZyaWN0aW9uKTtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8vIHNhdmUgbGFzdCBnb29kIHN0YXRlXG4gICAgICBwYXJ0aWNsZXNbaV0ubGFzdFBvcy5tdXRhYmxlU2V0KHBhcnRpY2xlc1tpXS5wb3MpO1xuICAgIFxuICAgICAgLy8gZ3Jhdml0eVxuICAgICAgcGFydGljbGVzW2ldLnBvcy5tdXRhYmxlQWRkKHRoaXMuZ3Jhdml0eSk7XG4gICAgXG4gICAgICAvLyBpbmVydGlhICBcbiAgICAgIHBhcnRpY2xlc1tpXS5wb3MubXV0YWJsZUFkZCh2ZWxvY2l0eSk7XG4gICAgfVxuICB9XG4gIFxuICAvLyBoYW5kbGUgZHJhZ2dpbmcgb2YgZW50aXRpZXNcbiAgaWYgKHRoaXMuZHJhZ2dlZEVudGl0eSlcbiAgICB0aGlzLmRyYWdnZWRFbnRpdHkucG9zLm11dGFibGVTZXQodGhpcy5tb3VzZSk7XG4gICAgXG4gIC8vIHJlbGF4XG4gIHZhciBzdGVwQ29lZiA9IDEvc3RlcDtcbiAgZm9yIChjIGluIHRoaXMuY29tcG9zaXRlcykge1xuICAgIHZhciBjb25zdHJhaW50cyA9IHRoaXMuY29tcG9zaXRlc1tjXS5jb25zdHJhaW50cztcbiAgICBmb3IgKGk9MDtpPHN0ZXA7KytpKVxuICAgICAgZm9yIChqIGluIGNvbnN0cmFpbnRzKVxuICAgICAgICBjb25zdHJhaW50c1tqXS5yZWxheChzdGVwQ29lZik7XG4gIH1cbiAgXG4gIC8vIGJvdW5kcyBjaGVja2luZ1xuICBmb3IgKGMgaW4gdGhpcy5jb21wb3NpdGVzKSB7XG4gICAgdmFyIHBhcnRpY2xlcyA9IHRoaXMuY29tcG9zaXRlc1tjXS5wYXJ0aWNsZXM7XG4gICAgZm9yIChpIGluIHBhcnRpY2xlcylcbiAgICAgIHRoaXMuYm91bmRzKHBhcnRpY2xlc1tpXSk7XG4gIH1cbn1cblxuVmVybGV0SlMucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGksIGM7XG4gIFxuICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7ICBcbiAgXG4gIGZvciAoYyBpbiB0aGlzLmNvbXBvc2l0ZXMpIHtcbiAgICAvLyBkcmF3IGNvbnN0cmFpbnRzXG4gICAgaWYgKHRoaXMuY29tcG9zaXRlc1tjXS5kcmF3Q29uc3RyYWludHMpIHtcbiAgICAgIHRoaXMuY29tcG9zaXRlc1tjXS5kcmF3Q29uc3RyYWludHModGhpcy5jdHgsIHRoaXMuY29tcG9zaXRlc1tjXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjb25zdHJhaW50cyA9IHRoaXMuY29tcG9zaXRlc1tjXS5jb25zdHJhaW50cztcbiAgICAgIGZvciAoaSBpbiBjb25zdHJhaW50cylcbiAgICAgICAgY29uc3RyYWludHNbaV0uZHJhdyh0aGlzLmN0eCk7XG4gICAgfVxuICAgIFxuICAgIC8vIGRyYXcgcGFydGljbGVzXG4gICAgaWYgKHRoaXMuY29tcG9zaXRlc1tjXS5kcmF3UGFydGljbGVzKSB7XG4gICAgICB0aGlzLmNvbXBvc2l0ZXNbY10uZHJhd1BhcnRpY2xlcyh0aGlzLmN0eCwgdGhpcy5jb21wb3NpdGVzW2NdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHBhcnRpY2xlcyA9IHRoaXMuY29tcG9zaXRlc1tjXS5wYXJ0aWNsZXM7XG4gICAgICBmb3IgKGkgaW4gcGFydGljbGVzKVxuICAgICAgICBwYXJ0aWNsZXNbaV0uZHJhdyh0aGlzLmN0eCk7XG4gICAgfVxuICB9XG5cbiAgLy8gaGlnaGxpZ2h0IG5lYXJlc3QgLyBkcmFnZ2VkIGVudGl0eVxuICB2YXIgbmVhcmVzdCA9IHRoaXMuZHJhZ2dlZEVudGl0eSB8fCB0aGlzLm5lYXJlc3RFbnRpdHkoKTtcbiAgaWYgKG5lYXJlc3QpIHtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eC5hcmMobmVhcmVzdC5wb3MueCwgbmVhcmVzdC5wb3MueSwgOCwgMCwgMipNYXRoLlBJKTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuaGlnaGxpZ2h0Q29sb3I7XG4gICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gIH1cbn1cblxuVmVybGV0SlMucHJvdG90eXBlLm5lYXJlc3RFbnRpdHkgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGMsIGk7XG4gIHZhciBkMk5lYXJlc3QgPSAwO1xuICB2YXIgZW50aXR5ID0gbnVsbDtcbiAgdmFyIGNvbnN0cmFpbnRzTmVhcmVzdCA9IG51bGw7XG4gIFxuICAvLyBmaW5kIG5lYXJlc3QgcG9pbnRcbiAgZm9yIChjIGluIHRoaXMuY29tcG9zaXRlcykge1xuICAgIHZhciBwYXJ0aWNsZXMgPSB0aGlzLmNvbXBvc2l0ZXNbY10ucGFydGljbGVzO1xuICAgIGZvciAoaSBpbiBwYXJ0aWNsZXMpIHtcbiAgICAgIHZhciBkMiA9IHBhcnRpY2xlc1tpXS5wb3MuZGlzdDIodGhpcy5tb3VzZSk7XG4gICAgICBpZiAoZDIgPD0gdGhpcy5zZWxlY3Rpb25SYWRpdXMqdGhpcy5zZWxlY3Rpb25SYWRpdXMgJiYgKGVudGl0eSA9PSBudWxsIHx8IGQyIDwgZDJOZWFyZXN0KSkge1xuICAgICAgICBlbnRpdHkgPSBwYXJ0aWNsZXNbaV07XG4gICAgICAgIGNvbnN0cmFpbnRzTmVhcmVzdCA9IHRoaXMuY29tcG9zaXRlc1tjXS5jb25zdHJhaW50cztcbiAgICAgICAgZDJOZWFyZXN0ID0gZDI7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICAvLyBzZWFyY2ggZm9yIHBpbm5lZCBjb25zdHJhaW50cyBmb3IgdGhpcyBlbnRpdHlcbiAgZm9yIChpIGluIGNvbnN0cmFpbnRzTmVhcmVzdClcbiAgICBpZiAoY29uc3RyYWludHNOZWFyZXN0W2ldIGluc3RhbmNlb2YgUGluQ29uc3RyYWludCAmJiBjb25zdHJhaW50c05lYXJlc3RbaV0uYSA9PSBlbnRpdHkpXG4gICAgICBlbnRpdHkgPSBjb25zdHJhaW50c05lYXJlc3RbaV07XG4gIFxuICByZXR1cm4gZW50aXR5O1xufVxuXG4iLCJcbi8qXG5Db3B5cmlnaHQgMjAxMyBTdWIgUHJvdG9jb2wgYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuaHR0cDovL3N1YnByb3RvY29sLmNvbS9cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG5hIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcblwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xud2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG5wZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbnRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG5XSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbi8vIGdlbmVyaWMgdmVybGV0IGVudGl0aWVzXG5cbnZhciBWZXJsZXRKUyA9IHJlcXVpcmUoJy4vdmVybGV0JylcbnZhciBQYXJ0aWNsZSA9IFZlcmxldEpTLlBhcnRpY2xlXG52YXIgY29uc3RyYWludHMgPSByZXF1aXJlKCcuL2NvbnN0cmFpbnQnKVxudmFyIERpc3RhbmNlQ29uc3RyYWludCA9IGNvbnN0cmFpbnRzLkRpc3RhbmNlQ29uc3RyYWludFxuXG5WZXJsZXRKUy5wcm90b3R5cGUucG9pbnQgPSBmdW5jdGlvbihwb3MpIHtcbiAgdmFyIGNvbXBvc2l0ZSA9IG5ldyB0aGlzLkNvbXBvc2l0ZSgpO1xuICBjb21wb3NpdGUucGFydGljbGVzLnB1c2gobmV3IFBhcnRpY2xlKHBvcykpO1xuICB0aGlzLmNvbXBvc2l0ZXMucHVzaChjb21wb3NpdGUpO1xuICByZXR1cm4gY29tcG9zaXRlO1xufVxuXG5WZXJsZXRKUy5wcm90b3R5cGUubGluZVNlZ21lbnRzID0gZnVuY3Rpb24odmVydGljZXMsIHN0aWZmbmVzcykge1xuICB2YXIgaTtcbiAgXG4gIHZhciBjb21wb3NpdGUgPSBuZXcgdGhpcy5Db21wb3NpdGUoKTtcbiAgXG4gIGZvciAoaSBpbiB2ZXJ0aWNlcykge1xuICAgIGNvbXBvc2l0ZS5wYXJ0aWNsZXMucHVzaChuZXcgUGFydGljbGUodmVydGljZXNbaV0pKTtcbiAgICBpZiAoaSA+IDApXG4gICAgICBjb21wb3NpdGUuY29uc3RyYWludHMucHVzaChuZXcgRGlzdGFuY2VDb25zdHJhaW50KGNvbXBvc2l0ZS5wYXJ0aWNsZXNbaV0sIGNvbXBvc2l0ZS5wYXJ0aWNsZXNbaS0xXSwgc3RpZmZuZXNzKSk7XG4gIH1cbiAgXG4gIHRoaXMuY29tcG9zaXRlcy5wdXNoKGNvbXBvc2l0ZSk7XG4gIHJldHVybiBjb21wb3NpdGU7XG59XG5cblZlcmxldEpTLnByb3RvdHlwZS5jbG90aCA9IGZ1bmN0aW9uKG9yaWdpbiwgd2lkdGgsIGhlaWdodCwgc2VnbWVudHMsIHBpbk1vZCwgc3RpZmZuZXNzKSB7XG4gIFxuICB2YXIgY29tcG9zaXRlID0gbmV3IHRoaXMuQ29tcG9zaXRlKCk7XG4gIFxuICB2YXIgeFN0cmlkZSA9IHdpZHRoL3NlZ21lbnRzO1xuICB2YXIgeVN0cmlkZSA9IGhlaWdodC9zZWdtZW50cztcbiAgXG4gIHZhciB4LHk7XG4gIGZvciAoeT0wO3k8c2VnbWVudHM7Kyt5KSB7XG4gICAgZm9yICh4PTA7eDxzZWdtZW50czsrK3gpIHtcbiAgICAgIHZhciBweCA9IG9yaWdpbi54ICsgeCp4U3RyaWRlIC0gd2lkdGgvMiArIHhTdHJpZGUvMjtcbiAgICAgIHZhciBweSA9IG9yaWdpbi55ICsgeSp5U3RyaWRlIC0gaGVpZ2h0LzIgKyB5U3RyaWRlLzI7XG4gICAgICBjb21wb3NpdGUucGFydGljbGVzLnB1c2gobmV3IFBhcnRpY2xlKG5ldyBWZWMyKHB4LCBweSkpKTtcbiAgICAgIFxuICAgICAgaWYgKHggPiAwKVxuICAgICAgICBjb21wb3NpdGUuY29uc3RyYWludHMucHVzaChuZXcgRGlzdGFuY2VDb25zdHJhaW50KGNvbXBvc2l0ZS5wYXJ0aWNsZXNbeSpzZWdtZW50cyt4XSwgY29tcG9zaXRlLnBhcnRpY2xlc1t5KnNlZ21lbnRzK3gtMV0sIHN0aWZmbmVzcykpO1xuICAgICAgXG4gICAgICBpZiAoeSA+IDApXG4gICAgICAgIGNvbXBvc2l0ZS5jb25zdHJhaW50cy5wdXNoKG5ldyBEaXN0YW5jZUNvbnN0cmFpbnQoY29tcG9zaXRlLnBhcnRpY2xlc1t5KnNlZ21lbnRzK3hdLCBjb21wb3NpdGUucGFydGljbGVzWyh5LTEpKnNlZ21lbnRzK3hdLCBzdGlmZm5lc3MpKTtcbiAgICB9XG4gIH1cbiAgXG4gIGZvciAoeD0wO3g8c2VnbWVudHM7Kyt4KSB7XG4gICAgaWYgKHglcGluTW9kID09IDApXG4gICAgY29tcG9zaXRlLnBpbih4KTtcbiAgfVxuICBcbiAgdGhpcy5jb21wb3NpdGVzLnB1c2goY29tcG9zaXRlKTtcbiAgcmV0dXJuIGNvbXBvc2l0ZTtcbn1cblxuVmVybGV0SlMucHJvdG90eXBlLnRpcmUgPSBmdW5jdGlvbihvcmlnaW4sIHJhZGl1cywgc2VnbWVudHMsIHNwb2tlU3RpZmZuZXNzLCB0cmVhZFN0aWZmbmVzcykge1xuICB2YXIgc3RyaWRlID0gKDIqTWF0aC5QSSkvc2VnbWVudHM7XG4gIHZhciBpO1xuICBcbiAgdmFyIGNvbXBvc2l0ZSA9IG5ldyB0aGlzLkNvbXBvc2l0ZSgpO1xuICBcbiAgLy8gcGFydGljbGVzXG4gIGZvciAoaT0wO2k8c2VnbWVudHM7KytpKSB7XG4gICAgdmFyIHRoZXRhID0gaSpzdHJpZGU7XG4gICAgY29tcG9zaXRlLnBhcnRpY2xlcy5wdXNoKG5ldyBQYXJ0aWNsZShuZXcgVmVjMihvcmlnaW4ueCArIE1hdGguY29zKHRoZXRhKSpyYWRpdXMsIG9yaWdpbi55ICsgTWF0aC5zaW4odGhldGEpKnJhZGl1cykpKTtcbiAgfVxuICBcbiAgdmFyIGNlbnRlciA9IG5ldyBQYXJ0aWNsZShvcmlnaW4pO1xuICBjb21wb3NpdGUucGFydGljbGVzLnB1c2goY2VudGVyKTtcbiAgXG4gIC8vIGNvbnN0cmFpbnRzXG4gIGZvciAoaT0wO2k8c2VnbWVudHM7KytpKSB7XG4gICAgY29tcG9zaXRlLmNvbnN0cmFpbnRzLnB1c2gobmV3IERpc3RhbmNlQ29uc3RyYWludChjb21wb3NpdGUucGFydGljbGVzW2ldLCBjb21wb3NpdGUucGFydGljbGVzWyhpKzEpJXNlZ21lbnRzXSwgdHJlYWRTdGlmZm5lc3MpKTtcbiAgICBjb21wb3NpdGUuY29uc3RyYWludHMucHVzaChuZXcgRGlzdGFuY2VDb25zdHJhaW50KGNvbXBvc2l0ZS5wYXJ0aWNsZXNbaV0sIGNlbnRlciwgc3Bva2VTdGlmZm5lc3MpKVxuICAgIGNvbXBvc2l0ZS5jb25zdHJhaW50cy5wdXNoKG5ldyBEaXN0YW5jZUNvbnN0cmFpbnQoY29tcG9zaXRlLnBhcnRpY2xlc1tpXSwgY29tcG9zaXRlLnBhcnRpY2xlc1soaSs1KSVzZWdtZW50c10sIHRyZWFkU3RpZmZuZXNzKSk7XG4gIH1cbiAgICBcbiAgdGhpcy5jb21wb3NpdGVzLnB1c2goY29tcG9zaXRlKTtcbiAgcmV0dXJuIGNvbXBvc2l0ZTtcbn1cblxuIl19
;