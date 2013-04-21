
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

var VerletJS = function(width, height, canvas) {
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

VerletJS.prototype.Composite = function() {
	this.particles = [];
	this.constraints = [];
	
	this.drawParticles = null;
	this.drawConstraints = null;
}

VerletJS.prototype.Composite.prototype.pin = function(index, pos) {
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

