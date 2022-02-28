export class Emitter {
  get event() {
    if (!this._event) {
      this._event = (listener, thisArgs) => {
        if (!this._listeners) {
          this._listeners = [];
        }
        const index = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
        const result = () => {
          if (!this._disposed) {
            this._listeners.splice(index, 1);
          }
        }
        return result;
      }
    }
    return this._event
  }

	/**
	 * 
	 * @param  {...any} cbArgs callback function arguments 
	 */
  fire(...cbArgs) {
    if (this._listeners) {
      if (!this._deliveryQueue) {
        this._deliveryQueue = [];
      }
      for (let i = 0; i < this._listeners.length; i++) {
        this._deliveryQueue.push([this._listeners[i], cbArgs])
      }
      while (this._deliveryQueue.length > 0) {
        const [listener, args] = this._deliveryQueue.shift();
        // TODO: preserve try catch.
        // try {
          if (typeof listener === 'function') {
            listener.call(undefined, args[0], args[1], args[2], args[3]);
          } else {
            listener.call(listener[1], args[0], args[1], args[2], args[3]);
          }
        // } catch (e) {
          // unexpected error!
          // console.log(e)
        // }
      }
    }
  }

  clear() {
    if (!this._disposed) {
      this._disposed = true;
      this._listeners.splice(0, this._listeners.length);
      this._deliveryQueue.splice(0, this._deliveryQueue.length);
    }
  }
}

const fbEvents = {}
const globalVar = Function("return this")();

export function registerCallback(name, listener, thisArgs) {
  if (!fbEvents[name]) {
    const eventEmitter = fbEvents[name] = new Emitter();
    globalVar[name] = function (a, b, c, d) {
      eventEmitter.fire(a, b, c, d);
      if (name === "on_mouse_rbtn_up") {
        return true;
      }
    }
  }
  fbEvents[name].event(listener, thisArgs);
}