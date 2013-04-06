
test_Vec2();


window.requestAnimFrame = window.requestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.oRequestAnimationFrame
|| window.msRequestAnimationFrame
|| function(callback) {
	window.setTimeout(callback, 1000 / 60);
};




var VerletDemo = function(width, height, canvas) {
	this.width = width;
	this.height = height;
	this.canvas = canvas;
	
	this.ctx = canvas.getContext("2d");
	
	this.gravity = new Vec2(0,0.2);
	this.friction = 0.8;
	
	this.points = [];
	this.points.push(new PMass(new Vec2(20,10), 1.0));
	this.points.push(new PMass(new Vec2(40,10), 1.0));
	this.points.push(new PMass(new Vec2(60,10), 1.0));
	this.points.push(new PMass(new Vec2(80,10), 1.0));
	this.points.push(new PMass(new Vec2(100,10), 1.0));

	var stiffness = 0.01;
	this.constraints = [];
	this.constraints.push(new DistanceConstraint(this.points[0], this.points[1], stiffness));
	this.constraints.push(new DistanceConstraint(this.points[1], this.points[2], stiffness));
	this.constraints.push(new DistanceConstraint(this.points[2], this.points[3], stiffness));
	this.constraints.push(new DistanceConstraint(this.points[3], this.points[4], stiffness));
	
	this.constraints.push(new PinConstraint(this.points[0], new Vec2(20,10), 1.0));
	this.constraints.push(new PinConstraint(this.points[4], new Vec2(100,10), 1.0));
	
	
	
	this.circle(new Vec2(100,50), 50, 30, 0.3, 0.9);
	
	
	this.circle(new Vec2(250,50), 70, 7, 0.1, 0.2);
	
	this.circle(new Vec2(400,50), 70, 3, 1, 1);
}


VerletDemo.prototype.circle = function(origin, radius, segments, spokeStiffness, treadStiffness) {
	
	var mass = 1.0;
	
	var stride = (2*Math.PI)/segments;
	var i;
	
	// points
	var points = [];
	for (i=0;i<segments;++i) {
		var theta = i*stride;
		points.push(new PMass(new Vec2(origin.x + Math.cos(theta)*radius, origin.y + Math.sin(theta)*radius), mass));
	}
	
	points.push(new PMass(origin, mass))
	
	// constraints
	var constraints = [];
	for (i=0;i<segments;++i) {
		constraints.push(new DistanceConstraint(points[i], points[(i+1)%segments], treadStiffness));
		constraints.push(new DistanceConstraint(points[i], points[segments], spokeStiffness))
		constraints.push(new DistanceConstraint(points[i], points[(i+5)%segments], treadStiffness));
	}
	
	for (i in points)
		this.points.push(points[i]);
		
	for (i in constraints)
		this.constraints.push(constraints[i]);
}


VerletDemo.prototype.frame = function(step) {
	var i, j;

	for (i in this.points) {
		// calcualte velocity
		var velocity = this.points[i].pos.sub(this.points[i].lastPos);
		
		// ground friction
		if (this.points[i].pos.y >= this.height && velocity.length2() > 0.000001) {
			var m = velocity.length();
			velocity.x /= m;
			velocity.y /= m;
			velocity.mutableScale(m*this.friction);
		}
		
		// save last good state state
		this.points[i].lastPos.mutableSet(this.points[i].pos);
		
		// gravity
		this.points[i].pos.mutableAdd(this.gravity);
		
		// interia	
		this.points[i].pos.mutableAdd(velocity);
	}
	
	// relax
	var stepCoef = 1/step;
	for (i=0;i<step;++i)
		for (j in this.constraints)
			this.constraints[j].relax(stepCoef);
	
	// bounds checking
	for (i in this.points) {
		if (this.points[i].pos.y > this.height)
			this.points[i].pos.y = this.height;
			
		if (this.points[i].pos.x < 0)
			this.points[i].pos.x = 0;
	}

}

VerletDemo.prototype.draw = function() {
	var i;
	
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	

	for (i in this.constraints)
		this.constraints[i].draw(this.ctx);
		
	for (i in this.points)
		this.points[i].draw(this.ctx);
}

window.onload = function() {
	var canvas = document.getElementById("scratch");
	
	// retina
	var dpr = window.devicePixelRatio || 1;
	
	var width = parseInt(canvas.style.width);
	var height = parseInt(canvas.style.height);
	canvas.width = width*dpr;
	canvas.height = height*dpr;
	canvas.getContext("2d").scale(dpr, dpr);
	
	// simulation
	var demo = new VerletDemo(width, height, canvas);
	var loop = function() {
		demo.frame(16);
		demo.draw();
		requestAnimFrame(loop);
	};
	
	loop();
};



