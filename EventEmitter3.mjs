/**
 * Use it as a constructor
 * or as a decorator for an existing object
 * cannot be used as a mixin for a constructor's prototype
 * @api public
 */

function EventEmitter3(obj) {
  (obj || this)._callbacks = Object.create(null);
  if (obj) return Object.assign(obj, EventEmitter3.prototype);
};

/**
 * Listen on the given `event` with `fn`
 *
 * @param {String} event
 * @param {Function} fn
 * @return {EventEmitter3}
 * @api public
 */

EventEmitter3.prototype.on =
EventEmitter3.prototype.addEventListener = function(event, fn){
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked once then removed
 *
 * @param {String} event
 * @param {Function} fn
 * @return {EventEmitter3}
 * @api public
 */

EventEmitter3.prototype.once = function(event, fn){
  function on(...args) {
    this.off(event, on);
    fn.apply(this, args);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove callback for `event` or
 * all callbacks for `event` or
 * all callbacks for all events
 *
 * @param {String} event
 * @param {Function} fn
 * @return {EventEmitter3}
 * @api public
 */

EventEmitter3.prototype.off =
EventEmitter3.prototype.removeListener =
EventEmitter3.prototype.removeAllListeners =
EventEmitter3.prototype.removeEventListener = function(event, fn){
  // all
  if (!event) {
    this._callbacks = Object.create(null);
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (!fn) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var index = callbacks.findIndex(function (cb) {
      return (cb === fn || cb.fn === fn)
  });
  if (index > -1) {
      callbacks.splice(index, 1);
  }

  // Remove event specific arrays for the event type that no
  // one is subscribed for, to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks[event];
  }

  return this;
};

/**
 * Emit `event` with args
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {EventEmitter3}
 */

EventEmitter3.prototype.emit = function(event, ...args){
  var callbacks = this._callbacks[event];

  if (!callbacks) {
      return;
  }
  var frozenCallbacks = Array.from(callbacks);
  frozenCallbacks.forEach(callback => {
      callback.apply(this, args);
  })

  return this;
};

/**
 * Return array of callbacks for `event`
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

EventEmitter3.prototype.listeners = function(event){
  return this._callbacks[event] || [];
};

/**
 * True if this emitter has `event` handlers
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

EventEmitter3.prototype.hasListeners = function(event){
  return Boolean(this.listeners(event).length);
};

/**
 * Returns an array of events for which the emitter has registered listeners
 *
 * @return {Array}
 * @api public
 */
EventEmitter3.prototype.eventNames = function(){
  return Object.keys(this._callbacks);
}

export default EventEmitter3;
