

function PMass(pos, mass) {
	this.pos = (new Vec2()).mutableSet(pos);
	this.lastPos = (new Vec2()).mutableSet(pos);
	this.mass = mass;
}

PMass.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.arc(this.pos.x, this.pos.y, 3, 0, 2*Math.PI);
	ctx.fillStyle = "rgba(255,0,0,1)";
	ctx.fill();
}

