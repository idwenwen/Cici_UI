import { domOperation, each, UUID } from "@cc/tools";
import { Point } from "../commonType";
import { eq, trim } from "lodash";
import { DomMatrix } from "../matrix/index";

const PanelId = new UUID((index) => `canvas_${index}`);
/**
 * 记录单一的canvas信息内容。
 */
class Panel {
  uuid: string;
  canvasDom: any; // canvas dom 元素

  canvasWidth: number; // canvas的相关宽度。
  canvasHeight: number;

  position: Point;
  transfrom: DomMatrix;

  constructor(
    width: number = 100,
    height: number = 50,
    position: Point = [0, 0],
    container?: HTMLElement
  ) {
    this.uuid = PanelId.get().toString();
    this.canvasDom = domOperation.create("canvas");
    this.position = position;
    this.transfrom = new DomMatrix();
    this.canvasWidth = width;
    this.canvasHeight = height;
    domOperation.setAttr(this.canvasDom, {
      width,
      height,
      style: this
        .settingPosition`top ${this.position[0]} left ${this.position[1]}`,
    });
    container && container.append(this.canvasDom);
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
}

export default Panel;

export const CanvasForCalculate = new Panel();
