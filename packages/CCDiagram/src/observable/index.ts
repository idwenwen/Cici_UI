import { each, Exception } from "@cc/tools";
import Dep from "./dep";
import { isObject, isArray, eq } from "lodash";
import { key } from "./typeDeclare";

const DefaultOperation = (observer: Observer) => {
  return {
    set(target: object, key: key, value: any) {
      let notify = false;
      if (!eq(target[key], value)) {
        target[key] = value; // When value changed will notify dep
        notify = true;
      } else if (!target[key]) {
        // Will obsering current new value
        if (isObject(key) || isArray(key)) value = observer.obser(value);
        target[key] = value;
        notify = true;
      }
      if (notify) {
        observer.notify();
        return !!value;
      }
      return false;
    },

    delete(target: any, key: key) {
      let result;
      try {
        if (Array.isArray(target)) {
          result = target.splice(<number>key, 1);
        } else if (isObject(target)) {
          result = delete target[key];
        } else {
          throw new Exception(
            "CannotDelete",
            `Cannot delete ${key.toString()} from ${target}`,
            Exception.level.Warn,
            false
          );
        }
        observer.notify();
        return result;
      } finally {
        return false;
      }
    },

    defineProperty(target: any, key: key, descriptor: PropertyDescriptor) {
      if (isObject(descriptor.value) || isArray(descriptor.value)) {
        descriptor.value = observer.obser(descriptor.value);
      }
      const res = Reflect.defineProperty(target, key, descriptor);
      observer.notify();
      return res;
    },

    get(target: any, key: key) {
      const val = target[key];
      if (Dep.target) {
        // When watcher getter current value, will added to dep
        observer.depend();
      }
      return val;
    },
  };
};

/**
 * Setting as observer for object which can be watched by watcher.
 * watcher will updated automatically by observer change
 */
class Observer {
  dep: Dep;
  obsever: any;
  _origin: any;
  constructor(observed: object) {
    this.dep = new Dep();
    this._origin = observed; // original observer
    this.obsever = this.obser(observed);
  }

  obser(observed: object) {
    const copy = Object.assign({}, observed);
    each(copy)((val, key) => {
      if (isObject(val) || isArray(val)) {
        copy[key] = this.obser(val); // Object observing
      }
    });
    return new Proxy(copy, DefaultOperation(this));
  }

  notify() {
    this.dep.notify();
  }

  depend() {
    this.dep.depend();
  }

  clear() {
    this.dep.clear();
  }
}

export default Observer;

export function Observing(observed: object) {
  const obser = new Observer(observed);
  return obser.obsever;
}
