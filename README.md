verlet-js
=========

A simple Verlet (pronounced 'ver-ley') physics engine written in javascript.

Particles, distance constraints, and angular constraints are all supported by verlet-js.  From these primitives it is possible to construct just about anything you can imagine.

License
-------
You may use verlet-js under the terms of the MIT License (See [LICENSE](LICENSE)).


Examples
--------
1. [Shapes (verlet-js Hello world)](http://subprotocol.com/verlet-js/examples/shapes.html)
2. [Fractal Trees](http://subprotocol.com/verlet-js/examples/tree.html)
3. [Cloth](http://subprotocol.com/verlet-js/examples/cloth.html)
4. [Spiderweb](http://subprotocol.com/verlet-js/examples/spiderweb.html)


Code Layout
-----------
1. js/verlet-js/vec2.js: _2d vector implementation_
2. js/verlet-js/constraint.js: _constraint code_
3. js/verlet-js/verlet.js: _verlet-js engine_
4. js/verlet-js/objects.js: _shapes and objects (triangles, circles, tires..)_

Build for npm
-------------

``` js
npm run build
```

