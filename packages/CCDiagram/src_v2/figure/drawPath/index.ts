import { each, Exception, Mapping } from "@cc/tools";
import { Combinable } from "../../commonType";
import { toParameter } from "../parameter/index";
import { isObject, isString } from "lodash";
import Figure from "../index";
import Brush from "../brush/index";
import { Point } from "../../commonType";
import { CanvasMatrix } from "../../matrix/index";
import { CanvasForCalculate } from "../../panel/index";

export type RouteOperation = (
  ctx: CanvasRenderingContext2D,
  parameter: object
) => any;
export type RouteImply = {
  [name: string]: RouteOperation | any;
};

/**
 * 绘制路径实例，存储用户对于绘制路径的设置。
 * 1.提供便捷的绘制工具以，以及自动的将当前的ctx进行存储重设等操作。开发只需要全心全意在绘制过程之中就可以。
 * 2.提供参数校验功能，帮助校验传递的参数是否符合预期。
 */
class DrawPath {
  static PATH = new Mapping<string, RouteOperation>();

  static set(name: string, route: RouteOperation);
  static set(name: RouteImply, route?: undefined);
  static set(name: Combinable, route: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        DrawPath.set(key.toString(), val);
      });
    } else {
      DrawPath.PATH.set(name, route);
    }
  }

  static get(name: string) {
    const result = DrawPath.PATH.get(name);
    try {
      if (!result) {
        throw new Exception(
          "DoNotMatched",
          `There has no value related to ${name}`,
          Exception.level.Warn,
          false
        );
      } else {
        return result;
      }
    } finally {
      return void 0;
    }
  }

  drawPath: RouteOperation; // 图形绘制方法
  belongTo: Figure; // 属于哪一份figure。
  matrix: CanvasMatrix; // 当前路径的变形情况。
  constructor(figure: Figure, drawPath?: string | RouteOperation) {
    this.belongTo = figure;
    this.drawPath = <RouteOperation>(
      (isString(drawPath) ? DrawPath.get(<string>drawPath) : drawPath)
    );
    this.matrix = new CanvasMatrix();
  }

  drawing(canvas: any, parameter: any, cb: any = {}) {
    const _t = this;
    const defaultCall = (ctx) => {
      _t.matrix.transform(ctx); // 在存储之前进行变形
    };
    if (this.drawPath) {
      const brush = new Brush(canvas, this.drawPath);
      cb.beforeDraw
        ? Array.isArray(cb.beforeDraw)
          ? cb.beforeDraw.push(defaultCall)
          : (cb.beforeDraw = [cb.beforeDraw, defaultCall])
        : (cb.beforeDraw = defaultCall);
      brush.drawing(cb, parameter);
    }
  }

  // 判定点是否在路径之中。
  inPath(point: Point, parameter: any): boolean {
    let inHere = false;
    this.drawing(CanvasForCalculate, parameter, {
      afterDraw: (ctx: CanvasRenderingContext2D) => {
        inHere = ctx.isPointInPath(point[0], point[1]);
      },
    });
    return inHere;
  }
}

export default DrawPath;
