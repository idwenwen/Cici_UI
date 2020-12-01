import { isObject, trim, toArray, eq } from "lodash";
import { each, remove } from "./array";
class DomExtension {
    create(name) {
        return document.createElement(name);
    }
    append(parent, children) {
        parent.append(children);
    }
    setAttr(dom, name, value) {
        if (isObject(name)) {
            each(name)((attr, key) => {
                dom.setAttribute(key, attr);
            });
        }
        else {
            dom.setAttribute(name, value);
        }
    }
    removeAttr(dom, name) {
        if (Array.isArray(name)) {
            each(name)((val) => {
                dom.removeAttribute(val);
            });
        }
        else {
            dom.removeAttribute(name);
        }
    }
    getStyle(dom) {
        const origin = dom.getAttribute("style").split(";");
        if (!!origin[origin.length - 1])
            origin.pop();
        const result = {};
        each(origin)((val) => {
            const item = val.split(":");
            if (item.length === 2) {
                result[trim(item[0])] = trim(item[1]);
            }
        });
        return result;
    }
    setStyle(dom, key, value) {
        const origin = this.getStyle(dom);
        if (isObject(key)) {
            each(key)((val, key) => {
                origin[key] = val;
            });
        }
        else {
            origin[key] = value;
        }
        let finalStyle = "";
        each(origin)((val, key) => {
            finalStyle += `${key}:${val};`;
        });
        dom.setAttribute("style", finalStyle);
    }
    removeStyle(dom, key) {
        const origin = this.getStyle(dom);
        key = toArray(key);
        each(key)((val) => {
            return delete origin[val];
        });
        this.setStyle(dom, origin);
    }
    getClass(dom) {
        const origin = dom.getAttribute("class").split(" ");
        return each(origin)((val) => {
            return trim(val);
        });
    }
    setClass(dom, cla) {
        const origin = this.getClass(dom);
        cla = toArray(cla);
        each(cla)((val) => {
            const index = origin.findIndex((item) => item === val);
            if (index >= 0) {
                const attr = origin.splice(index, 1);
                origin.push(attr[0]);
            }
            else {
                origin.push(val);
            }
        });
        dom.setAttribute("class", origin.join(" "));
    }
    removeClass(dom, cla) {
        const origin = this.getClass(dom);
        cla = toArray(cla);
        remove(origin, (val) => cla.find((item) => eq(item, val)), true);
        dom.setAttribute("class", origin.join(" "));
    }
}
const operation = new DomExtension();
export default operation;
//# sourceMappingURL=domOperation.js.map