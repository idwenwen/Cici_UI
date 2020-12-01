import { each } from "@cc/tools";
import { Callback } from "../../commonType";
import { toArray } from "lodash";

type CallbackList = {
  beforeSave?: Callback | Callback[];
  beforeDraw?: Callback | Callback[];
  afterDraw?: Callback | Callback[];
  afterRestore?: Callback | Callback[];
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

  private call(cb?: Callback | Callback[]) {
    if (cb) {
      cb = toArray(cb);
      each(cb)((val) => {
        val.call(this, this.ctx);
      });
    }
  }

  drawing(cb: CallbackList, parameter: any) {
    this.call(cb.beforeSave);
    this.save();
    this.call(cb.beforeSave); // 绘制钱回调函数
    this.drawPath.call(this, this.ctx, parameter);
    this.call(cb.afterDraw); // 绘制后回调函数
    this.restore();
    this.call(cb.afterRestore);
  }
}

export default Brush;
