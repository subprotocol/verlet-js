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

var AngleConstraint, DistanceConstraint, PinConstraint;

DistanceConstraint = function(a, b, stiffness, distance) {
  a = a;
  b = b;
  distance = (typeof distance !== "undefined" ? distance : a.pos.sub(b.pos).length());
  return stiffness = stiffness;
};

PinConstraint = function(a, pos) {
  a = a;
  return pos = (new Vec2()).mutableSet(pos);
};

AngleConstraint = function(a, b, c, stiffness) {
  a = a;
  b = b;
  c = c;
  angle = b.pos.angle2(a.pos, c.pos);
  return stiffness = stiffness;
};

DistanceConstraint.prototype.relax = function(stepCoef) {
  var m, normal;
  normal = a.pos.sub(b.pos);
  m = normal.length2();
  normal.mutableScale(((distance * distance - m) / m) * stiffness * stepCoef);
  a.pos.mutableAdd(normal);
  return b.pos.mutableSub(normal);
};

DistanceConstraint.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(a.pos.x, a.pos.y);
  ctx.lineTo(b.pos.x, b.pos.y);
  ctx.strokeStyle = "#d8dde2";
  return ctx.stroke();
};

PinConstraint.prototype.relax = function(stepCoef) {
  return a.pos.mutableSet(pos);
};

PinConstraint.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0,153,255,0.1)";
  return ctx.fill();
};

AngleConstraint.prototype.relax = function(stepCoef) {
  var angle, diff;
  angle = b.pos.angle2(a.pos, c.pos);
  diff = angle - angle;
  if (diff <= -Math.PI) {
    diff += 2 * Math.PI;
  } else {
    if (diff >= Math.PI) {
      diff -= 2 * Math.PI;
    }
  }
  diff *= stepCoef * stiffness;
  a.pos = a.pos.rotate(b.pos, diff);
  c.pos = c.pos.rotate(b.pos, -diff);
  b.pos = b.pos.rotate(a.pos, diff);
  return b.pos = b.pos.rotate(c.pos, -diff);
};

AngleConstraint.prototype.draw = function(ctx) {
  var tmp;
  ctx.beginPath();
  ctx.moveTo(a.pos.x, a.pos.y);
  ctx.lineTo(b.pos.x, b.pos.y);
  ctx.lineTo(c.pos.x, c.pos.y);
  tmp = ctx.lineWidth;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,0,0.2)";
  ctx.stroke();
  return ctx.lineWidth = tmp;
};