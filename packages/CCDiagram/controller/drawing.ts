import { each, remove, UUID } from "@cc/tools";
import { toArray, throttle } from "lodash";

const DrawableId = new UUID((index) => `Drawable_${index}`);
// 可绘制对象。
export class Drawable {
  uuid: string;
  canvas: HTMLCanvasElement;
  drawing: Function;
  constructor(canvas: HTMLCanvasElement, drawing: Function, uuid?: string) {
    this.uuid = uuid || DrawableId.get().toString();
    this.canvas = canvas;
    this.drawing = drawing;
  }
}

class Render {
  static between = 50;
  willDraw: Drawable[];

  constructor() {
    this.willDraw = [];
  }

  add(drawable: Drawable) {
    this.willDraw.find((val) => val.uuid === drawable.uuid) ||
      this.willDraw.push(drawable);
  }

  remove(uuid: string | string[]) {
    remove(this.willDraw, (val) =>
      toArray(uuid).find((item) => val.uuid === item)
    );
  }

  drawList() {
    if (this.willDraw.length > 0) {
      const finish = [];
      each(this.willDraw)((val: Drawable, index) => {
        this.render(val);
        finish.push(index);
      });
      // 绘制完成之后删除当前待绘制内容。
      remove(this.willDraw, (_val, index) =>
        finish.find((item) => index === item)
      );
    }
  }

  renders() {
    return throttle(this.drawList, Render.between);
  }

  render(drawable: Drawable) {
    const ctx = drawable.canvas.getContext("2d");
    ctx.clearRect(0, 0, drawable.canvas.width, drawable.canvas.height);
    drawable.drawing(ctx); // 绘制相关内容。
  }
}

const renderController = new Render();

export default renderController;
