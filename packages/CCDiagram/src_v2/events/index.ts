import { each, Exception, Mapping } from "@cc/tools";
import { Combinable } from "../commonType";
import { isObject, toArray } from "lodash";
import { assignment } from "../controller/action/action";

export type EventOperations = {
  [name: string]: Function | Function[];
};

class Events {
  eventsList: Mapping<string, Function[]>;
  context: any;
  constructor(context: any, eventList: EventOperations) {
    this.context = context;
    this.eventsList = new Mapping();
    this.addEvents(eventList);
  }

  addEvents(name: string, operation: Function | Function[]);
  addEvents(name: EventOperations, operation?: never);
  addEvents(name: Combinable, operation: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.eventsList.set(key, val);
      });
    } else {
      this.eventsList.set(name, operation);
    }
  }

  removeEvents(name: string | string[]) {
    if (Array.isArray(name)) {
      each(name)((val) => {
        this.eventsList.delete(val);
      });
    } else {
      this.eventsList.delete(name);
    }
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
      assignment(this.context, () => {
        // 设置当前转变到心跳函数之中，进行同步操作。
        eve = toArray(eve);
        each(eve)((func) => {
          func.call(this.context, ...meta);
        });
      });
    } finally {
      void 0;
    }
  }
}

export default Events;
