import { each, UUID } from "@cc/tools";
import Watcher from "./watch";

const DepId = new UUID();

class Dep {
  static target: Watcher = null;

  uuid: string | number | symbol;
  sub: Watcher[];
  constructor() {
    this.uuid = DepId.get();
    this.sub = [];
  }

  addSub(watcher: Watcher) {
    if (!this.sub.find((val) => val.uuid === watcher.uuid))
      this.sub.push(watcher);
  }

  remove(watcher: Watcher) {
    const pos = this.sub.findIndex((val) => val.uuid === watcher.uuid);
    return pos >= 0 ? this.sub.splice(pos, 1) : void 0;
  }

  clear() {
    each(this.sub)((watcher) => {
      watcher.removeDep(this);
    });
    this.sub = [];
  }

  depend() {
    if (!Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    each(this.sub)((watcher) => {
      watcher.updated();
    });
  }
}

Dep.target = null;
const targetStack = [];

export function pushTarget(watcher: Watcher) {
  targetStack.push(watcher);
  Dep.target = watcher;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

export default Dep;
