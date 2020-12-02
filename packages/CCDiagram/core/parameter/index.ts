import { defNoEnum, each, remove } from "@cc/tools";
import { Watching } from "../observing/watcher";
import { isNil, isObject, isFunction } from "lodash";
import Watcher from "../observing/watcher";
import Observer from "../observing/index";
import { Key } from "../commonType";
import { Combinable } from "../commonType";

/**
 * 参数对象
 * 1. 可以是订阅者，同时也可以发布者。
 * 2. 对象可以直接获取到相关的数据资源。
 */
class Parameter {
  _imply: object; // 映射关系维护表

  _cache: object; // 最终获取到的结果。
  constructor(origin: object, context?: any) {
    defNoEnum(this, {
      _imply: this.initWatcher(origin, context),
      _cache: null, // 开始的时候还没有结果。
    });
  }

  /**
   * 初始化当对象的订阅形式。
   * @param implying 映射关系对象或者getter方法。
   * @param context 当前watcher的上下文内容。
   */
  private initWatcher(implying: object, context?: any) {
    return Watching(context || implying, implying, (result: object) => {
      if (isNil(this._cache)) this._cache = {};
      const keys = Object.keys(this._cache);
      each(result)((val, key) => {
        this._cache[key] = val;
        remove(keys, (k) => k === key);
      });
      if (keys.length > 0) {
        // Delete redundant variable
        each(keys)((key) => {
          delete this._cache[key];
        });
      }
    });
  }

  /**
   * 当前对象作为订阅者，订阅传递的发布内容。
   * @param para 发布对象
   */
  watching(para?: Parameter) {
    para.subscribe(this._imply["origin"]);
  }

  /**
   * 更新映射表内容
   * @param key 对应字段
   * @param imply 字段新参数
   */
  implyUpdate(key: string, imply: any);
  implyUpdate(key: object | Function, imply?: never);
  implyUpdate(key: Combinable, imply: Combinable) {
    let updated;
    if (isObject(key) || isFunction(key)) {
      this._imply["_getter"] = key;
    } else {
      this._imply[key] = imply;
    }
    this._imply["origin"].getterUpdate(updated);
  }

  /**
   * 订阅者更新observer
   * @param watcher 订阅对象订阅可观察者
   */
  subscribe(watcher: Watcher) {
    if (!(this._cache instanceof Proxy)) {
      // 说明当前的_cache没有被代理，即当前对象不可被订阅
      this._cache = new Observer(this._cache).obsever;
    }
    watcher.contextUpdate(this._cache);
  }
}

export function toParameter(origin: object, context?: any) {
  const parameter = new Parameter(origin, context);
  const handlers = {
    set(target: Parameter, key: Key, value: any) {
      if (key.toString().search("origin.") >= 0) {
        // origin.开始的key对Parameter本身进行操作，否则对_imply进行操作。
        return (target[key.toString().replace("origin.", "")] = value);
      } else {
        return (target._imply[key] = value);
      }
    },
    get(target: Parameter, key: Key) {
      if (key.toString() === "origin") {
        // key为origin的时候返回parameter实例
        return target;
      } else if (key.toString() === "_cache") {
        return target._cache;
      } else {
        // 返回当前的_cache之中的内容。
        return target._cache[key];
      }
    },
  };
  return new Proxy(parameter, handlers);
}
