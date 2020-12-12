import { domOperation, each, UUID, DomExtension, remove } from "@cc/tools";
import { eq, trim, isObject, toArray } from "lodash";
import CanvasStyle, { Styles } from "./style";
import Classes from "./classes";
import Transform, { TransformAttr } from "./transform";
import { Combinable } from "../commonType";
import Diagram, { DiagramFigure } from "../diagram/index";
import { Watching } from "../observer/watcher";

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
  diagram: Diagram[];

  constructor(
    id?: string,
    width: number = 100,
    height: number = 100,
    style?: Styles,
    classes?: string | string[],
    transform?: TransformAttr,
    events?: EventRecord,
    diagram?: DiagramFigure | Diagram | (DiagramFigure | Diagram)[]
  ) {
    this.uuid = id || PanelId.get().toString(); // 当前Dom元素的Id
    this.dom = <HTMLCanvasElement>domOperation.create("canvas");
    this._width = width;
    this._height = height;

    if (!style.width) style.width = width + "px";
    if (!style.height) style.height = height + "px";

    this.connectToStyle(style);
    this.connectToClass(classes);
    this.connectToTransfrom(transform);
    this.addEvents(events);
    this.diagram = [];
    this.addDiagram(diagram);
  }

  addDiagram(dia: DiagramFigure | Diagram | (DiagramFigure | Diagram)[]) {
    each(toArray(dia))((val) => {
      if (
        val instanceof Diagram &&
        !this.diagram.find((item) => item.uuid === val.uuid)
      ) {
        this.diagram.push(val);
      } else if (!(val instanceof Diagram)) {
        val = new Diagram(val, this);
        this.diagram.push(val);
      }
    });
  }

  removeDiagram(uuid: string | string[]) {
    const idList = toArray(uuid);
    remove(this.diagram, (dia) => idList.find((id) => dia.uuid === id));
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
          // 可以决定每一个相关的diagram的操作。
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
      this.style.set("width", newWidth + "px");
      domOperation.setAttr(this.dom, "width", this._width + "");
      // 由于dom的像素大小改变，所以canvas会被清空，需要重绘当前panel上的内容。
      each(this.diagram)((dia) => {
        dia.updated();
      });
    }
  }
  get width() {
    return this._width;
  }

  set height(newHeight: number) {
    if (newHeight !== this._height) {
      this._height = newHeight;
      this.style.set("height", newHeight + "px");
      domOperation.setAttr(this.dom, "height", this._height + "");
      // 由于dom的像素大小改变，所以canvas会被清空，需要重绘当前panel上的内容。
      each(this.diagram)((dia) => {
        dia.updated();
      });
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
    const _t = this;
    this.style = new CanvasStyle(styles);
    this.style.subscribe();
    Watching(
      this.style,
      function () {
        this.setStyle(this.dom);
      },
      function () {
        // 当前内容变动将会影响到diagram之中的样式内容。
        if (parseFloat(this.style.width) !== _t.width) {
          _t.width = parseFloat(this.style.width);
        }
        if (parseFloat(this.style.height) !== _t.height) {
          _t.height = parseFloat(this.style.height);
        }
        each(_t.diagram)((val) => {
          val.updated();
        });
      }
    );
  }

  private connectToClass(classes: string | string[]) {
    this.class = new Classes(classes);
    this.class.subscribe();
    Watching(
      this,
      () => {
        this.class.setClass(this.dom);
      },
      () => {
        // 当前内容变动将会影响到diagram之中的样式内容。
        each(this.diagram)((val) => {
          val.updated();
        });
      }
    );
  }

  private connectToTransfrom(transform: TransformAttr) {
    this.transfrom = new Transform(transform);
    this.transfrom.subscribe();
    Watching(
      this,
      () => {
        this.transfrom.setTransform(this.dom);
      },
      () => {
        // 当前内容变动将会影响到diagram之中的样式内容。
        each(this.diagram)((val) => {
          val.updated();
        });
      }
    );
  }
}

export default Panel;

export type PanelSetting = {
  id?: string;
  width?: number;
  height?: number;
  style?: Styles;
  class?: string | string[];
  transform?: TransformAttr;
  events?: EventRecord;
  diagram?: DiagramFigure | Diagram | (DiagramFigure | Diagram)[];
};

export function toPanel(setting: PanelSetting) {
  return new Panel(
    setting.id,
    setting.width,
    setting.height,
    setting.style,
    setting.class,
    setting.transform,
    setting.events,
    setting.diagram
  );
}

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
