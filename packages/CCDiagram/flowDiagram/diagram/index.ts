import { each, Mapping } from "@cc/tools";
import { Combinable, Point } from "../../core_v2/commonType";
import Figure, { FigureSetting, toFigure } from "../../core_v2/figure/index";
import { isObject, toArray } from "lodash";
import { AnimationOperation } from "../../core_v2/animation/index";
import Panel from "../panel/index";

export type DiagramSetting = {
  [name: string]: FigureSetting;
};
/**
 * 相当于Figure与Panel的关联类，促使两者之间的关联关系。
 */
class Diagram {
  panel: Panel; // 当前Diagram的绘制画布
  figrues: Mapping<string, Figure>; // 过个图形在同一个canvas上面展示。
  constructor(setting: DiagramSetting, panel: Panel | ) {

    this.figrues = new Mapping();
    this.addFigure(setting);
  }

  addFigure(name: string, setting: FigureSetting);
  addFigure(name: DiagramSetting, setting?: never);
  addFigure(name: Combinable, setting: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.addFigure(key, val);
      });
    } else {
      this.figrues.set(name, toFigure(setting));
    }
  }

  private excute(operation: Function, name?: string | string[]) {
    name = name ? toArray(name) : null;
    each(this.figrues)((fig: Figure, key: string) => {
      if (!name || (<string[]>name).find((val) => val === key)) {
        operation(fig, key);
      }
    });
  }

  drawing(name?: string | string[]) {
    this.excute((fig: Figure) => {
      const ctx = this.panel.canvasDom.getContext("2d");
      fig.drawing(ctx);
    }, name);
  }

  // 事件触发。
  dispatchEvent(name?: string | string[]) {
    return (events: string, point: Point, ...meta: any[]) => {
      this.excute((fig: Figure) => {
        fig.dispatchEvents(events, point, ...meta);
      }, name);
    };
  }

  // 动画相关操作。
  animationOperation(
    name?: string | string[],
    operation: AnimationOperation = AnimationOperation.Dispatch
  ) {
    return (animate: string, ...meta: any[]) => {
      this.excute((fig: Figure) => {
        fig.animationOperation(operation)(animate, ...meta);
      }, name);
    };
  }
}

export default Diagram;
