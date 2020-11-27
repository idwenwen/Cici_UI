import { each, Exception } from "@cc/tools";
import Dep from "./dep";
import { isObject, isArray, eq } from "lodash";
import { Key } from "../commonType";

/**
 * 当前订阅者的代理操作。
 * @param observer 订阅者实例
 */
const DefaultOperation = (observer: Observer) => {
  return {
    // 设置方法代理
    set(target: object, key: Key, value: any) {
      let notify = false; // 是否需要通知
      if (!eq(target[key], value)) {
        target[key] = value; // 当数据与原有数据不相同的时候
        notify = true;
      } else if (!target[key]) {
        // 当数据不在原有对象之中的时候
        if (isObject(key) || isArray(key)) value = observer.obser(value); // 如果数据是对象的话进行监测
        target[key] = value;
        notify = true;
      }
      if (notify) {
        // 发布更新消息
        observer.notify();
        return !!value;
      }
      return false;
    },

    delete(target: any, key: Key) {
      let result;
      try {
        if (Array.isArray(target)) {
          // 当前对象是数组的话
          result = target.splice(<number>key, 1);
        } else if (isObject(target)) {
          // 当前操作对象是对象的话。
          result = delete target[key];
        } else {
          // 出现非数组的情况需要的抛出错误
          throw new Exception(
            "CannotDelete",
            `Cannot delete ${key.toString()} from ${target}`,
            Exception.level.Warn,
            false
          );
        }
        // 删除之后需要发布更新
        observer.notify();
        return result;
      } finally {
        return false;
      }
    },

    defineProperty(target: any, key: Key, descriptor: PropertyDescriptor) {
      // 定义新的数据的时候。
      if (isObject(descriptor.value) || isArray(descriptor.value)) {
        descriptor.value = observer.obser(descriptor.value);
      }
      const res = Reflect.defineProperty(target, key, descriptor);
      // 进行更新通知
      observer.notify();
      return res;
    },

    get(target: any, key: Key) {
      // 获取到相关的数据
      const val = target[key];
      if (Dep.target) {
        // 判定是否是有watcher的情况下获取的，关联当前的watcher
        observer.depend();
      }
      return val;
    },
  };
};

/**
 * 发布者，存在于订阅者之间的发布通知关系。
 * 1. 当内容有相关的变化的情况，将会将当前的数据进行发布。通知订阅者。
 * 2. 对多层此的对象进行深层代理。
 */
class Observer {
  dep: Dep;
  obsever: any; // 代理对象。
  _origin: any; // 原对象拷贝备份。
  constructor(observed: object) {
    this.dep = new Dep();
    this._origin = observed;
    this.obsever = this.obser(observed);
  }

  /**
   * 深层代理发布对象内容。
   * @param observed 发布原对象
   */
  obser(observed: object) {
    each(observed)((val, key) => {
      if (isObject(val) || isArray(val)) {
        observed[key] = this.obser(val); // 深层遍历当前的对象确定其子内容有需要代理的内容。
      }
    });
    return new Proxy(observed, DefaultOperation(this));
  }

  notify() {
    // 发布通知
    this.dep.notify();
  }

  depend() {
    // 关联管理中心确定订阅者。
    this.dep.depend();
  }

  clear() {
    // 清除当前的订阅情况。
    this.dep.clear();
  }
}

export default Observer;
