import { domOperation, each, UUID, DomExtension } from "@cc/tools";
import { eq, trim, isObject, toArray } from "lodash";
import CanvasStyle, { Styles } from "./style";
import Classes from "./classes";
import Transform, { TransformAttr } from "./transform";
import { Combinable } from "../commonType";
import Diagram from "../diagram/index";
import { Watching } from "packages/CCDiagram/core/observing/watcher";

type EventRecord = {
  [type: string]: Function | Function[];
};

const PanelId = new UUID((index) => `canvas_${index}`);
/**
 * 记录单一的canvas信息内容。
 */
class Panel {
  // TODO: 添加事件的相关操作。
  uuid: string; // 作为当前元素的ID内容。
  dom: HTMLCanvasElement; // canvas dom 元素

  _width: number; // canvas的相关宽度 与 高度，主要是针对canva的像素高度。
  _height: number;

  style: CanvasStyle;
  class: Classes;
  transfrom: Transform;

  events: EventRecord;
  diagram: Diagram;

  constructor(
    id?: string,
    width: number = 100,
    height: number = 100,
    style?: Styles,
    classes?: string | string[],
    transform?: TransformAttr
  ) {
    this.uuid = id || PanelId.get().toString(); // 当前Dom元素的Id
    this.dom = <HTMLCanvasElement>domOperation.create("canvas");
    this._width = width;
    this._height = height;

    this.connectToStyle(style);
    this.connectToClass(classes);
    this.connectToTransfrom(transform);
  }

  addEvents(type: string, func: Function | Function[]);
  addEvents(type: EventRecord, func?: never);
  addEvents(type: Combinable, func: Combinable) {
    if (isObject(type)) {
      each(type)((eves, key) => {
        this.addEvents(key, eves);
      });
    } else {
      func = toArray(func);
      const finalEventFunc: Function[] = each(func)((ope) => {
        const connectToDiagramEvent = (eve) => {
          ope.call(this, eve);
        };
        this.dom.addEventListener(type, connectToDiagramEvent);
        return connectToDiagramEvent;
      });
      this.events[type]
        ? (<Function[]>this.events[type]).push(...finalEventFunc)
        : finalEventFunc;
    }
  }

  removeEvents(type: string) {
    const event = toArray(this.events[type]);
    each(event)((eve) => {
      this.dom.removeEventListener(type, eve);
    });
    delete this.events[type];
  }

  set width(newWidth: number) {
    if (newWidth !== this._width) {
      this._width = newWidth;
      domOperation.setAttr(this.dom, "width", this._width + "");
    }
  }
  get width() {
    return this._width;
  }

  set height(newHeight: number) {
    if (newHeight !== this._height) {
      this._height = newHeight;
      domOperation.setAttr(this.dom, "height", this._height + "");
    }
  }
  get height() {
    return this._height;
  }

  set parent(par: HTMLElement) {
    par.appendChild(this.dom);
  }
  get parent() {
    return this.dom.parentElement;
  }

  private connectToStyle(styles: Styles) {
    this.style = new CanvasStyle(styles);
    this.style.subscribe();
    Watching(this, () => {
      this.style.setStyle(this.dom);
    });
  }

  private connectToClass(classes: string | string[]) {
    this.class = new Classes(classes);
    this.class.subscribe();
    Watching(this, () => {
      this.class.setClass(this.dom);
    });
  }

  private connectToTransfrom(transform: TransformAttr) {
    this.transfrom = new Transform(transform);
    this.transfrom.subscribe();
    Watching(this, () => {
      this.transfrom.setTransform(this.dom);
    });
  }
}

export default Panel;

type PanelSetting = {
  id: string;
};

class CalculatePanel {
  canvas: Panel;
  constructor() {
    this.canvas = new Panel();
  }

  measureText(text: string, style: object) {
    const ctx = this.canvas.dom.getContext("2d");
    each(style)((val, key) => {
      ctx[key] = val;
    });
    return ctx.measureText(text);
  }
}

export const calculateCanvas = new CalculatePanel();
