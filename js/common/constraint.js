
// DistanceConstraint -- constrains to initial distance
// PinConstraint -- constrains to static/fixed point
// AngleConstraint -- constrains 3 particles to an angle

function DistanceConstraint(a, b, stiffness, distance /*optional*/) {
	this.a = a;
	this.b = b;
	this.distance = typeof distance != "undefined" ? distance : a.pos.sub(b.pos).length();
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
