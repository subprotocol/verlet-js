
// DistanceConstraint -- constrains to initial distance
// PinConstraint -- constrains to static/fixed point
// AngleConstraint -- constrains 3 particles to an angle

function DistanceConstraint(a, b, stiffness) {
	this.a = a;
	this.b = b;
	this.distance = a.pos.sub(b.pos).length();
	this.stiffness = stiffness;
}

DistanceConstraint.prototype.relax = function(stepCoef) {
	var normal = this.a.pos.sub(this.b.pos);
	var m = normal.length();
	normal.mutableScale(((this.distance - m)/m)*this.stiffness*stepCoef);
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
	this.distance2 = (a.pos.dist2(b.pos) + c.pos.dist2(b.pos))/2;
	this.angle = this.b.pos.angle2(this.a.pos, this.c.pos);
	this.stiffness = stiffness;
}

AngleConstraint.prototype.relax = function(stepCoef) {
	var angle = this.b.pos.angle2(this.a.pos, this.c.pos);
	var diff = angle - this.angle;
	
	if (Math.abs(diff) >= Math.PI)
		diff *= -1;
	
	diff *= this.stiffness*stepCoef;
	
	var ad = this.a.pos.dist2(this.b.pos);
	var ac = this.c.pos.dist2(this.b.pos);
	
	if (ad < 0.0001)
		ad = 0.0001;
	
	if (ac < 0.0001)
		ac = 0.0001;
	
	var aTorqueCoef = this.distance2/ad;
	var cTorqueCoef = this.distance2/ac;
	
	this.a.pos = this.a.pos.rotate(this.b.pos, diff*aTorqueCoef);
	this.c.pos = this.c.pos.rotate(this.b.pos, -diff*cTorqueCoef);
	
	this.b.pos = this.b.pos.rotate(this.a.pos, diff*aTorqueCoef);
	this.b.pos = this.b.pos.rotate(this.c.pos, -diff*cTorqueCoef);
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
