import { domOperation, each } from "@cc/tools";
import { Combinable } from "../commonType";
import { isObject, eq, toArray } from "lodash";
import { Observing } from "../observer/index";

export type Styles = {
  [str: string]: string;
};

class CanvasStyle {
  style: Styles | any;
  constructor(styleList: Styles) {
    this.set(styleList);
  }

  // 设置新的style属性
  set(name: string, value: string);
  set(name: Styles, value?: never);
  set(name: Combinable, value: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.set(key, val);
      });
    } else {
      // 如果相同者不设置。
      if (!eq(this.style[name], value)) {
        this.style[name] = value;
      }
    }
  }

  remove(name: string | string[]) {
    each(toArray(name))((val) => {
      delete this.style[val];
    });
  }

  /**
   * 订阅当前内容。
   */
  subscribe() {
    // 当前数据对象可以订阅。
    if (!(this.style instanceof Proxy)) {
      this.style = Observing(this.style);
    }
  }

  setStyle(dom: HTMLElement) {
    domOperation.setStyle(dom, this.style);
  }
}

export default CanvasStyle;
