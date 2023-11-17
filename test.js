const test = require('ava');
const Emitter = require('./index.js');

function Custom() {
	Emitter.call(this);
}

Object.setPrototypeOf(Custom.prototype, Emitter.prototype);

test('Custom emitter extends base Emitter', t => {
	t.plan(1);

	const emitter = new Custom();

	emitter.on('foo', () => {
		t.pass();
	});

	emitter.emit('foo');
});

test('Emitter.on adds listeners to events', t => {
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

test('Emitter.once adds a single-shot listener', t => {
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

test('Emitter.off removes a specified listener from an event', t => {
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

test('Emitter.off works with Emitter.once', t => {
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

test('Emitter.off works when called from within an event emission', t => {
	let isCalled = false;
	const emitter = new Emitter();

	function b() {
		isCalled = true;
	}

	emitter.on('tobi', () => {
		emitter.off('tobi', b);
	});

	emitter.on('tobi', b);
	emitter.emit('tobi');
	t.true(isCalled);
	isCalled = false;
	emitter.emit('tobi');
	t.false(isCalled);
});

test('Emitter.off removes all listeners for a specified event', t => {
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

test('Emitter.off with no arguments removes all listeners', t => {
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

test('Emitter.listeners returns callbacks for a specified event', t => {
	const emitter = new Emitter();
	function foo() {}

	emitter.on('foo', foo);
	t.deepEqual(emitter.listeners('foo'), [foo]);
});

test('Emitter.listeners returns an empty array for events without handlers', t => {
	const emitter = new Emitter();
	t.deepEqual(emitter.listeners('foo'), []);
});

test('Emitter.hasListeners returns true when handlers are present for an event', t => {
	const emitter = new Emitter();
	emitter.on('foo', () => {});
	t.true(emitter.hasListeners('foo'));
});

test('Emitter.hasListeners returns false for events without handlers', t => {
	const emitter = new Emitter();
	t.false(emitter.hasListeners('foo'));
});

test('Mixin functionality with Emitter(object) works as expected', t => {
	t.plan(1);

	const proto = {};

	Emitter(proto); // eslint-disable-line new-cap

	proto.on('something', () => {
		t.pass();
	});

	proto.emit('something');
});

test.failing('Listener removal during emit should not be called', t => {
	const emitter = new Emitter();
	let isCalled = false;

	function listener() {
		emitter.off('foo', listener);
		isCalled = true;
	}

	emitter.on('foo', listener);
	emitter.emit('foo');
	emitter.emit('foo'); // Second emit to test if listener is called again

	t.false(isCalled);
});

test('Emitting an event without listeners does not cause errors', t => {
	const emitter = new Emitter();
	t.notThrows(() => {
		emitter.emit('foo');
	});
});

test('Removing a non-existent listener does not cause issues', t => {
	const emitter = new Emitter();
	t.notThrows(() => {
		emitter.off('foo', () => {});
	});
});

test('Listeners are called in the order they were added', t => {
	const emitter = new Emitter();
	const calls = [];

	emitter.on('foo', () => {
		calls.push('first');
	});

	emitter.on('foo', () => {
		calls.push('second');
	});

	emitter.emit('foo');

	t.deepEqual(calls, ['first', 'second']);
});

test('Removing a listener multiple times does not cause issues', t => {
	const emitter = new Emitter();
	const listener = () => {};

	emitter.on('foo', listener);
	emitter.off('foo', listener);

	t.notThrows(() => {
		emitter.off('foo', listener);
	});
});

test('Adding the same listener multiple times results in multiple calls', t => {
	const emitter = new Emitter();
	let callCount = 0;
	const listener = () => callCount++;

	emitter.on('foo', listener);
	emitter.on('foo', listener);

	emitter.emit('foo');

	t.is(callCount, 2);
});

test('Method chaining works as expected', t => {
	const emitter = new Emitter();
	const chain = emitter.on('foo', () => {}).once('bar', () => {}).off('baz');
	t.is(chain, emitter);
});

test('Listeners receive correct arguments', t => {
	const emitter = new Emitter();
	let receivedArguments = [];

	emitter.on('foo', (...arguments_) => {
		receivedArguments = arguments_;
	});

	emitter.emit('foo', 'arg1', 'arg2');

	t.deepEqual(receivedArguments, ['arg1', 'arg2']);
});

test('Emitter.once with different events should only remove listener from specific event', t => {
	const emitter = new Emitter();
	let isFooCalled = false;
	let isBarCalled = false;

	const listener = () => {
		isFooCalled = true;
	};

	emitter.once('foo', listener);
	emitter.once('bar', () => {
		isBarCalled = true;
	});

	emitter.emit('bar');
	emitter.emit('foo');

	t.true(isBarCalled);
	t.true(isFooCalled);
});

test('Emitting event with no arguments should not cause errors', t => {
	const emitter = new Emitter();
	t.notThrows(() => {
		emitter.emit('foo');
	});
});

test('Listener addition and removal within another listener', t => {
	const emitter = new Emitter();
	let dynamicListenerCalled = false;

	function dynamicListener() {
		dynamicListenerCalled = true;
	}

	emitter.on('foo', () => {
		emitter.on('bar', dynamicListener);
		emitter.off('bar', dynamicListener);
	});

	emitter.emit('foo');
	emitter.emit('bar');

	t.false(dynamicListenerCalled);
});

test('Emitting an event with multiple arguments should pass all arguments to listeners', t => {
	const emitter = new Emitter();
	let receivedArguments = [];

	emitter.on('foo', (...arguments_) => {
		receivedArguments = arguments_;
	});

	emitter.emit('foo', 'arg1', 'arg2', 'arg3');

	t.deepEqual(receivedArguments, ['arg1', 'arg2', 'arg3']);
});

test('Alias methods should work as expected', t => {
	const emitter = new Emitter();
	let isCalled = false;

	function listener() {
		isCalled = true;
	}

	emitter.addEventListener('foo', listener);
	emitter.emit('foo');
	t.true(isCalled);

	isCalled = false;
	emitter.removeEventListener('foo', listener);
	emitter.emit('foo');
	t.false(isCalled);
});
