import { each, Exception, UUID } from "@cc/tools";
import Dep, { popTarget, pushTarget } from "./dep";
import { callback, key } from "./typeDeclare";
import { toArray, isObject, isFunction, isString } from "lodash";

const WatcherId = new UUID();

class Watcher {
  uuid: string | number | symbol;
  deps: Dep[];

  active: boolean; // Does current watcher has been disabled
  getter: object | Function; // Imply check
  callback: Function[]; // After get will callback
  context: any; // Container of getter, context for imply

  lazy: boolean; // Will updated getter activily
  dirty: boolean; // Need to updated when is lazy

  cache: any; // Final result from getter
  constructor(
    context: any,
    getter: object | Function,
    cb?: callback | callback[],
    lazy: boolean = true
  ) {
    this.uuid = WatcherId.get();
    this.deps = [];
    this.active = false;
    this.context = context;
    this.getter = getter;
    this.callback = cb ? toArray(cb) : [];

    this.lazy = lazy;
    this.dirty = lazy;
    this.cache = this.run();
  }

  addDep(dep: Dep) {
    if (!this.deps.find((val) => val.uuid === dep.uuid)) {
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  remove(dep: Dep) {
    const pos = this.deps.findIndex((val) => val.uuid === dep.uuid);
    if (pos >= 0) {
      this.deps.splice(pos, 1);
      dep.remove(this);
    }
  }

  clear() {
    each(this.deps)((dep) => {
      dep.remove(this);
    });
    this.deps = [];
  }

  depend() {
    each(this.deps)((dep) => {
      dep.depend();
    });
  }

  get() {
    pushTarget(this);
    let result;
    if (isObject(this.getter)) {
      result = {};
      each(this.getter)((get, key) => {
        result[key] = isFunction(get) ? get.call(this.context) : get;
      });
      this.cache = result;
    } else if (isFunction(this.getter)) {
      result = (<Function>this.getter).call(this.context);
    } else {
      result = this.getter;
    }
    this.cache = result;
    popTarget();
  }

  run() {
    try {
      if (this.active) {
        this.get(); // get current value
        if (this.callback.length > 0) {
          each(this.callback)((cb) => {
            cb.call(this.context, this.cache);
          });
        }
      } else {
        throw new Exception(
          "UnactiveWatcher",
          "Current watcher is not working",
          Exception.level.Warn,
          false
        );
      }
    } finally {
      void 0;
    }
  }

  evaluate() {
    this.run();
  }

  setContext(context: any) {
    this.context = context;
    this.run();
  }

  updated() {
    if (this.lazy) this.dirty = true;
    else this.run();
  }
}

export default Watcher;

export function Watching(
  context: any,
  getter: object | Function,
  cb?: callback | callback[],
  lazy: boolean = true
) {
  let watcher;
  if (context instanceof Watcher) {
    watcher = context;
  } else {
    watcher = new Watcher(context, getter, cb, lazy);
  }
  const proxy = {
    get(target: Watcher, key: key) {
      if (isString(key) && (<string>key).search("origin.") >= 0) {
        return target[(<string>key).replace("origin.", "")];
      } else if (isString(key) && (<string>key).toLowerCase() === "origin") {
        return target;
      }
      if (target.dirty) {
        target.run();
      }
      return target.cache[key];
    },

    set(target: Watcher, key: key, value: any) {
      let tar = target.getter;
      let updateGetter = true;
      if (isString(key) && (<string>key).search("origin.") >= 0) {
        key = (<string>key).replace("origin.", "");
        updateGetter = false;
        tar = target;
      }
      tar[key] = value;
      if (updateGetter) {
        target.run();
      }
      return true;
    },
  };
  return new Proxy(watcher, proxy);
}
