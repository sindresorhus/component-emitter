# event-e3

Event Emitter 3

## Installation

```
npm i event-e3
```

## import

```js
import Emitter from "event-e3";
```

## API

### Emitter(obj)

  As an `Emitter` instance:

```js
const emitter = new Emitter();
emitter.emit('new value', 5);
```

  As a mixin:

```js
const user = { name: 'tobi' };
Emitter(user);

user.emit(`I'm a user`, true);
```

### Emitter#on(event, fn)

  Register an `event` handler `fn`.

### Emitter#once(event, fn)

  Register a single-shot `event` handler `fn`,
  removed immediately after it is invoked the
  first time.

### Emitter#off(event, fn)

  * Pass `event` and `fn` to remove a listener.
  * Pass `event` to remove all listeners on that event.
  * Pass nothing to remove all listeners on all events.

### Emitter#emit(event, ...)

  Emit an `event` with any amount of arguments.

### Emitter#listeners(event)

  Return an array of callbacks, or an empty array.

### Emitter#hasListeners(event)

  True if this emitter has any `event` handlers.

### Emitter#eventNames()

  Returns an array listing the events for which the emitter has registered listeners.

## Tests

`npm t`

## License

MIT
