import { each, Exception, Mapping } from "@cc/tools";
import { Combinable } from "../commonType";
import { isObject, isString, isFunction, toArray } from "lodash";
import Brush, { LifeCycleForBrushing } from "../brush/index";
import Brushing from "../brush/index";

// 路径绘制函数，主要用于预设当前参数内容。
export type PathDrawing = (
  ctx: CanvasRenderingContext2D,
  parameter: object
) => any;

export type PathDependence = {
  path: PathDrawing;
  paramFilter?: {}; // 暂时作为预定义项，用于传入参数的数据首次筛选。
};

// 多条预设路径。
export type Paths = {
  [name: string]: PathDrawing | PathDependence;
};

/**
 * 绘制路径实例，存储用户对于绘制路径的设置。
 * 1.提供便捷的绘制工具以，以及自动的将当前的ctx进行存储重设等操作。开发只需要全心全意在绘制过程之中就可以。
 * 2.提供参数校验功能，帮助校验传递的参数是否符合预期。
 */
class DrawPath {
  // 全局预定义定义Path内容，记录用户的预定义的绘制路径。
  static PATH = new Mapping<string, PathDependence>();

  // 对于全局的预定义Path方法的定义。
  static set(name: string, route: PathDrawing | PathDependence);
  static set(name: Paths, route?: undefined);
  static set(name: Combinable, route: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        DrawPath.set(key.toString(), val);
      });
    } else {
      let content;
      if (isFunction(route)) content = { path: route };
      else content = route;
      DrawPath.PATH.set(name, content);
    }
  }

  // 全局PATH对象的获取方法。
  static get(name: string): PathDependence {
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

  /******************实例参数与方法 ******************/
  drawPath: PathDependence; // 图形绘制方法 与 参数过滤条件。

  constructor(drawPath?: string | PathDrawing | PathDependence) {
    this.drawPath = <PathDependence>(
      (isString(drawPath) ? DrawPath.get(<string>drawPath) : drawPath)
    );
  }

  drawing(
    ctx: CanvasRenderingContext2D,
    parameter: any,
    lifeCycle: LifeCycleForBrushing = {}
  ) {
    const brush = new Brushing(ctx); // 绘制工作模板
    const cycle = Object.assign({}, lifeCycle);
    if (cycle.beforeSave)
      cycle.beforeSave = [
        ...toArray(cycle.beforeSave),
        () => {
          if (this.drawPath.paramFilter) {
            // TODO: 判定当前传递对象是否符合预设要求
          }
        },
      ];
    brush.drawing(this.drawPath.path, parameter, cycle);
  }

  // 判定点是否在路径之中。
  // inPath(point: Point, canvas: Panel, parameter: any): boolean {
  //   let inHere = false;
  //   CanvasForCalculate.sameAs(canvas);
  //   this.drawing(CanvasForCalculate, parameter, {
  //     afterDraw: (ctx: CanvasRenderingContext2D) => {
  //       inHere = ctx.isPointInPath(point[0], point[1]);
  //     },
  //   });
  //   return inHere;
  // }
}

export default DrawPath;
