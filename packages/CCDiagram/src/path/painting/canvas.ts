import { each } from "@cc/tools";
import Brush from "./brush";

class CanvasBrush extends Brush {
  save(brush: CanvasRenderingContext2D) {
    brush.save();
    return this;
  }
  restore(brush: CanvasRenderingContext2D) {
    brush.restore();
    return this;
  }
  beginPath(brush: CanvasRenderingContext2D) {
    brush.beginPath();
    return this;
  }
  closePath(brush: CanvasRenderingContext2D) {
    brush.closePath();
    return this;
  }
  painting(brush: CanvasRenderingContext2D, way: Function, style?: object) {
    this.save(brush);
    if (style) {
      each(style)((val, key) => {
        brush[key] = val;
      });
    }
    way(brush);
    this.restore(brush);
  }
  stroke(brush: CanvasRenderingContext2D, style?: object) {
    this.painting(
      brush,
      (brush) => {
        brush.stroke();
      },
      style
    );
    return this;
  }
  fill(brush: CanvasRenderingContext2D, style?: object) {
    this.painting(
      brush,
      (brush) => {
        brush.fill();
      },
      style
    );
    return this;
  }
}

const canvasBrush = new CanvasBrush();
export function drawing(
  brush: CanvasRenderingContext2D,
  path: Function,
  style?: object
) {
  canvasBrush.save(brush);
  path.call(canvasBrush, brush, style);
  canvasBrush.restore(brush);
}
