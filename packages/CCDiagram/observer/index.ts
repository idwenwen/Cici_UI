import { defNoEnum, each, Exception } from "@cc/tools";
import Dep from "./dep";
import { isObject, isArray, eq } from "lodash";
import { Key } from "../commonType";
import { acquistion } from "../config/common";
import { intoFirst } from "../utils/index";

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
 *
 * 通过proxy的形式监听对象之中的变量内容。
 * 传递的内容是作为监听变化的 对象 内容。
 *
 * p.s. 所以当当前的对象没有被调用参数的时候，get方法不会被调用则不会添加到监听内容。
 */
class Observer {
  dep: Dep;
  observer: any; // 代理对象。
  origin: any; // 原对象拷贝备份。
  constructor(observed: object) {
    defNoEnum(this, {
      dep: new Dep(),
      origin: observed, // 原映射对象
    });
    this.observer = this.obser(observed);
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

  // 更新当前的观察对象内容。
  reObser(observed: object) {
    this.origin = observed;
    this.observer = this.obser(observed);
    this.notify();
  }

  notify() {
    // 发布更新通知
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

// 自动依据Observer对象之中的observer内容进行操作或者获取
export function Observing(observed: object | Observer) {
  const observer =
    observed instanceof Observer ? observed : new Observer(observed);

  const CustomHandler = {
    set(target: Observer, key: Key, value: any) {
      if (intoFirst(key, "reObser")) {
        if (isObject(value)) {
          // 对原观察对象进行替换。
          target.reObser(value);
        }
      }
      target.observer[key] = isObject(value) ? target.obser(value) : value;
    },
    get(target: Observer, key: Key) {
      return target.observer[key];
    },
  };

  return acquistion(observer, CustomHandler);
}
