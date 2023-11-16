const test = require('ava');
const Emitter = require('./index.js');

function Custom() {
	Emitter.call(this);
}

Object.setPrototypeOf(Custom.prototype, Emitter.prototype);

test('Custom Emitter: should work with Emitter.call(this)', t => {
	t.plan(1);
	const emitter = new Custom();
	emitter.on('foo', () => t.pass());
	emitter.emit('foo');
});

test('Emitter: .on(event, fn) should add listeners', t => {
	const emitter = new Emitter();
	const calls = [];

	emitter.on('foo', value => {
		calls.push('one', value);
	});

	emitter.on('foo', value => {
		calls.push('two', value);
	});

	emitter.emit('foo', 1);
	emitter.emit('bar', 1);
	emitter.emit('foo', 2);

	t.deepEqual(calls, ['one', 1, 'two', 1, 'one', 2, 'two', 2]);
});

test('Emitter: .on(event, fn) should handle Object.prototype method names', t => {
	const emitter = new Emitter();
	const calls = [];

	emitter.on('constructor', value => {
		calls.push('one', value);
	});

	emitter.on('__proto__', value => {
		calls.push('two', value);
	});

	emitter.emit('constructor', 1);
	emitter.emit('__proto__', 2);

	t.deepEqual(calls, ['one', 1, 'two', 2]);
});

test('Emitter: .once(event, fn) should add a single-shot listener', t => {
	const emitter = new Emitter();
	const calls = [];

	emitter.once('foo', value => {
		calls.push('one', value);
	});

	emitter.emit('foo', 1);
	emitter.emit('foo', 2);
	emitter.emit('foo', 3);
	emitter.emit('bar', 1);

	t.deepEqual(calls, ['one', 1]);
});

test('Emitter: .off(event, fn) should remove a listener', t => {
	const emitter = new Emitter();
	const calls = [];

	function one() {
		calls.push('one');
	}

	function two() {
		calls.push('two');
	}

	emitter.on('foo', one);
	emitter.on('foo', two);
	emitter.off('foo', two);

	emitter.emit('foo');

	t.deepEqual(calls, ['one']);
});

test('Emitter: .off(event, fn) should work with .once()', t => {
	const emitter = new Emitter();
	const calls = [];

	function one() {
		calls.push('one');
	}

	emitter.once('foo', one);
	emitter.once('fee', one);
	emitter.off('foo', one);

	emitter.emit('foo');

	t.deepEqual(calls, []);
});

test('Emitter: .off(event, fn) should work when called from an event', t => {
	let called = false;
	const emitter = new Emitter();

	function b() {
		called = true;
	}

	emitter.on('tobi', () => {
		emitter.off('tobi', b);
	});

	emitter.on('tobi', b);
	emitter.emit('tobi');
	t.true(called);
	called = false;
	emitter.emit('tobi');
	t.false(called);
});

test('Emitter: .off(event) should remove all listeners for an event', t => {
	const emitter = new Emitter();
	const calls = [];

	function one() {
		calls.push('one');
	}

	function two() {
		calls.push('two');
	}

	emitter.on('foo', one);
	emitter.on('foo', two);
	emitter.off('foo');

	emitter.emit('foo');
	emitter.emit('foo');

	t.deepEqual(calls, []);
});

test('Emitter: .off() should remove all listeners', t => {
	const emitter = new Emitter();
	const calls = [];

	function one() {
		calls.push('one');
	}

	function two() {
		calls.push('two');
	}

	emitter.on('foo', one);
	emitter.on('bar', two);

	emitter.emit('foo');
	emitter.emit('bar');

	emitter.off();

	emitter.emit('foo');
	emitter.emit('bar');

	t.deepEqual(calls, ['one', 'two']);
});

test('Emitter: .listeners(event) should return callbacks when present', t => {
	const emitter = new Emitter();
	function foo() {}

	emitter.on('foo', foo);
	t.deepEqual(emitter.listeners('foo'), [foo]);
});

test('Emitter: .listeners(event) should return an empty array when no handlers are present', t => {
	const emitter = new Emitter();
	t.deepEqual(emitter.listeners('foo'), []);
});

test('Emitter: .hasListeners(event) should return true when handlers are present', t => {
	const emitter = new Emitter();
	emitter.on('foo', () => {});
	t.true(emitter.hasListeners('foo'));
});

test('Emitter: .hasListeners(event) should return false when no handlers are present', t => {
	const emitter = new Emitter();
	t.false(emitter.hasListeners('foo'));
});

test('Mixin with Emitter(obj) should work', t => {
	t.plan(1);
	const proto = {};
	Emitter(proto); // eslint-disable-line new-cap
	proto.on('something', () => t.pass());
	proto.emit('something');
});
