import Observer from "../observable/index";
import { Watching } from "../observable/watch";
import Figure from "../figure/index";
import { isNil, isString } from "lodash";
import { each, remove } from "@cc/tools";
import { key } from "../config/commenType";

class Parameter {
  context: Figure;
  _originImply: object; // Getter for current watcher

  _Watcher: object;

  _Observer: Observer;

  attrs: object;

  constructor(context: Figure, imply: object) {
    this.context = context;
    this._originImply = imply;

    this._Watcher = null;

    this._Observer = null;

    this.attrs = null;
    this.watching();
  }

  private parentAttrs() {
    return this.context.parent
      ? this.context.parameter.attrs
      : this.context.parameter.attrs;
  }

  private watching() {
    let obser = this.parentAttrs();

    // If there has parent node
    this._Watcher = Watching(obser, this._originImply, (res) => {
      if (isNil(this.attrs)) this.attrs = {};
      const keys = Object.keys(this.attrs);
      each(res)((val, key) => {
        this.attrs[key] = val;
        remove(keys, (k) => k === key);
      });
      if (keys.length > 0) {
        // Delete redundant variable
        each(keys)((key) => {
          delete this.attrs[key];
        });
      }
    });
  }

  private observer() {
    if (!this._Observer) {
      if (isNil(this.attrs)) {
        this.attrs = this._originImply;
      }
      this._Observer = new Observer(this.attrs);
      this.attrs = this._Observer.obsever;
    }
  }

  connectTo() {
    if (this.context.parent) {
      if (this._Watcher["origin"].context !== this.parentAttrs()) {
        this.context.parent.parameter.observer(); // Check does parameter of parent node is watchable
        this._Watcher["origin"].setContext(this.parentAttrs());
      }
    }
  }
}

export default Parameter;

export function getParameter(context: Figure, imply: any) {
  const parameter = new Parameter(context, imply);
  const defaultHanlder = {
    get(target: Parameter, key: key) {
      let tar = target.attrs;
      if (isString(key) && (<string>key).toLowerCase() === "origin") {
        return target;
      }
      if (isString(key) && (<string>key).search(/origin\./) >= 0) {
        tar = target;
        key = (<string>key).replace(/origin\./, "");
      } else if (isString(key) && (<string>key).search(/setting\./) >= 0) {
        tar = target._Watcher;
        key = (<string>key).replace(/setting\./, "");
      }
      return tar[key];
    },
    set(target: Parameter, key: key, value: any) {
      let tar = target._Watcher;
      if (isString(key) && (<string>key).search(/origin\./) >= 0) {
        tar = target;
        key = (<string>key).replace(/origin\./, "");
      }
      return (tar[key] = value);
    },
  };
  return new Proxy(parameter, defaultHanlder);
}
