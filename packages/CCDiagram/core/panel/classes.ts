import { domOperation, remove } from "@cc/tools";
import { toArray } from "lodash";
import { Observing } from "packages/CCDiagram/core/observer/index";

/**
 * dom节点样式表内容。
 */
class Classes {
  class: Array<string>;
  constructor(origin: string | string[]) {
    this.set(toArray(origin));
  }

  set(str: string | string[]) {
    this.class.push(...toArray(str));
  }

  remove(str: string | string[]) {
    const removeList = toArray(str);
    remove(this.class, (val) => removeList.find((item) => item === val));
  }

  subscribe() {
    if (!(this.class instanceof Proxy)) {
      this.class = Observing(this.class);
    }
  }

  setClass(dom: HTMLElement) {
    domOperation.setClass(dom, this.class);
  }
}

export default Classes;
