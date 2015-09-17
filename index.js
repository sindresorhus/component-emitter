
/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

var EVENT_SEPARATOR = " ";
/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  event = event.push ? event : event.split(EVENT_SEPARATOR);
  for (var i = 0, len = event.length; i < len; i++) {
    this._addOneEventListener(event[i], fn)
  }
};

Emitter.prototype._addOneEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
      .push(fn);
  return this;  
};
/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  if (!this._callbacks) {
    return this;
  }
  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }
  event = event.push ? event : event.split(EVENT_SEPARATOR);
  for (var i = 0, len = event.length; i < len; i++) {
    this._removeOneEventListener(event[i], fn)
  }
  return this;
};

Emitter.prototype._removeOneEventListener = function(event, fn){
  if (!this._callbacks) {
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (!fn) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

var ALL = "*";
var callAll = function(callbacks, target, args) {
  if (!callbacks) {
    return;
  }
  callbacks = callbacks.slice(0);
  for (var i = 0, len = callbacks.length; i < len; ++i) {
    callbacks[i].apply(target, args);
  }
}
/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.trigger = 
Emitter.prototype.triggerHandler = 
Emitter.prototype.dispatchEvent = 
Emitter.prototype.emit = function(event){
  if (!this._callbacks) {
    return;
  }

  // remove the first argument which is the event type or the event object
  var args = [].slice.call(arguments, 1);
  var eventType = event;
  if (event.type) {
    // in case we have to emit an event object
    eventType = event.type;
    event.target = this;
    event.extraParams = event.extraParams || args;
    event.data = event.data || args;
    args.splice(0, 0, event);
  }

  callAll(this._callbacks['$' + eventType], this, args);
  callAll(this._callbacks['$' + ALL], this, args);
  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};
