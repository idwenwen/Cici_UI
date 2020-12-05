import { domOperation, each, UUID, DomExtension } from "@cc/tools";
import { Point } from "../commonType";
import { eq, trim, isObject, toArray } from "lodash";
import { DomMatrix } from "../matrix/index";
import { Combinable } from "../commonType";

export type PanelSetting = {
  width?: number;
  height?: number;
  position?: Point;
  container?: HTMLElement;
};

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

  position: Point; // panel的相对总画布的位置。
  transfrom: DomMatrix; // 当前内容的变形。

  events: EventRecord;

  constructor(
    width: number = 100,
    height: number = 50,
    position: Point = [0, 0],
    id?: string,
    container?: HTMLElement,
    events?: EventRecord
  ) {
    this.uuid = id || PanelId.get().toString(); // 当前Dom元素的Id
    this.dom = <HTMLCanvasElement>domOperation.create("canvas");
    this._width = width;
    this._height = height;

    this.position = position;
    this.transfrom = new DomMatrix();
    domOperation.setAttr(this.canvasDom, {
      width,
      height,
      style: this
        .settingPosition`top ${this.position[0]} left ${this.position[1]}`,
    });
    container && container.append(this.canvasDom);
    this.events = {};
    events && this.addEvents(events);
  }

  private settingPosition(str, ...content: any[]) {
    let final = {
      position: "absolute",
    };
    each(content)((val, index) => {
      if (!eq(val, 0)) {
        final[trim(str[index])] = val + "px";
      }
    });
    return final;
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
          ope.call(this.diagram, eve);
        };
        this.canvasDom.addEventListener(type, connectToDiagramEvent);
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
      this.canvasDom.removeEventListener(type, eve);
    });
    delete this.events[type];
  }

  set top(newTop: number) {
    if (newTop !== this.position[0]) {
      this.position[0] = newTop;
      domOperation.setStyle(this.canvasDom, "top", this.position[0] + "px");
    }
  }
  get top() {
    return this.position[0];
  }

  set left(newLeft: number) {
    if (newLeft !== this.position[1]) {
      this.position[1] = newLeft;
      domOperation.setStyle(this.canvasDom, "left", this.position[1] + "px");
    }
  }
  get left() {
    return this.position[1];
  }

  set width(newWidth: number) {
    if (newWidth !== this.canvasWidth) {
      this.canvasWidth = newWidth;
      domOperation.setAttr(this.canvasDom, "width", this.canvasWidth + "");
    }
  }
  get width() {
    return this.canvasWidth;
  }

  set height(newHeight: number) {
    if (newHeight !== this.canvasHeight) {
      this.canvasHeight = newHeight;
      domOperation.setAttr(this.canvasDom, "height", this.canvasHeight + "");
    }
  }
  get height() {
    return this.canvasHeight;
  }

  // 变形方法提供
  set translateX(transX: number) {
    if (transX !== this.transfrom.translateX) {
      this.transfrom.translateX = transX;
      this.transfrom.transform(this.canvasDom);
    }
  }
  get translateX() {
    return this.transfrom.translateX;
  }

  set translateY(arg: number) {
    if (arg !== this.transfrom.translateY) {
      this.transfrom.translateY = arg;
      this.transfrom.transform(this.canvasDom);
    }
  }
  get translateY() {
    return this.transfrom.translateY;
  }

  set rotateX(arg: number) {
    if (arg !== this.transfrom.rotateX) {
      this.transfrom.rotateX = arg;
      this.transfrom.transform(this.canvasDom);
    }
  }
  get rotateX() {
    return this.transfrom.rotateX;
  }

  set rotateY(arg: number) {
    if (arg !== this.transfrom.rotateY) {
      this.transfrom.rotateY = arg;
      this.transfrom.transform(this.canvasDom);
    }
  }
  get rotateY() {
    return this.transfrom.rotateY;
  }

  set scaleX(arg: number) {
    if (arg !== this.transfrom.scaleX) {
      this.transfrom.scaleX = arg;
      this.transfrom.transform(this.canvasDom);
    }
  }
  get scaleX() {
    return this.transfrom.scaleX;
  }

  set scaleY(arg: number) {
    if (arg !== this.transfrom.scaleY) {
      this.transfrom.scaleY = arg;
      this.transfrom.transform(this.canvasDom);
    }
  }
  get scaleY() {
    return this.transfrom.scaleY;
  }

  sameAs(panel: Panel) {
    this.top = panel.top;
    this.left = panel.left;
    this.width = panel.width;
    this.height = panel.height;
    this.translateX = panel.translateX;
    this.translateY = panel.translateX;
    this.rotateX = panel.rotateX;
    this.rotateY = panel.rotateY;
    this.scaleY = panel.scaleY;
    this.scaleX = panel.scaleX;
  }
}

export default Panel;

export const CanvasForCalculate = new Panel();

export function toPanel(setting: PanelSetting) {
  return new Panel(
    setting.width,
    setting.height,
    setting.position,
    setting.container
  );
}
