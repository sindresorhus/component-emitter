import Emitter from '../EventEmitter3.mjs';
import assert from 'assert'
import 'mjs-mocha';

function Custom() {
  Emitter.call(this)
}

Custom.prototype.__proto__ = Emitter.prototype;

describe('Prototype inheritance', function(){
  describe('with Emitter.call(this)', function(){
    it('should work', function(done) {
      /* done is undefined
      https://github.com/vpotseluyko/mjs-mocha/blob/master/src/mocha.mjs#L38
      */
      let run = false

      var emitter = new Custom();
      emitter.on('foo', () => {
        run = true
      });
      emitter.emit('foo');

      assert.deepEqual(run, true);
    })
  })
})

describe('Emitter', function(){
  describe('.on(event, fn)', function(){
    it('should add listeners', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.on('foo', function(val){
        calls.push('one', val);
      });

      emitter.on('foo', function(val){
        calls.push('two', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('bar', 1);
      emitter.emit('foo', 2);

      assert.deepEqual(calls, [ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ]);
    })

    it('should add listeners for events which are same names with methods of Object.prototype', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.on('constructor', function(val){
        calls.push('one', val);
      });

      emitter.on('__proto__', function(val){
        calls.push('two', val);
      });

      emitter.emit('constructor', 1);
      emitter.emit('__proto__', 2);

      assert.deepEqual(calls, [ 'one', 1, 'two', 2 ]);
    })
  })

  describe('.once(event, fn)', function(){
    it('should add a single-shot listener', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.once('foo', function(val){
        calls.push('one', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('foo', 2);
      emitter.emit('foo', 3);
      emitter.emit('bar', 1);

      assert.deepEqual(calls, [ 'one', 1 ]);
    })
  })

  describe('.off(event, fn)', function(){
    it('should remove a listener', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo', two);

      emitter.emit('foo');

      assert.deepEqual(calls, [ 'one' ]);
    })

    it('should work with .once()', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }

      emitter.once('foo', one);
      emitter.once('fee', one);
      emitter.off('foo', one);

      emitter.emit('foo');

      assert.deepEqual(calls, []);
    })

    it('should work when called from an event', function(){
      var emitter = new Emitter
        , called
      function b () {
        called = true;
      }
      emitter.on('tobi', b);
      emitter.on('tobi', function () {
        emitter.off('tobi', b);
      });

      emitter.emit('tobi');
      assert.equal(called, true);
      called = false;
      emitter.emit('tobi');
      assert.equal(called, false);
    });
  })

  describe('.off(event)', function(){
    it('should remove all listeners for an event', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo');

      emitter.emit('foo');
      emitter.emit('foo');

      assert.deepEqual(calls, []);
    })

    it('should remove event array to avoid memory leak', function() {
      var emitter = new Emitter;

      function cb() {}

      emitter.on('foo', cb);
      emitter.off('foo', cb);

      // because it has no prototype
      assert.equal(emitter.hasListeners('foo'), false);
    })

    it('should only remove the event array when the last subscriber unsubscribes', function() {
      var emitter = new Emitter;

      function cb1() {}
      function cb2() {}

      emitter.on('foo', cb1);
      emitter.on('foo', cb2);
      emitter.off('foo', cb1);

      assert.equal(emitter.hasListeners('foo'), true);
    })
  })

  describe('.off()', function(){
    it('should remove all listeners', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('bar', two);

      emitter.emit('foo');
      emitter.emit('bar');

      emitter.off();

      emitter.emit('foo');
      emitter.emit('bar');

      assert.deepEqual(calls, ['one', 'two'])
    })
  })

  describe('.listeners(event)', function(){
    describe('when handlers are present', function(){
      it('should return an array of callbacks', function(){
        var emitter = new Emitter;
        function foo(){}
        emitter.on('foo', foo);
        assert.deepEqual(emitter.listeners('foo'), [foo]);
      })
    })

    describe('when no handlers are present', function(){
      it('should return an empty array', function(){
        var emitter = new Emitter;
        assert.deepEqual(emitter.listeners('foo'), []);
      })
    })
  })

  describe('.hasListeners(event)', function(){
    describe('when handlers are present', function(){
      it('should return true', function(){
        var emitter = new Emitter;
        emitter.on('foo', function(){});
        assert.equal(emitter.hasListeners('foo'), true);
      })
    })

    describe('when no handlers are present', function(){
      it('should return false', function(){
        var emitter = new Emitter;
        assert.equal(emitter.hasListeners('foo'), false);
      })
    })
  })
})

describe('Emitter(obj)', function(){
  it('should mixin', function(){
    var calls = [];

    var proto = {};
    Emitter(proto);
    proto.on('something', function() {
      calls.push(7);
    });
    proto.emit('something');

    assert.deepEqual(calls, [7]);
  })


  describe('prototype mixin is available in this version https://github.com/GrosSacASac/emitter/releases/tag/1.3.7', function(){
	  it('should work on instances', function(){
      var User = function (name, age = 18) {
        this.age = age;
        // this.name = name;
      };
      Emitter(User.prototype);

      const julie = new User('Julie');

      julie.on('birthday', function() {
        julie.age++;
      });
      julie.emit('birthday');

      assert.equal(julie.age, 19);
	  })

    it('should work separately on many instances', function() {
      var User = function (name, age = 18) {
        this.age = age;
      };
      Emitter(User.prototype);

      const julie = new User('Julie');
      const moritz = new User('Moritz');

      julie.on('birthday', function() {
        julie.age++;
      });
      moritz.on('birthday', function() {
        moritz.age++;
      });
      julie.emit('birthday');

      assert.equal(julie.age, 19);
      assert.equal(moritz.age, 19, 'it was not the birthday of Moritz');
    })

    it('should work separately on instance and constructor', function() {
      var User = function (name, age = 18) {
        this.age = age;
      };
      Emitter(User.prototype);
      var age = 1000;
      const julie = new User('Julie');

      julie.on('birthday', function() {
        julie.age++;
      });
      User.prototype.on('birthday', function() {
        age++;
      });
      User.prototype.emit('birthday');

      assert.equal(julie.age, 19);
      assert.equal(age, 1001);

      julie.emit('birthday');
      assert.equal(julie.age, 20);
      assert.equal(age, 1002);
    })
  })
})
