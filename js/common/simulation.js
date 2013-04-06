
window.requestAnimFrame = window.requestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.oRequestAnimationFrame
|| window.msRequestAnimationFrame
|| function(callback) {
	window.setTimeout(callback, 1000 / 60);
};




var VerletSimulation = function(width, height, canvas) {
	this.width = width;
	this.height = height;
	this.canvas = canvas;
	
	this.ctx = canvas.getContext("2d");
	
	this.gravity = new Vec2(0,0.2);
	this.friction = 0.8;
	
	this.composites = [];
	
	/*
	
	this.points = [];
	this.constraints = [];
	
	this.points.push(new Particle(new Vec2(20,10), 1.0));
	this.points.push(new Particle(new Vec2(40,10), 1.0));
	this.points.push(new Particle(new Vec2(60,10), 1.0));
	this.points.push(new Particle(new Vec2(80,10), 1.0));
	this.points.push(new Particle(new Vec2(100,10), 1.0));

	var stiffness = 0.01;
	
	this.constraints.push(new DistanceConstraint(this.points[0], this.points[1], stiffness));
	this.constraints.push(new DistanceConstraint(this.points[1], this.points[2], stiffness));
	this.constraints.push(new DistanceConstraint(this.points[2], this.points[3], stiffness));
	this.constraints.push(new DistanceConstraint(this.points[3], this.points[4], stiffness));
	
	this.constraints.push(new PinConstraint(this.points[0], new Vec2(20,10), 1.0));
	this.constraints.push(new PinConstraint(this.points[4], new Vec2(100,10), 1.0));
	
	
	
	this.tire(new Vec2(100,50), 50, 30, 0.3, 0.9);
	
	
	this.tire(new Vec2(250,50), 70, 7, 0.1, 0.2);
	
	this.tire(new Vec2(400,50), 70, 3, 1, 1);*/
}

VerletSimulation.prototype.Composite = function() {
	this.points = [];
	this.constraints = [];
}

VerletSimulation.prototype.tire = function(origin, radius, segments, spokeStiffness, treadStiffness) {
	var mass = 1.0;
	
	var stride = (2*Math.PI)/segments;
	var i;
	
	var composite = new this.Composite();
	
	// points
	var points = [];
	for (i=0;i<segments;++i) {
		var theta = i*stride;
		composite.points.push(new Particle(new Vec2(origin.x + Math.cos(theta)*radius, origin.y + Math.sin(theta)*radius), mass));
	}
	
	var center = new Particle(origin, mass);
	composite.points.push(center);
	
	// constraints
	var constraints = [];
	for (i=0;i<segments;++i) {
		composite.constraints.push(new DistanceConstraint(composite.points[i], composite.points[(i+1)%segments], treadStiffness));
		composite.constraints.push(new DistanceConstraint(composite.points[i], center, spokeStiffness))
		composite.constraints.push(new DistanceConstraint(composite.points[i], composite.points[(i+5)%segments], treadStiffness));
	}
		
	this.composites.push(composite);
	return composite;
}


VerletSimulation.prototype.frame = function(step) {
	var i, j, c;

	for (c in this.composites) {
		for (i in this.composites[c].points) {
			var points = this.composites[c].points;
			
			// calcualte velocity
			var velocity = points[i].pos.sub(points[i].lastPos);
		
			// ground friction
			if (points[i].pos.y >= this.height && velocity.length2() > 0.000001) {
				var m = velocity.length();
				velocity.x /= m;
				velocity.y /= m;
				velocity.mutableScale(m*this.friction);
			}
		
			// save last good state state
			points[i].lastPos.mutableSet(points[i].pos);
		
			// gravity
			points[i].pos.mutableAdd(this.gravity);
		
			// interia	
			points[i].pos.mutableAdd(velocity);
		}
	}
	
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
		var points = this.composites[c].points;
		
		for (i in points) {
			if (points[i].pos.y > this.height)
				points[i].pos.y = this.height;
			
			if (points[i].pos.x < 0)
				points[i].pos.x = 0;
		}
	}

}

VerletSimulation.prototype.draw = function() {
	var i, c;
	
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	

	for (c in this.composites) {
		var points = this.composites[c].points;
		var constraints = this.composites[c].constraints;
		
		for (i in constraints)
			constraints[i].draw(this.ctx);
		
		for (i in points)
			points[i].draw(this.ctx);
	}
}

