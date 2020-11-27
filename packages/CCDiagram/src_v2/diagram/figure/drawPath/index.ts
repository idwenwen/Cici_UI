import { each, Exception, Mapping } from "@cc/tools";
import { Combinable } from "packages/CCDiagram/src/config/commenType";
import { toParameter } from "../parameter/index";
import { isObject } from "lodash";
import Figure from "packages/CCDiagram/src/figure/index";

type RouteOperation = (ctx: CanvasRenderingContext2D, parameter: object) => any;
type RouteImply = {
  [name: string]: RouteOperation;
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
  parameter: object; // 参数可操作性代理对象。
  belongTo: Figure;
  constructor(
    figure: Figure,
    drawPath: RouteOperation,
    implying: object | Function,
    context?: any
  ) {
    this.belongTo = figure;
    this.drawPath = drawPath;
    this.parameter = toParameter(implying, context);
  }

  getMatrix() {}
}

export default DrawPath;
