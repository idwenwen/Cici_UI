import { each, Exception, Mapping, remove } from "@cc/tools";
import { Combinable, Point } from "../commonType";
import { isObject, toArray } from "lodash";
import { once } from "../controller/action/action";

export type EventOperations = {
  [name: string]: Function | Function[];
};

type EventNode = {
  event: Function;
  once: boolean;
};

class Events {
  eventsList: Mapping<string, EventNode[]>;
  context: any;
  constructor(context: any, eventList?: EventOperations) {
    this.context = context;
    this.eventsList = new Mapping();
    eventList && this.addEvents(eventList);
  }

  addEvents(name: string, operation: Function | Function[], once?: boolean);
  addEvents(name: EventOperations, operation?: never, once?: boolean);
  addEvents(
    name: Combinable,
    operation: Combinable = false,
    once: boolean = false
  ) {
    if (isObject(name)) {
      each(name)((val: Function | Function[], key) => {
        this.addEvents(key, val, <boolean>operation);
      });
    } else {
      const list = each(toArray(operation))((func) => {
        return {
          event: func,
          once,
        };
      });
      this.eventsList.set(name, list);
    }
  }

  // 删除某一类事件
  removeEvents(name: string | string[]) {
    name = toArray(name);
    each(<string[]>name)((val) => {
      this.eventsList.delete(val);
    });
  }

  // 事件触发。
  dispatch(name: string, ...meta: any[]) {
    try {
      let eve = this.eventsList.get(name); // 获取当前时间函数
      if (!eve) {
        throw new Exception(
          "DonotExist",
          `There has no event name ${name}`,
          Exception.level.Warn,
          false
        );
      }
      // 将当前时间逻辑设置称为一次action的内容统一添加到当前的公共心跳之中。
      once(this.context, () => {
        const willRemove = [];
        // 设置当前转变到心跳函数之中，进行同步操作。
        eve = toArray(eve);
        each(eve)((func: EventNode, index) => {
          func.event.call(this.context, ...meta);
          if (func.once) willRemove.push(index);
        });
        remove(eve, (_item, index) => {
          willRemove.find((val) => val === index);
        });
        this.eventsList.set(name, eve);
      });
    } finally {
      void 0;
    }
  }
}

export default Events;
