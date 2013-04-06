

function Particle(pos, mass) {
	this.pos = (new Vec2()).mutableSet(pos);
	this.lastPos = (new Vec2()).mutableSet(pos);
	this.mass = mass;
}

Particle.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.arc(this.pos.x, this.pos.y, 2, 0, 2*Math.PI);
	ctx.fillStyle = "#2dad8f";
	ctx.fill();
}

