import { each } from "@cc/tools";
import { Combinable } from "packages/CCDiagram/core/commonType";
import { isObject, eq, toArray } from "lodash";

type Styles = {
  [str: string]: string;
};

class CanvasStyle {
  style: Styles;
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
}

export default CanvasStyle;
