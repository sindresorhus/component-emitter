function Emitter(object) {
	if (object) {
		return mixin(object);
	}

	this._callbacks = {};
}

function mixin(object) {
	Object.assign(object, Emitter.prototype);
	object._callbacks = {};
	return object;
}

Emitter.prototype.on = function (event, listener) {
	(this._callbacks['$' + event] = this._callbacks['$' + event] ?? []).push(listener);
	return this;
};

Emitter.prototype.once = function (event, listener) {
	const on = (...arguments_) => {
		this.off(event, on);
		listener.apply(this, arguments_);
	};

	on.fn = listener;
	this.on(event, on);
	return this;
};

Emitter.prototype.off = function (event, listener) {
	// No arguments: remove all callbacks
	if (event === undefined && listener === undefined) {
		this._callbacks = {};
		return this;
	}

	// Only event specified: remove all listeners for that event
	if (listener === undefined) {
		delete this._callbacks['$' + event];
		return this;
	}

	// Both event and listener specified: remove the specific listener
	const callbacks = this._callbacks['$' + event];
	if (callbacks) {
		for (const [index, callback] of callbacks.entries()) {
			if (callback === listener || callback.fn === listener) {
				callbacks.splice(index, 1);
				break;
			}
		}

		// Clean up if no more listeners remain for the event
		if (callbacks.length === 0) {
			delete this._callbacks['$' + event];
		}
	}

	return this;
};

Emitter.prototype.emit = function (event, ...arguments_) {
	let callbacks = this._callbacks['$' + event];
	if (callbacks) {
		callbacks = [...callbacks];
		for (const callback of callbacks) {
			callback.apply(this, arguments_);
		}
	}

	return this;
};

Emitter.prototype.listeners = function (event) {
	return this._callbacks['$' + event] ?? [];
};

Emitter.prototype.hasListeners = function (event) {
	return this.listeners(event).length > 0;
};

// Aliases
Emitter.prototype.addEventListener = Emitter.prototype.on;
Emitter.prototype.removeListener = Emitter.prototype.off;
Emitter.prototype.removeEventListener = Emitter.prototype.off;
Emitter.prototype.removeAllListeners = Emitter.prototype.off;

if (typeof module !== 'undefined') {
	module.exports = Emitter;
}
