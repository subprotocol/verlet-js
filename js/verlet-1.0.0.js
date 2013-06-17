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


},{}],4:[function(require,module,exports){

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


},{"./verlet":2,"./constraint":3}],2:[function(require,module,exports){

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
	this.gravity = new Vec2(0,0.2);
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


},{"./vec2":5}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL2Rpc3QuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL2NvbnN0cmFpbnQuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL3ZlYzIuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL29iamVjdHMuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZXJsZXQtanMvbGliL3ZlcmxldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiXG4vL3RoaXMgZXhwb3J0cyBhbGwgdGhlIHZlcmxldCBtZXRob2RzIGdsb2JhbGx5LCBzbyB0aGF0IHRoZSBkZW1vcyB3b3JrLlxuXG52YXIgVmVybGV0SlMgPSByZXF1aXJlKCcuL3ZlcmxldCcpXG52YXIgY29uc3RyYWludCA9IHJlcXVpcmUoJy4vY29uc3RyYWludCcpXG5cdFx0XHRcdFx0XHRcdFx0IHJlcXVpcmUoJy4vb2JqZWN0cycpIC8vcGF0Y2hlcyBWZXJsZXRKUy5wcm90b3R5cGUgKGJhZClcbndpbmRvdy5WZWMyID0gcmVxdWlyZSgnLi92ZWMyJylcbndpbmRvdy5WZXJsZXRKUyA9IFZlcmxldEpTXG5cbndpbmRvdy5QYXJ0aWNsZSA9IFZlcmxldEpTLlBhcnRpY2xlXG5cbndpbmRvdy5EaXN0YW5jZUNvbnN0cmFpbnQgPSBjb25zdHJhaW50LkRpc3RhbmNlQ29uc3RyYWludFxud2luZG93LlBpbkNvbnN0cmFpbnQgICAgICA9IGNvbnN0cmFpbnQuUGluQ29uc3RyYWludFxud2luZG93LkFuZ2xlQ29uc3RyYWludCAgICA9IGNvbnN0cmFpbnQuQW5nbGVDb25zdHJhaW50XG5cblxuIiwiXG4vKlxuQ29weXJpZ2h0IDIwMTMgU3ViIFByb3RvY29sIGFuZCBvdGhlciBjb250cmlidXRvcnNcbmh0dHA6Ly9zdWJwcm90b2NvbC5jb20vXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbkxJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbk9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG4vLyBEaXN0YW5jZUNvbnN0cmFpbnQgLS0gY29uc3RyYWlucyB0byBpbml0aWFsIGRpc3RhbmNlXG4vLyBQaW5Db25zdHJhaW50IC0tIGNvbnN0cmFpbnMgdG8gc3RhdGljL2ZpeGVkIHBvaW50XG4vLyBBbmdsZUNvbnN0cmFpbnQgLS0gY29uc3RyYWlucyAzIHBhcnRpY2xlcyB0byBhbiBhbmdsZVxuXG5leHBvcnRzLkRpc3RhbmNlQ29uc3RyYWludCA9IERpc3RhbmNlQ29uc3RyYWludFxuZXhwb3J0cy5QaW5Db25zdHJhaW50ID0gUGluQ29uc3RyYWludFxuZXhwb3J0cy5BbmdsZUNvbnN0cmFpbnQgPSBBbmdsZUNvbnN0cmFpbnRcblxuZnVuY3Rpb24gRGlzdGFuY2VDb25zdHJhaW50KGEsIGIsIHN0aWZmbmVzcywgZGlzdGFuY2UgLypvcHRpb25hbCovKSB7XG5cdHRoaXMuYSA9IGE7XG5cdHRoaXMuYiA9IGI7XG5cdHRoaXMuZGlzdGFuY2UgPSB0eXBlb2YgZGlzdGFuY2UgIT0gXCJ1bmRlZmluZWRcIiA/IGRpc3RhbmNlIDogYS5wb3Muc3ViKGIucG9zKS5sZW5ndGgoKTtcblx0dGhpcy5zdGlmZm5lc3MgPSBzdGlmZm5lc3M7XG59XG5cbkRpc3RhbmNlQ29uc3RyYWludC5wcm90b3R5cGUucmVsYXggPSBmdW5jdGlvbihzdGVwQ29lZikge1xuXHR2YXIgbm9ybWFsID0gdGhpcy5hLnBvcy5zdWIodGhpcy5iLnBvcyk7XG5cdHZhciBtID0gbm9ybWFsLmxlbmd0aDIoKTtcblx0bm9ybWFsLm11dGFibGVTY2FsZSgoKHRoaXMuZGlzdGFuY2UqdGhpcy5kaXN0YW5jZSAtIG0pL20pKnRoaXMuc3RpZmZuZXNzKnN0ZXBDb2VmKTtcblx0dGhpcy5hLnBvcy5tdXRhYmxlQWRkKG5vcm1hbCk7XG5cdHRoaXMuYi5wb3MubXV0YWJsZVN1Yihub3JtYWwpO1xufVxuXG5EaXN0YW5jZUNvbnN0cmFpbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcblx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRjdHgubW92ZVRvKHRoaXMuYS5wb3MueCwgdGhpcy5hLnBvcy55KTtcblx0Y3R4LmxpbmVUbyh0aGlzLmIucG9zLngsIHRoaXMuYi5wb3MueSk7XG5cdGN0eC5zdHJva2VTdHlsZSA9IFwiI2Q4ZGRlMlwiO1xuXHRjdHguc3Ryb2tlKCk7XG59XG5cblxuXG5mdW5jdGlvbiBQaW5Db25zdHJhaW50KGEsIHBvcykge1xuXHR0aGlzLmEgPSBhO1xuXHR0aGlzLnBvcyA9IChuZXcgVmVjMigpKS5tdXRhYmxlU2V0KHBvcyk7XG59XG5cblBpbkNvbnN0cmFpbnQucHJvdG90eXBlLnJlbGF4ID0gZnVuY3Rpb24oc3RlcENvZWYpIHtcblx0dGhpcy5hLnBvcy5tdXRhYmxlU2V0KHRoaXMucG9zKTtcbn1cblxuUGluQ29uc3RyYWludC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xuXHRjdHguYmVnaW5QYXRoKCk7XG5cdGN0eC5hcmModGhpcy5wb3MueCwgdGhpcy5wb3MueSwgNiwgMCwgMipNYXRoLlBJKTtcblx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDE1MywyNTUsMC4xKVwiO1xuXHRjdHguZmlsbCgpO1xufVxuXG5cbmZ1bmN0aW9uIEFuZ2xlQ29uc3RyYWludChhLCBiLCBjLCBzdGlmZm5lc3MpIHtcblx0dGhpcy5hID0gYTtcblx0dGhpcy5iID0gYjtcblx0dGhpcy5jID0gYztcblx0dGhpcy5hbmdsZSA9IHRoaXMuYi5wb3MuYW5nbGUyKHRoaXMuYS5wb3MsIHRoaXMuYy5wb3MpO1xuXHR0aGlzLnN0aWZmbmVzcyA9IHN0aWZmbmVzcztcbn1cblxuQW5nbGVDb25zdHJhaW50LnByb3RvdHlwZS5yZWxheCA9IGZ1bmN0aW9uKHN0ZXBDb2VmKSB7XG5cdHZhciBhbmdsZSA9IHRoaXMuYi5wb3MuYW5nbGUyKHRoaXMuYS5wb3MsIHRoaXMuYy5wb3MpO1xuXHR2YXIgZGlmZiA9IGFuZ2xlIC0gdGhpcy5hbmdsZTtcblx0XG5cdGlmIChkaWZmIDw9IC1NYXRoLlBJKVxuXHRcdGRpZmYgKz0gMipNYXRoLlBJO1xuXHRlbHNlIGlmIChkaWZmID49IE1hdGguUEkpXG5cdFx0ZGlmZiAtPSAyKk1hdGguUEk7XG5cblx0ZGlmZiAqPSBzdGVwQ29lZip0aGlzLnN0aWZmbmVzcztcblx0XG5cdHRoaXMuYS5wb3MgPSB0aGlzLmEucG9zLnJvdGF0ZSh0aGlzLmIucG9zLCBkaWZmKTtcblx0dGhpcy5jLnBvcyA9IHRoaXMuYy5wb3Mucm90YXRlKHRoaXMuYi5wb3MsIC1kaWZmKTtcblx0dGhpcy5iLnBvcyA9IHRoaXMuYi5wb3Mucm90YXRlKHRoaXMuYS5wb3MsIGRpZmYpO1xuXHR0aGlzLmIucG9zID0gdGhpcy5iLnBvcy5yb3RhdGUodGhpcy5jLnBvcywgLWRpZmYpO1xufVxuXG5BbmdsZUNvbnN0cmFpbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcblx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRjdHgubW92ZVRvKHRoaXMuYS5wb3MueCwgdGhpcy5hLnBvcy55KTtcblx0Y3R4LmxpbmVUbyh0aGlzLmIucG9zLngsIHRoaXMuYi5wb3MueSk7XG5cdGN0eC5saW5lVG8odGhpcy5jLnBvcy54LCB0aGlzLmMucG9zLnkpO1xuXHR2YXIgdG1wID0gY3R4LmxpbmVXaWR0aDtcblx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdGN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgyNTUsMjU1LDAsMC4yKVwiO1xuXHRjdHguc3Ryb2tlKCk7XG5cdGN0eC5saW5lV2lkdGggPSB0bXA7XG59XG4iLCJcbi8qXG5Db3B5cmlnaHQgMjAxMyBTdWIgUHJvdG9jb2wgYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuaHR0cDovL3N1YnByb3RvY29sLmNvbS9cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG5hIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcblwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xud2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG5wZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbnRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG5XSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbi8vIEEgc2ltcGxlIDItZGltZW5zaW9uYWwgdmVjdG9yIGltcGxlbWVudGF0aW9uXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjMlxuXG5mdW5jdGlvbiBWZWMyKHgsIHkpIHtcblx0dGhpcy54ID0geCB8fCAwO1xuXHR0aGlzLnkgPSB5IHx8IDA7XG59XG5cblZlYzIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIG5ldyBWZWMyKHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55KTtcbn1cblxuVmVjMi5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24odikge1xuXHRyZXR1cm4gbmV3IFZlYzIodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnkpO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbih2KSB7XG5cdHJldHVybiBuZXcgVmVjMih0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSk7XG59XG5cblZlYzIucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIG5ldyBWZWMyKHRoaXMueCAvIHYueCwgdGhpcy55IC8gdi55KTtcbn1cblxuVmVjMi5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbihjb2VmKSB7XG5cdHJldHVybiBuZXcgVmVjMih0aGlzLngqY29lZiwgdGhpcy55KmNvZWYpO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdXRhYmxlU2V0ID0gZnVuY3Rpb24odikge1xuXHR0aGlzLnggPSB2Lng7XG5cdHRoaXMueSA9IHYueTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblZlYzIucHJvdG90eXBlLm11dGFibGVBZGQgPSBmdW5jdGlvbih2KSB7XG5cdHRoaXMueCArPSB2Lng7XG5cdHRoaXMueSArPSB2Lnk7XG5cdHJldHVybiB0aGlzO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdXRhYmxlU3ViID0gZnVuY3Rpb24odikge1xuXHR0aGlzLnggLT0gdi54O1xuXHR0aGlzLnkgLT0gdi55O1xuXHRyZXR1cm4gdGhpcztcbn1cblxuVmVjMi5wcm90b3R5cGUubXV0YWJsZU11bCA9IGZ1bmN0aW9uKHYpIHtcblx0dGhpcy54ICo9IHYueDtcblx0dGhpcy55ICo9IHYueTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblZlYzIucHJvdG90eXBlLm11dGFibGVEaXYgPSBmdW5jdGlvbih2KSB7XG5cdHRoaXMueCAvPSB2Lng7XG5cdHRoaXMueSAvPSB2Lnk7XG5cdHJldHVybiB0aGlzO1xufVxuXG5WZWMyLnByb3RvdHlwZS5tdXRhYmxlU2NhbGUgPSBmdW5jdGlvbihjb2VmKSB7XG5cdHRoaXMueCAqPSBjb2VmO1xuXHR0aGlzLnkgKj0gY29lZjtcblx0cmV0dXJuIHRoaXM7XG59XG5cblZlYzIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIHRoaXMueCA9PSB2LnggJiYgdGhpcy55ID09IHYueTtcbn1cblxuVmVjMi5wcm90b3R5cGUuZXBzaWxvbkVxdWFscyA9IGZ1bmN0aW9uKHYsIGVwc2lsb24pIHtcblx0cmV0dXJuIE1hdGguYWJzKHRoaXMueCAtIHYueCkgPD0gZXBzaWxvbiAmJiBNYXRoLmFicyh0aGlzLnkgLSB2LnkpIDw9IGVwc2lsb247XG59XG5cblZlYzIucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIE1hdGguc3FydCh0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSk7XG59XG5cblZlYzIucHJvdG90eXBlLmxlbmd0aDIgPSBmdW5jdGlvbih2KSB7XG5cdHJldHVybiB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueTtcbn1cblxuVmVjMi5wcm90b3R5cGUuZGlzdCA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3QyKHYpKTtcbn1cblxuVmVjMi5wcm90b3R5cGUuZGlzdDIgPSBmdW5jdGlvbih2KSB7XG5cdHZhciB4ID0gdi54IC0gdGhpcy54O1xuXHR2YXIgeSA9IHYueSAtIHRoaXMueTtcblx0cmV0dXJuIHgqeCArIHkqeTtcbn1cblxuVmVjMi5wcm90b3R5cGUubm9ybWFsID0gZnVuY3Rpb24oKSB7XG5cdHZhciBtID0gTWF0aC5zcXJ0KHRoaXMueCp0aGlzLnggKyB0aGlzLnkqdGhpcy55KTtcblx0cmV0dXJuIG5ldyBWZWMyKHRoaXMueC9tLCB0aGlzLnkvbSk7XG59XG5cblZlYzIucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIHRoaXMueCp2LnggKyB0aGlzLnkqdi55O1xufVxuXG5WZWMyLnByb3RvdHlwZS5hbmdsZSA9IGZ1bmN0aW9uKHYpIHtcblx0cmV0dXJuIE1hdGguYXRhbjIodGhpcy54KnYueS10aGlzLnkqdi54LHRoaXMueCp2LngrdGhpcy55KnYueSk7XG59XG5cblZlYzIucHJvdG90eXBlLmFuZ2xlMiA9IGZ1bmN0aW9uKHZMZWZ0LCB2UmlnaHQpIHtcblx0cmV0dXJuIHZMZWZ0LnN1Yih0aGlzKS5hbmdsZSh2UmlnaHQuc3ViKHRoaXMpKTtcbn1cblxuVmVjMi5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24ob3JpZ2luLCB0aGV0YSkge1xuXHR2YXIgeCA9IHRoaXMueCAtIG9yaWdpbi54O1xuXHR2YXIgeSA9IHRoaXMueSAtIG9yaWdpbi55O1xuXHRyZXR1cm4gbmV3IFZlYzIoeCpNYXRoLmNvcyh0aGV0YSkgLSB5Kk1hdGguc2luKHRoZXRhKSArIG9yaWdpbi54LCB4Kk1hdGguc2luKHRoZXRhKSArIHkqTWF0aC5jb3ModGhldGEpICsgb3JpZ2luLnkpO1xufVxuXG5WZWMyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gXCIoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gdGVzdF9WZWMyKCkge1xuXHR2YXIgYXNzZXJ0ID0gZnVuY3Rpb24obGFiZWwsIGV4cHJlc3Npb24pIHtcblx0XHRjb25zb2xlLmxvZyhcIlZlYzIoXCIgKyBsYWJlbCArIFwiKTogXCIgKyAoZXhwcmVzc2lvbiA9PSB0cnVlID8gXCJQQVNTXCIgOiBcIkZBSUxcIikpO1xuXHRcdGlmIChleHByZXNzaW9uICE9IHRydWUpXG5cdFx0XHR0aHJvdyBcImFzc2VydGlvbiBmYWlsZWRcIjtcblx0fTtcblx0XG5cdGFzc2VydChcImVxdWFsaXR5XCIsIChuZXcgVmVjMig1LDMpLmVxdWFscyhuZXcgVmVjMig1LDMpKSkpO1xuXHRhc3NlcnQoXCJlcHNpbG9uIGVxdWFsaXR5XCIsIChuZXcgVmVjMigxLDIpLmVwc2lsb25FcXVhbHMobmV3IFZlYzIoMS4wMSwyLjAyKSwgMC4wMykpKTtcblx0YXNzZXJ0KFwiZXBzaWxvbiBub24tZXF1YWxpdHlcIiwgIShuZXcgVmVjMigxLDIpLmVwc2lsb25FcXVhbHMobmV3IFZlYzIoMS4wMSwyLjAyKSwgMC4wMSkpKTtcblx0YXNzZXJ0KFwiYWRkaXRpb25cIiwgKG5ldyBWZWMyKDEsMSkpLmFkZChuZXcgVmVjMigyLCAzKSkuZXF1YWxzKG5ldyBWZWMyKDMsIDQpKSk7XG5cdGFzc2VydChcInN1YnRyYWN0aW9uXCIsIChuZXcgVmVjMig0LDMpKS5zdWIobmV3IFZlYzIoMiwgMSkpLmVxdWFscyhuZXcgVmVjMigyLCAyKSkpO1xuXHRhc3NlcnQoXCJtdWx0aXBseVwiLCAobmV3IFZlYzIoMiw0KSkubXVsKG5ldyBWZWMyKDIsIDEpKS5lcXVhbHMobmV3IFZlYzIoNCwgNCkpKTtcblx0YXNzZXJ0KFwiZGl2aWRlXCIsIChuZXcgVmVjMig0LDIpKS5kaXYobmV3IFZlYzIoMiwgMikpLmVxdWFscyhuZXcgVmVjMigyLCAxKSkpO1xuXHRhc3NlcnQoXCJzY2FsZVwiLCAobmV3IFZlYzIoNCwzKSkuc2NhbGUoMikuZXF1YWxzKG5ldyBWZWMyKDgsIDYpKSk7XG5cdGFzc2VydChcIm11dGFibGUgc2V0XCIsIChuZXcgVmVjMigxLDEpKS5tdXRhYmxlU2V0KG5ldyBWZWMyKDIsIDMpKS5lcXVhbHMobmV3IFZlYzIoMiwgMykpKTtcblx0YXNzZXJ0KFwibXV0YWJsZSBhZGRpdGlvblwiLCAobmV3IFZlYzIoMSwxKSkubXV0YWJsZUFkZChuZXcgVmVjMigyLCAzKSkuZXF1YWxzKG5ldyBWZWMyKDMsIDQpKSk7XG5cdGFzc2VydChcIm11dGFibGUgc3VidHJhY3Rpb25cIiwgKG5ldyBWZWMyKDQsMykpLm11dGFibGVTdWIobmV3IFZlYzIoMiwgMSkpLmVxdWFscyhuZXcgVmVjMigyLCAyKSkpO1xuXHRhc3NlcnQoXCJtdXRhYmxlIG11bHRpcGx5XCIsIChuZXcgVmVjMigyLDQpKS5tdXRhYmxlTXVsKG5ldyBWZWMyKDIsIDEpKS5lcXVhbHMobmV3IFZlYzIoNCwgNCkpKTtcblx0YXNzZXJ0KFwibXV0YWJsZSBkaXZpZGVcIiwgKG5ldyBWZWMyKDQsMikpLm11dGFibGVEaXYobmV3IFZlYzIoMiwgMikpLmVxdWFscyhuZXcgVmVjMigyLCAxKSkpO1xuXHRhc3NlcnQoXCJtdXRhYmxlIHNjYWxlXCIsIChuZXcgVmVjMig0LDMpKS5tdXRhYmxlU2NhbGUoMikuZXF1YWxzKG5ldyBWZWMyKDgsIDYpKSk7XG5cdGFzc2VydChcImxlbmd0aFwiLCBNYXRoLmFicygobmV3IFZlYzIoNCw0KSkubGVuZ3RoKCkgLSA1LjY1Njg1KSA8PSAwLjAwMDAxKTtcblx0YXNzZXJ0KFwibGVuZ3RoMlwiLCAobmV3IFZlYzIoMiw0KSkubGVuZ3RoMigpID09IDIwKTtcblx0YXNzZXJ0KFwiZGlzdFwiLCBNYXRoLmFicygobmV3IFZlYzIoMiw0KSkuZGlzdChuZXcgVmVjMigzLDUpKSAtIDEuNDE0MjEzNSkgPD0gMC4wMDAwMDEpO1xuXHRhc3NlcnQoXCJkaXN0MlwiLCAobmV3IFZlYzIoMiw0KSkuZGlzdDIobmV3IFZlYzIoMyw1KSkgPT0gMik7XG5cblx0dmFyIG5vcm1hbCA9IChuZXcgVmVjMigyLDQpKS5ub3JtYWwoKVxuXHRhc3NlcnQoXCJub3JtYWxcIiwgTWF0aC5hYnMobm9ybWFsLmxlbmd0aCgpIC0gMS4wKSA8PSAwLjAwMDAxICYmIG5vcm1hbC5lcHNpbG9uRXF1YWxzKG5ldyBWZWMyKDAuNDQ3MiwgMC44OTQ0MyksIDAuMDAwMSkpO1xuXHRhc3NlcnQoXCJkb3RcIiwgKG5ldyBWZWMyKDIsMykpLmRvdChuZXcgVmVjMig0LDEpKSA9PSAxMSk7XG5cdGFzc2VydChcImFuZ2xlXCIsIChuZXcgVmVjMigwLC0xKSkuYW5nbGUobmV3IFZlYzIoMSwwKSkqKDE4MC9NYXRoLlBJKSA9PSA5MCk7XG5cdGFzc2VydChcImFuZ2xlMlwiLCAobmV3IFZlYzIoMSwxKSkuYW5nbGUyKG5ldyBWZWMyKDEsMCksIG5ldyBWZWMyKDIsMSkpKigxODAvTWF0aC5QSSkgPT0gOTApO1xuXHRhc3NlcnQoXCJyb3RhdGVcIiwgKG5ldyBWZWMyKDIsMCkpLnJvdGF0ZShuZXcgVmVjMigxLDApLCBNYXRoLlBJLzIpLmVxdWFscyhuZXcgVmVjMigxLDEpKSk7XG5cdGFzc2VydChcInRvU3RyaW5nXCIsIChuZXcgVmVjMigyLDQpKSA9PSBcIigyLCA0KVwiKTtcbn1cblxuIiwiXG4vKlxuQ29weXJpZ2h0IDIwMTMgU3ViIFByb3RvY29sIGFuZCBvdGhlciBjb250cmlidXRvcnNcbmh0dHA6Ly9zdWJwcm90b2NvbC5jb20vXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbkxJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbk9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG4vLyBnZW5lcmljIHZlcmxldCBlbnRpdGllc1xuXG52YXIgVmVybGV0SlMgPSByZXF1aXJlKCcuL3ZlcmxldCcpXG52YXIgUGFydGljbGUgPSBWZXJsZXRKUy5QYXJ0aWNsZVxudmFyIGNvbnN0cmFpbnRzID0gcmVxdWlyZSgnLi9jb25zdHJhaW50JylcbnZhciBEaXN0YW5jZUNvbnN0cmFpbnQgPSBjb25zdHJhaW50cy5EaXN0YW5jZUNvbnN0cmFpbnRcblxuVmVybGV0SlMucHJvdG90eXBlLnBvaW50ID0gZnVuY3Rpb24ocG9zKSB7XG5cdHZhciBjb21wb3NpdGUgPSBuZXcgdGhpcy5Db21wb3NpdGUoKTtcblx0Y29tcG9zaXRlLnBhcnRpY2xlcy5wdXNoKG5ldyBQYXJ0aWNsZShwb3MpKTtcblx0dGhpcy5jb21wb3NpdGVzLnB1c2goY29tcG9zaXRlKTtcblx0cmV0dXJuIGNvbXBvc2l0ZTtcbn1cblxuVmVybGV0SlMucHJvdG90eXBlLmxpbmVTZWdtZW50cyA9IGZ1bmN0aW9uKHZlcnRpY2VzLCBzdGlmZm5lc3MpIHtcblx0dmFyIGk7XG5cdFxuXHR2YXIgY29tcG9zaXRlID0gbmV3IHRoaXMuQ29tcG9zaXRlKCk7XG5cdFxuXHRmb3IgKGkgaW4gdmVydGljZXMpIHtcblx0XHRjb21wb3NpdGUucGFydGljbGVzLnB1c2gobmV3IFBhcnRpY2xlKHZlcnRpY2VzW2ldKSk7XG5cdFx0aWYgKGkgPiAwKVxuXHRcdFx0Y29tcG9zaXRlLmNvbnN0cmFpbnRzLnB1c2gobmV3IERpc3RhbmNlQ29uc3RyYWludChjb21wb3NpdGUucGFydGljbGVzW2ldLCBjb21wb3NpdGUucGFydGljbGVzW2ktMV0sIHN0aWZmbmVzcykpO1xuXHR9XG5cdFxuXHR0aGlzLmNvbXBvc2l0ZXMucHVzaChjb21wb3NpdGUpO1xuXHRyZXR1cm4gY29tcG9zaXRlO1xufVxuXG5WZXJsZXRKUy5wcm90b3R5cGUuY2xvdGggPSBmdW5jdGlvbihvcmlnaW4sIHdpZHRoLCBoZWlnaHQsIHNlZ21lbnRzLCBwaW5Nb2QsIHN0aWZmbmVzcykge1xuXHRcblx0dmFyIGNvbXBvc2l0ZSA9IG5ldyB0aGlzLkNvbXBvc2l0ZSgpO1xuXHRcblx0dmFyIHhTdHJpZGUgPSB3aWR0aC9zZWdtZW50cztcblx0dmFyIHlTdHJpZGUgPSBoZWlnaHQvc2VnbWVudHM7XG5cdFxuXHR2YXIgeCx5O1xuXHRmb3IgKHk9MDt5PHNlZ21lbnRzOysreSkge1xuXHRcdGZvciAoeD0wO3g8c2VnbWVudHM7Kyt4KSB7XG5cdFx0XHR2YXIgcHggPSBvcmlnaW4ueCArIHgqeFN0cmlkZSAtIHdpZHRoLzIgKyB4U3RyaWRlLzI7XG5cdFx0XHR2YXIgcHkgPSBvcmlnaW4ueSArIHkqeVN0cmlkZSAtIGhlaWdodC8yICsgeVN0cmlkZS8yO1xuXHRcdFx0Y29tcG9zaXRlLnBhcnRpY2xlcy5wdXNoKG5ldyBQYXJ0aWNsZShuZXcgVmVjMihweCwgcHkpKSk7XG5cdFx0XHRcblx0XHRcdGlmICh4ID4gMClcblx0XHRcdFx0Y29tcG9zaXRlLmNvbnN0cmFpbnRzLnB1c2gobmV3IERpc3RhbmNlQ29uc3RyYWludChjb21wb3NpdGUucGFydGljbGVzW3kqc2VnbWVudHMreF0sIGNvbXBvc2l0ZS5wYXJ0aWNsZXNbeSpzZWdtZW50cyt4LTFdLCBzdGlmZm5lc3MpKTtcblx0XHRcdFxuXHRcdFx0aWYgKHkgPiAwKVxuXHRcdFx0XHRjb21wb3NpdGUuY29uc3RyYWludHMucHVzaChuZXcgRGlzdGFuY2VDb25zdHJhaW50KGNvbXBvc2l0ZS5wYXJ0aWNsZXNbeSpzZWdtZW50cyt4XSwgY29tcG9zaXRlLnBhcnRpY2xlc1soeS0xKSpzZWdtZW50cyt4XSwgc3RpZmZuZXNzKSk7XG5cdFx0fVxuXHR9XG5cdFxuXHRmb3IgKHg9MDt4PHNlZ21lbnRzOysreCkge1xuXHRcdGlmICh4JXBpbk1vZCA9PSAwKVxuXHRcdGNvbXBvc2l0ZS5waW4oeCk7XG5cdH1cblx0XG5cdHRoaXMuY29tcG9zaXRlcy5wdXNoKGNvbXBvc2l0ZSk7XG5cdHJldHVybiBjb21wb3NpdGU7XG59XG5cblZlcmxldEpTLnByb3RvdHlwZS50aXJlID0gZnVuY3Rpb24ob3JpZ2luLCByYWRpdXMsIHNlZ21lbnRzLCBzcG9rZVN0aWZmbmVzcywgdHJlYWRTdGlmZm5lc3MpIHtcblx0dmFyIHN0cmlkZSA9ICgyKk1hdGguUEkpL3NlZ21lbnRzO1xuXHR2YXIgaTtcblx0XG5cdHZhciBjb21wb3NpdGUgPSBuZXcgdGhpcy5Db21wb3NpdGUoKTtcblx0XG5cdC8vIHBhcnRpY2xlc1xuXHRmb3IgKGk9MDtpPHNlZ21lbnRzOysraSkge1xuXHRcdHZhciB0aGV0YSA9IGkqc3RyaWRlO1xuXHRcdGNvbXBvc2l0ZS5wYXJ0aWNsZXMucHVzaChuZXcgUGFydGljbGUobmV3IFZlYzIob3JpZ2luLnggKyBNYXRoLmNvcyh0aGV0YSkqcmFkaXVzLCBvcmlnaW4ueSArIE1hdGguc2luKHRoZXRhKSpyYWRpdXMpKSk7XG5cdH1cblx0XG5cdHZhciBjZW50ZXIgPSBuZXcgUGFydGljbGUob3JpZ2luKTtcblx0Y29tcG9zaXRlLnBhcnRpY2xlcy5wdXNoKGNlbnRlcik7XG5cdFxuXHQvLyBjb25zdHJhaW50c1xuXHRmb3IgKGk9MDtpPHNlZ21lbnRzOysraSkge1xuXHRcdGNvbXBvc2l0ZS5jb25zdHJhaW50cy5wdXNoKG5ldyBEaXN0YW5jZUNvbnN0cmFpbnQoY29tcG9zaXRlLnBhcnRpY2xlc1tpXSwgY29tcG9zaXRlLnBhcnRpY2xlc1soaSsxKSVzZWdtZW50c10sIHRyZWFkU3RpZmZuZXNzKSk7XG5cdFx0Y29tcG9zaXRlLmNvbnN0cmFpbnRzLnB1c2gobmV3IERpc3RhbmNlQ29uc3RyYWludChjb21wb3NpdGUucGFydGljbGVzW2ldLCBjZW50ZXIsIHNwb2tlU3RpZmZuZXNzKSlcblx0XHRjb21wb3NpdGUuY29uc3RyYWludHMucHVzaChuZXcgRGlzdGFuY2VDb25zdHJhaW50KGNvbXBvc2l0ZS5wYXJ0aWNsZXNbaV0sIGNvbXBvc2l0ZS5wYXJ0aWNsZXNbKGkrNSklc2VnbWVudHNdLCB0cmVhZFN0aWZmbmVzcykpO1xuXHR9XG5cdFx0XG5cdHRoaXMuY29tcG9zaXRlcy5wdXNoKGNvbXBvc2l0ZSk7XG5cdHJldHVybiBjb21wb3NpdGU7XG59XG5cbiIsIlxuLypcbkNvcHlyaWdodCAyMDEzIFN1YiBQcm90b2NvbCBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG5odHRwOi8vc3VicHJvdG9jb2wuY29tL1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG5MSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG5PRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbldJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG58fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG58fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG58fCB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVxufHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG58fCBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcbn07XG5cbnZhciBWZWMyID0gcmVxdWlyZSgnLi92ZWMyJylcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gVmVybGV0SlNcbmV4cG9ydHMuUGFydGljbGUgPSBQYXJ0aWNsZVxuZXhwb3J0cy5Db21wb3NpdGUgPSBDb21wb3NpdGVcblxuZnVuY3Rpb24gUGFydGljbGUocG9zKSB7XG5cdHRoaXMucG9zID0gKG5ldyBWZWMyKCkpLm11dGFibGVTZXQocG9zKTtcblx0dGhpcy5sYXN0UG9zID0gKG5ldyBWZWMyKCkpLm11dGFibGVTZXQocG9zKTtcbn1cblxuUGFydGljbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcblx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRjdHguYXJjKHRoaXMucG9zLngsIHRoaXMucG9zLnksIDIsIDAsIDIqTWF0aC5QSSk7XG5cdGN0eC5maWxsU3R5bGUgPSBcIiMyZGFkOGZcIjtcblx0Y3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gVmVybGV0SlMod2lkdGgsIGhlaWdodCwgY2FudmFzKSB7XG5cdHRoaXMud2lkdGggPSB3aWR0aDtcblx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xuXHR0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdHRoaXMubW91c2UgPSBuZXcgVmVjMigwLDApO1xuXHR0aGlzLm1vdXNlRG93biA9IGZhbHNlO1xuXHR0aGlzLmRyYWdnZWRFbnRpdHkgPSBudWxsO1xuXHR0aGlzLnNlbGVjdGlvblJhZGl1cyA9IDIwO1xuXHR0aGlzLmhpZ2hsaWdodENvbG9yID0gXCIjNGY1NDVjXCI7XG5cdFxuXHR0aGlzLmJvdW5kcyA9IGZ1bmN0aW9uIChwYXJ0aWNsZSkge1xuXHRcdGlmIChwYXJ0aWNsZS5wb3MueSA+IHRoaXMuaGVpZ2h0LTEpXG5cdFx0XHRwYXJ0aWNsZS5wb3MueSA9IHRoaXMuaGVpZ2h0LTE7XG5cdFx0XG5cdFx0aWYgKHBhcnRpY2xlLnBvcy54IDwgMClcblx0XHRcdHBhcnRpY2xlLnBvcy54ID0gMDtcblxuXHRcdGlmIChwYXJ0aWNsZS5wb3MueCA+IHRoaXMud2lkdGgtMSlcblx0XHRcdHBhcnRpY2xlLnBvcy54ID0gdGhpcy53aWR0aC0xO1xuXHR9XG5cdFxuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRcblx0Ly8gcHJldmVudCBjb250ZXh0IG1lbnVcblx0dGhpcy5jYW52YXMub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdH07XG5cdFxuXHR0aGlzLmNhbnZhcy5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcblx0XHRfdGhpcy5tb3VzZURvd24gPSB0cnVlO1xuXHRcdHZhciBuZWFyZXN0ID0gX3RoaXMubmVhcmVzdEVudGl0eSgpO1xuXHRcdGlmIChuZWFyZXN0KSB7XG5cdFx0XHRfdGhpcy5kcmFnZ2VkRW50aXR5ID0gbmVhcmVzdDtcblx0XHR9XG5cdH07XG5cdFxuXHR0aGlzLmNhbnZhcy5vbm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XG5cdFx0X3RoaXMubW91c2VEb3duID0gZmFsc2U7XG5cdFx0X3RoaXMuZHJhZ2dlZEVudGl0eSA9IG51bGw7XG5cdH07XG5cdFxuXHR0aGlzLmNhbnZhcy5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgcmVjdCA9IF90aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRfdGhpcy5tb3VzZS54ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuXHRcdF90aGlzLm1vdXNlLnkgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcblx0fTsgIFxuXHRcblx0Ly8gc2ltdWxhdGlvbiBwYXJhbXNcblx0dGhpcy5ncmF2aXR5ID0gbmV3IFZlYzIoMCwwLjIpO1xuXHR0aGlzLmZyaWN0aW9uID0gMC45OTtcblx0dGhpcy5ncm91bmRGcmljdGlvbiA9IDAuODtcblx0XG5cdC8vIGhvbGRzIGNvbXBvc2l0ZSBlbnRpdGllc1xuXHR0aGlzLmNvbXBvc2l0ZXMgPSBbXTtcbn1cblxuVmVybGV0SlMucHJvdG90eXBlLkNvbXBvc2l0ZSA9IENvbXBvc2l0ZVxuXG5mdW5jdGlvbiBDb21wb3NpdGUoKSB7XG5cdHRoaXMucGFydGljbGVzID0gW107XG5cdHRoaXMuY29uc3RyYWludHMgPSBbXTtcblx0XG5cdHRoaXMuZHJhd1BhcnRpY2xlcyA9IG51bGw7XG5cdHRoaXMuZHJhd0NvbnN0cmFpbnRzID0gbnVsbDtcbn1cblxuQ29tcG9zaXRlLnByb3RvdHlwZS5waW4gPSBmdW5jdGlvbihpbmRleCwgcG9zKSB7XG5cdHBvcyA9IHBvcyB8fCB0aGlzLnBhcnRpY2xlc1tpbmRleF0ucG9zO1xuXHR2YXIgcGMgPSBuZXcgUGluQ29uc3RyYWludCh0aGlzLnBhcnRpY2xlc1tpbmRleF0sIHBvcyk7XG5cdHRoaXMuY29uc3RyYWludHMucHVzaChwYyk7XG5cdHJldHVybiBwYztcbn1cblxuVmVybGV0SlMucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oc3RlcCkge1xuXHR2YXIgaSwgaiwgYztcblxuXHRmb3IgKGMgaW4gdGhpcy5jb21wb3NpdGVzKSB7XG5cdFx0Zm9yIChpIGluIHRoaXMuY29tcG9zaXRlc1tjXS5wYXJ0aWNsZXMpIHtcblx0XHRcdHZhciBwYXJ0aWNsZXMgPSB0aGlzLmNvbXBvc2l0ZXNbY10ucGFydGljbGVzO1xuXHRcdFx0XG5cdFx0XHQvLyBjYWxjdWxhdGUgdmVsb2NpdHlcblx0XHRcdHZhciB2ZWxvY2l0eSA9IHBhcnRpY2xlc1tpXS5wb3Muc3ViKHBhcnRpY2xlc1tpXS5sYXN0UG9zKS5zY2FsZSh0aGlzLmZyaWN0aW9uKTtcblx0XHRcblx0XHRcdC8vIGdyb3VuZCBmcmljdGlvblxuXHRcdFx0aWYgKHBhcnRpY2xlc1tpXS5wb3MueSA+PSB0aGlzLmhlaWdodC0xICYmIHZlbG9jaXR5Lmxlbmd0aDIoKSA+IDAuMDAwMDAxKSB7XG5cdFx0XHRcdHZhciBtID0gdmVsb2NpdHkubGVuZ3RoKCk7XG5cdFx0XHRcdHZlbG9jaXR5LnggLz0gbTtcblx0XHRcdFx0dmVsb2NpdHkueSAvPSBtO1xuXHRcdFx0XHR2ZWxvY2l0eS5tdXRhYmxlU2NhbGUobSp0aGlzLmdyb3VuZEZyaWN0aW9uKTtcblx0XHRcdH1cblx0XHRcblx0XHRcdC8vIHNhdmUgbGFzdCBnb29kIHN0YXRlXG5cdFx0XHRwYXJ0aWNsZXNbaV0ubGFzdFBvcy5tdXRhYmxlU2V0KHBhcnRpY2xlc1tpXS5wb3MpO1xuXHRcdFxuXHRcdFx0Ly8gZ3Jhdml0eVxuXHRcdFx0cGFydGljbGVzW2ldLnBvcy5tdXRhYmxlQWRkKHRoaXMuZ3Jhdml0eSk7XG5cdFx0XG5cdFx0XHQvLyBpbmVydGlhICBcblx0XHRcdHBhcnRpY2xlc1tpXS5wb3MubXV0YWJsZUFkZCh2ZWxvY2l0eSk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyBoYW5kbGUgZHJhZ2dpbmcgb2YgZW50aXRpZXNcblx0aWYgKHRoaXMuZHJhZ2dlZEVudGl0eSlcblx0XHR0aGlzLmRyYWdnZWRFbnRpdHkucG9zLm11dGFibGVTZXQodGhpcy5tb3VzZSk7XG5cdFx0XG5cdC8vIHJlbGF4XG5cdHZhciBzdGVwQ29lZiA9IDEvc3RlcDtcblx0Zm9yIChjIGluIHRoaXMuY29tcG9zaXRlcykge1xuXHRcdHZhciBjb25zdHJhaW50cyA9IHRoaXMuY29tcG9zaXRlc1tjXS5jb25zdHJhaW50cztcblx0XHRmb3IgKGk9MDtpPHN0ZXA7KytpKVxuXHRcdFx0Zm9yIChqIGluIGNvbnN0cmFpbnRzKVxuXHRcdFx0XHRjb25zdHJhaW50c1tqXS5yZWxheChzdGVwQ29lZik7XG5cdH1cblx0XG5cdC8vIGJvdW5kcyBjaGVja2luZ1xuXHRmb3IgKGMgaW4gdGhpcy5jb21wb3NpdGVzKSB7XG5cdFx0dmFyIHBhcnRpY2xlcyA9IHRoaXMuY29tcG9zaXRlc1tjXS5wYXJ0aWNsZXM7XG5cdFx0Zm9yIChpIGluIHBhcnRpY2xlcylcblx0XHRcdHRoaXMuYm91bmRzKHBhcnRpY2xlc1tpXSk7XG5cdH1cbn1cblxuVmVybGV0SlMucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblx0dmFyIGksIGM7XG5cdFxuXHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7ICBcblx0XG5cdGZvciAoYyBpbiB0aGlzLmNvbXBvc2l0ZXMpIHtcblx0XHQvLyBkcmF3IGNvbnN0cmFpbnRzXG5cdFx0aWYgKHRoaXMuY29tcG9zaXRlc1tjXS5kcmF3Q29uc3RyYWludHMpIHtcblx0XHRcdHRoaXMuY29tcG9zaXRlc1tjXS5kcmF3Q29uc3RyYWludHModGhpcy5jdHgsIHRoaXMuY29tcG9zaXRlc1tjXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBjb25zdHJhaW50cyA9IHRoaXMuY29tcG9zaXRlc1tjXS5jb25zdHJhaW50cztcblx0XHRcdGZvciAoaSBpbiBjb25zdHJhaW50cylcblx0XHRcdFx0Y29uc3RyYWludHNbaV0uZHJhdyh0aGlzLmN0eCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIGRyYXcgcGFydGljbGVzXG5cdFx0aWYgKHRoaXMuY29tcG9zaXRlc1tjXS5kcmF3UGFydGljbGVzKSB7XG5cdFx0XHR0aGlzLmNvbXBvc2l0ZXNbY10uZHJhd1BhcnRpY2xlcyh0aGlzLmN0eCwgdGhpcy5jb21wb3NpdGVzW2NdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRpY2xlcyA9IHRoaXMuY29tcG9zaXRlc1tjXS5wYXJ0aWNsZXM7XG5cdFx0XHRmb3IgKGkgaW4gcGFydGljbGVzKVxuXHRcdFx0XHRwYXJ0aWNsZXNbaV0uZHJhdyh0aGlzLmN0eCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gaGlnaGxpZ2h0IG5lYXJlc3QgLyBkcmFnZ2VkIGVudGl0eVxuXHR2YXIgbmVhcmVzdCA9IHRoaXMuZHJhZ2dlZEVudGl0eSB8fCB0aGlzLm5lYXJlc3RFbnRpdHkoKTtcblx0aWYgKG5lYXJlc3QpIHtcblx0XHR0aGlzLmN0eC5iZWdpblBhdGgoKTtcblx0XHR0aGlzLmN0eC5hcmMobmVhcmVzdC5wb3MueCwgbmVhcmVzdC5wb3MueSwgOCwgMCwgMipNYXRoLlBJKTtcblx0XHR0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuaGlnaGxpZ2h0Q29sb3I7XG5cdFx0dGhpcy5jdHguc3Ryb2tlKCk7XG5cdH1cbn1cblxuVmVybGV0SlMucHJvdG90eXBlLm5lYXJlc3RFbnRpdHkgPSBmdW5jdGlvbigpIHtcblx0dmFyIGMsIGk7XG5cdHZhciBkMk5lYXJlc3QgPSAwO1xuXHR2YXIgZW50aXR5ID0gbnVsbDtcblx0dmFyIGNvbnN0cmFpbnRzTmVhcmVzdCA9IG51bGw7XG5cdFxuXHQvLyBmaW5kIG5lYXJlc3QgcG9pbnRcblx0Zm9yIChjIGluIHRoaXMuY29tcG9zaXRlcykge1xuXHRcdHZhciBwYXJ0aWNsZXMgPSB0aGlzLmNvbXBvc2l0ZXNbY10ucGFydGljbGVzO1xuXHRcdGZvciAoaSBpbiBwYXJ0aWNsZXMpIHtcblx0XHRcdHZhciBkMiA9IHBhcnRpY2xlc1tpXS5wb3MuZGlzdDIodGhpcy5tb3VzZSk7XG5cdFx0XHRpZiAoZDIgPD0gdGhpcy5zZWxlY3Rpb25SYWRpdXMqdGhpcy5zZWxlY3Rpb25SYWRpdXMgJiYgKGVudGl0eSA9PSBudWxsIHx8IGQyIDwgZDJOZWFyZXN0KSkge1xuXHRcdFx0XHRlbnRpdHkgPSBwYXJ0aWNsZXNbaV07XG5cdFx0XHRcdGNvbnN0cmFpbnRzTmVhcmVzdCA9IHRoaXMuY29tcG9zaXRlc1tjXS5jb25zdHJhaW50cztcblx0XHRcdFx0ZDJOZWFyZXN0ID0gZDI7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyBzZWFyY2ggZm9yIHBpbm5lZCBjb25zdHJhaW50cyBmb3IgdGhpcyBlbnRpdHlcblx0Zm9yIChpIGluIGNvbnN0cmFpbnRzTmVhcmVzdClcblx0XHRpZiAoY29uc3RyYWludHNOZWFyZXN0W2ldIGluc3RhbmNlb2YgUGluQ29uc3RyYWludCAmJiBjb25zdHJhaW50c05lYXJlc3RbaV0uYSA9PSBlbnRpdHkpXG5cdFx0XHRlbnRpdHkgPSBjb25zdHJhaW50c05lYXJlc3RbaV07XG5cdFxuXHRyZXR1cm4gZW50aXR5O1xufVxuXG4iXX0=
;