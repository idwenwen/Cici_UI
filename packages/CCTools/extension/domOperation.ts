import { isObject, trim, toArray, eq } from "lodash";
import { each, remove } from "./array";

export type DOMAttrs = {
  [name: string]: string | number | object | Array<string>; // 当且仅当name为style为Object， 当name为class的时候可以为数组
};
type Combinable = any;

export class DomExtension {
  create(name: string) {
    return document.createElement(name);
  }

  append(parent: HTMLElement, children: HTMLElement) {
    parent.append(children);
  }

  setAttr(dom: HTMLElement, name: string, value: string);
  setAttr(dom: HTMLElement, name: DOMAttrs, value?: never);
  setAttr(dom: HTMLElement, name: Combinable, value: Combinable) {
    if (isObject(name)) {
      each(name)((attr, key) => {
        if (key.toString().toLowerCase() === "style") {
          this.setStyle(dom, attr);
        } else if (key.toString().toLowerCase() == "class") {
          this.setClass(dom, attr);
        } else {
          dom.setAttribute(key, attr);
        }
      });
    } else {
      dom.setAttribute(name, value);
    }
  }

  removeAttr(dom: HTMLElement, name: string[] | string) {
    if (Array.isArray(name)) {
      each(name)((val) => {
        dom.removeAttribute(val);
      });
    } else {
      dom.removeAttribute(name);
    }
  }

  getStyle(dom: HTMLElement) {
    const origin = dom.getAttribute("style").split(";");
    if (!!origin[origin.length - 1]) origin.pop(); // 去除掉最后的空字符串
    const result = {};
    each(origin)((val) => {
      const item = val.split(":");
      if (item.length === 2) {
        result[trim(item[0])] = trim(item[1]);
      }
    });
    return result;
  }

  setStyle(dom: HTMLElement, key: string, value: string);
  setStyle(dom: HTMLElement, key: DOMAttrs, value?: never);
  setStyle(dom: HTMLElement, key: Combinable, value: Combinable) {
    const origin = this.getStyle(dom);
    if (isObject(key)) {
      each(key)((val, key) => {
        origin[key] = val;
      });
    } else {
      origin[key] = value;
    }
    let finalStyle = "";
    each(origin)((val, key) => {
      finalStyle += `${key}:${val};`;
    });
    dom.setAttribute("style", finalStyle);
  }

  removeStyle(dom: HTMLElement, key: string | string[]) {
    const origin = this.getStyle(dom);
    key = toArray(key);
    each(<string[]>key)((val) => {
      return delete origin[val];
    });
    this.setStyle(dom, origin);
  }

  getClass(dom: HTMLElement): Array<string> {
    const origin = dom.getAttribute("class").split(" ");
    return each(origin)((val) => {
      return trim(val);
    });
  }

  setClass(dom: HTMLElement, cla: string | string[]) {
    const origin = this.getClass(dom);
    cla = toArray(cla);
    each(<string[]>cla)((val) => {
      const index = origin.findIndex((item) => item === val);
      if (index >= 0) {
        const attr = origin.splice(index, 1);
        origin.push(attr[0]);
      } else {
        origin.push(val);
      }
    });
    dom.setAttribute("class", origin.join(" "));
  }

  removeClass(dom: HTMLElement, cla: string | string[]) {
    const origin = this.getClass(dom);
    cla = toArray(cla);
    remove(
      origin,
      (val) => (<string[]>cla).find((item) => eq(item, val)),
      true
    );
    dom.setAttribute("class", origin.join(" "));
  }
}

const operation = new DomExtension();

export default operation;
