import { defNoEnum, each, remove } from "@cc/tools";
import { Watching } from "../observer/watcher";
import { isNil, isObject, isFunction, eq } from "lodash";
import { Observing } from "../observer/index";
import { Key } from "../commonType";
import { Combinable } from "../commonType";
import { intoFirst } from "../utils/index";
import { acquistion } from "../config/common";
import {
  CacheWord,
  ContextWord,
  ImplyWord,
  RepresentWord,
} from "../config/keyWord";

/**
 * 参数对象, 不同的参数对象之间有相关性，通过发布订阅模式进行内容的关联。
 *
 * 1. imply: 当前对象的订阅者代理，记录了当前对象之中的原有映射，以及反馈映射之后的结果。
 * 2. cache: 结果缓存对象（发布者原对象的代理），可以作为下游parameter或者其他watcher的订阅对象。
 */
class Parameter {
  imply: object; // 原数据表
  cache: object; // 最终结果对象。

  constructor(origin: object, context?: any) {
    defNoEnum(this, {
      imply: this.initWatcher(origin, context),
      cache: null, // 开始的时候还没有结果。
    });
  }

  /**
   * 初始化当对象的订阅形式。
   * @param implying 映射关系对象或者getter方法。
   * @param context 当前watcher的上下文内容。
   */
  private initWatcher(implying: object, context?: any) {
    return Watching(context || implying, implying, (result: object) => {
      // 初始化结果对象
      if (isNil(this.cache)) this.cache = {};

      if (this.cache instanceof Proxy) {
        const keys = Object.keys(this.cache);
        each(result)((val, key) => {
          if (!eq(this.cache[key], val)) this.cache[key] = val; // 两值不相同的情况下
          remove(keys, (k) => k === key);
        });
        if (keys.length > 0) {
          // 删除多余的展示内容。
          each(keys)((key) => {
            delete this.cache[key];
          });
        }
      } else {
        this.cache = result;
      }
    });
  }

  /**
   * 更新当前parameter依据的上下文环境。
   * @param para 发布对象
   */
  booking(para?: Parameter) {
    para.subscribe(this.imply);
  }

  notifier() {
    if (!(this.cache instanceof Proxy)) {
      // 当前cache作为变动关联上游。
      this.cache = Observing(this.cache);
    }
  }

  /**
   * 确定下游变动 或者 组装当前cache为发布者。
   * @param watcher 订阅对象订阅可观察者
   */
  subscribe(watcher?: object) {
    this.notifier();
    watcher && (watcher[ContextWord] = this.cache); // 修改订阅内容的相关上下文环境。
  }

  /**
   * 更新映射表内容
   * @param key 对应字段
   * @param imply 字段新参数
   */
  represent(key: string, imply: any);
  represent(key: object | Function, imply?: never);
  represent(key: Combinable, imply: Combinable) {
    if (isObject(key) || isFunction(key)) {
      this.imply[RepresentWord] = key;
    } else {
      this.imply[key] = imply;
    }
  }
}

export function toParameter(origin: object, context?: any) {
  const parameter = new Parameter(origin, context);
  const CustomHandler = {
    set(target: Parameter, key: Key, value: any) {
      const IMPLY = CacheWord;
      if (intoFirst(key, IMPLY + ".")) {
        return (target.cache[key.toString().replace(IMPLY + ".", "")] = value);
      } else {
        return (target.imply[key] = value); // 默认情况调用当前imply对象对当前的映射进行设置。
      }
    },
    get(target: Parameter, key: Key) {
      const IMPLY = ImplyWord;
      if (intoFirst(key, IMPLY + ".")) {
        // 当前情况返回原有的映射关系内容
        return target.imply[key.toString().replace(IMPLY + ".", "")];
      } else {
        // 默认情况下返回原有的数据内容。
        return target.cache[key];
      }
    },
  };
  return acquistion(parameter, CustomHandler);
}
