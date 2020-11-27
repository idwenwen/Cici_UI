import { each } from "@cc/tools";
import { Callback } from "../../../commonType";

type CallbackList = {
  before?: Callback;
  after?: Callback;
};

/**
 * 帮助绘制的相关工具函数
 * 1. 主要是canvas的相关信息内容
 */
class Brush {
  ctx: CanvasRenderingContext2D;
  drawPath: Function;
  constructor(canvas: any, drawPath: Function) {
    this.ctx = canvas.getContext("2d");
    this.drawPath = drawPath;
  }
  save() {
    this.ctx.save();
    return this;
  }

  restore() {
    this.ctx.restore();
    return this;
  }

  beginPath() {
    this.ctx.beginPath();
    return this;
  }

  closePath() {
    this.ctx.closePath();
    return this;
  }

  stroke() {
    this.ctx.stroke();
    return this;
  }

  fill() {
    this.ctx.fill();
    return this;
  }

  style(style: object) {
    if (style) {
      each(style)((val, key) => {
        this.ctx[key] = val;
      });
    }
  }

  drawing(cb: CallbackList, style?: object) {
    this.save();
    cb.before && cb.before.call(this, this.ctx); // 绘制钱回调函数
    this.style(style);
    this.drawPath.call(this, this.ctx);
    cb.after && cb.after.call(this, this.ctx); // 绘制后回调函数
    this.restore();
  }
}

export default Brush;
