import { each, Exception, UUID } from "@cc/tools";
import Dep, { popTarget, pushTarget } from "./dep";
import { Callback, Key } from "../commonType";
import { toArray, isObject, isFunction, isString } from "lodash";

// 唯一ID
const WatcherId = new UUID();

class Watcher {
  uuid: string | number | symbol;
  deps: Dep[];

  active: boolean; // 当前的订阅者是否起作用
  getter: object | Function; // 映射关系，可是多重映射关系，当然也可以是一个getter函数
  callback: Function[]; // 当获取了相关结果的时候，将会自动调用的回调函数。
  context: any; // getter调用时候的上下文环境

  lazy: boolean; // 是否支持懒加载
  dirty: boolean; // 懒加载的情况下单签数据是否需要更新

  cache: any; // 缓存结果
  constructor(
    context: any,
    getter: object | Function,
    cb?: Callback | Callback[],
    lazy: boolean = false
  ) {
    this.uuid = WatcherId.get();
    this.deps = [];
    this.active = false;
    this.context = context;
    this.getter = getter;
    this.callback = cb ? toArray(cb) : [];

    this.lazy = lazy; // 默认不进行懒加载
    this.dirty = true;
    this.cache = this.run();
  }

  /**
   * 添加发布内容
   * @param dep
   */
  addDep(dep: Dep) {
    if (!this.deps.find((val) => val.uuid === dep.uuid)) {
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  /**
   * 删除发布内容。
   * @param dep
   */
  remove(dep: Dep) {
    const pos = this.deps.findIndex((val) => val.uuid === dep.uuid);
    if (pos >= 0) {
      this.deps.splice(pos, 1);
      dep.remove(this);
    }
  }

  /**
   * 清除所有的发布内容
   */
  clear() {
    each(this.deps)((dep) => {
      dep.remove(this);
    });
    this.deps = [];
  }

  /**
   * 确定当前的dep的订阅关系
   */
  depend() {
    each(this.deps)((dep) => {
      dep.depend();
    });
  }

  /**
   * 获取对应的内容情况。
   */
  get(getter: object | Function) {
    // 推入当前的订阅者入栈，方便发布者得知订阅对象
    pushTarget(this);
    let result;
    // 如果是对象的情况，对象之中的所有数据定义的如果是数值，则
    if (isObject(getter)) {
      result = {};
      each(getter)((get, key) => {
        result[key] = isFunction(get) // 如果是函数的话，直接调用获取现相关的参数内容。
          ? get.call(this.context)
          : isObject(get) // 如果是对象的话，则进行对其内容的遍历，返回最终结果。
          ? this.get(get)
          : get;
      });
      return result;
    } else if (isFunction(this.getter)) {
      result = (<Function>this.getter).call(this.context);
    } else {
      result = this.getter;
    }
    popTarget();
    return result;
  }

  /**
   * 运行当前的获取方法，更新缓存内容，并调用回调函数。
   */
  run() {
    try {
      if (this.active) {
        // 当前内容订阅者是否运行
        if (this.dirty) {
          // 是否已经更新
          this.dirty = false;
          this.cache = this.get(this.getter);
        }
        // 调用回调函数
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

  // 强制内容更新
  evaluate() {
    this.dirty = true;
    this.run();
  }

  // 上下文内容有更新
  setContext(context: any) {
    this.context = context;
    this.dirty = true;
    this.run();
  }

  // 发布者有更新了
  updated() {
    this.dirty = true;
    if (!this.lazy) {
      this.run();
    }
  }
}

export default Watcher;

export function Watching(
  context: any,
  getter: object | Function,
  cb?: Callback | Callback[],
  lazy: boolean = true
) {
  let watcher;
  if (context instanceof Watcher) {
    watcher = context;
  } else {
    watcher = new Watcher(context, getter, cb, lazy);
  }
  const proxy = {
    get(target: Watcher, key: Key) {
      if (isString(key) && (<string>key).search("origin.") >= 0) {
        // get可以通过origin.来访问原watcher实例原有的参数。
        return target[(<string>key).replace("origin.", "")];
      } else if (isString(key) && (<string>key).toLowerCase() === "origin") {
        // key如果是单独的origin这可以直接获取watcher对象内容
        return target;
      }
      if (target.dirty) {
        target.run();
      }
      // 默认访问cache对象内容。
      return target.cache[key];
    },

    set(target: Watcher, key: Key, value: any) {
      let tar = target.getter;
      let updateGetter = true;
      if (isString(key) && (<string>key).search("origin.") >= 0) {
        // 通过origin.的形式来访问watcher对象本身
        key = (<string>key).replace("origin.", "");
        updateGetter = false;
        tar = target;
      }
      // 默认访问映射表内容
      tar[key] = value;
      if (updateGetter) {
        // 映射表内容修改的话，watcher将会更新，更新形式依据当前的是否懒加载的形式来进行。
        target.updated();
      }
      return true;
    },
  };
  return new Proxy(watcher, proxy);
}
