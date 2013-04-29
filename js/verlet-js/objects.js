
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

VerletJS.prototype.point = function(pos) {
  var composite;
  composite = new Composite();
  composite.particles.push(new Particle(pos));
  composites.push(composite);
  return composite;
};

VerletJS.prototype.lineSegments = function(vertices, stiffness) {
  var composite, i;
  i = void 0;
  composite = new Composite();
  for (i in vertices) {
    composite.particles.push(new Particle(vertices[i]));
    if (i > 0) {
      composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[i - 1], stiffness));
    }
  }
  composites.push(composite);
  return composite;
};

VerletJS.prototype.cloth = function(origin, width, height, segments, pinMod, stiffness) {
  var composite, px, py, x, xStride, y, yStride;
  composite = new Composite();
  xStride = width / segments;
  yStride = height / segments;
  x = void 0;
  y = void 0;
  y = 0;
  while (y < segments) {
    x = 0;
    while (x < segments) {
      px = origin.x + x * xStride - width / 2 + xStride / 2;
      py = origin.y + y * yStride - height / 2 + yStride / 2;
      composite.particles.push(new Particle(new Vec2(px, py)));
      if (x > 0) {
        composite.constraints.push(new DistanceConstraint(composite.particles[y * segments + x], composite.particles[y * segments + x - 1], stiffness));
      }
      if (y > 0) {
        composite.constraints.push(new DistanceConstraint(composite.particles[y * segments + x], composite.particles[(y - 1) * segments + x], stiffness));
      }
      ++x;
    }
    ++y;
  }
  x = 0;
  while (x < segments) {
    if (x % pinMod === 0) {
      composite.pin(x);
    }
    ++x;
  }
  composites.push(composite);
  return composite;
};

VerletJS.prototype.tire = function(origin, radius, segments, spokeStiffness, treadStiffness) {
  var center, composite, i, stride, theta;
  stride = (2 * Math.PI) / segments;
  i = void 0;
  composite = new Composite();
  i = 0;
  while (i < segments) {
    theta = i * stride;
    composite.particles.push(new Particle(new Vec2(origin.x + Math.cos(theta) * radius, origin.y + Math.sin(theta) * radius)));
    ++i;
  }
  center = new Particle(origin);
  composite.particles.push(center);
  i = 0;
  while (i < segments) {
    composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[(i + 1) % segments], treadStiffness));
    composite.constraints.push(new DistanceConstraint(composite.particles[i], center, spokeStiffness));
    composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[(i + 5) % segments], treadStiffness));
    ++i;
  }
  composites.push(composite);
  return composite;
};