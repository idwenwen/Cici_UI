import { defNoEnum, each, Exception, UUID } from "@cc/tools";
import Dep, { popTarget, pushTarget } from "./dep";
import { Callback, Key } from "../core_v2/commonType";
import { toArray, isObject, isFunction, isString } from "lodash";
import { eq } from "lodash";
import { into, intoFirst, is } from "../utils/index";
import { acquistion } from "../core_v2/config/common";
import Observer from "./index";

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

  cache: object; // 缓存结果
  constructor(
    context: any,
    getter: object | Function,
    cb?: Callback | Callback[],
    lazy: boolean = false
  ) {
    // 当前对象之中的变量，除cache之外不可对外，不可遍历
    defNoEnum(this, {
      uuid: WatcherId.get(),
      deps: [],
      active: false,
      context: context,
      getter: getter,
      callback: cb ? toArray(cb) : [],

      lazy: lazy,
      dirty: true,
    });
    this.run(); //内容可以进行对外获取以及
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
          // 更新之后调用回调函数
          if (this.callback.length > 0) {
            each(this.callback)((cb) => {
              cb.call(this.context, this.cache);
            });
          }
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

  // 上下文内容有更新, 同时原有dep将会被重置
  env(context: any) {
    if (!eq(context, this.context)) {
      this.clear(); // 清除旧的依赖，并重新运行当前watcher
      this.context = context;
      this.evaluate();
    }
  }

  // 完全更新getter对象内容。则自动重新获取cache内容，同时也影响相关的关联关系。
  represent(getter: object | Function) {
    this.clear();
    this.getter = getter;
    this.evaluate();
  }

  // 发布者有更新了
  updated() {
    this.dirty = true;
    if (!this.lazy) {
      this.run();
    }
  }

  // 当前watcher是否启用
  able() {
    this.active = true;
  }
  disable() {
    this.active = false;
  }
}

export default Watcher;

/**
 * 创建watcher并进行代理，方便使用者方便的获取watcher的内容，同时限定了对外公开的内容。
 * @param context 上下文环境或者watcher对象内容
 * @param getter 对应的映射方法
 * @param cb 反馈函数内容
 * @param lazy 当前watcher是否是懒加载
 */
export function Watching(
  context: any,
  getter: object | Function,
  cb?: Callback | Callback[],
  lazy: boolean = true
) {
  // Watcher对象内容
  const watcher =
    context instanceof Watcher
      ? context
      : new Watcher(context, getter, cb, lazy);

  // 代理情况
  const CustomHandler = {
    get(target: Watcher, key: Key) {
      target.run();
      // 默认访问cache对象内容。
      return target.cache[key];
    },

    set(target: Watcher, key: Key, value: any) {
      const CONTEXT = "context$";
      const GETTER = "represent$";

      if (is(key, CONTEXT)) {
        // 修改上下文内容。
        target.env(value);
      } else if (is(key, GETTER)) {
        // 单次统一修改映射表内容
        if (isObject(value) || isFunction(value)) {
          target.represent(value);
        }
      } else if (isFunction(target.getter)) {
        if (isObject(value) || isFunction(value)) {
          target.represent(value);
          // 由于对于当前内容有修改，所以强制更新一次
        }
      } else {
        target.getter[key] = value;
        target.evaluate();
      }
      return true;
    },
  };
  return acquistion(watcher, CustomHandler);
}
