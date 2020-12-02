import { each, Mapping } from "@cc/tools";
import { Combinable, Point } from "../commonType";
import Figure, { FigureSetting, toFigure } from "../figure/index";
import Panel, { PanelSetting, toPanel } from "../panel/index";
import { isObject, toArray } from "lodash";
import { AnimationOperation } from "../animation/index";

export type DiagramSetting = {
  panel: PanelSetting;
  figure: {
    [figureName: string]: FigureSetting;
  };
};

class Diagram {
  panel: Panel; // 创建当前Diagram的相关属性。
  figrues: Mapping<string, Figure>; // 过个图形在同一个canvas上面展示。
  constructor(setting: DiagramSetting) {
    this.panel = toPanel(setting.panel);
    this.figrues = new Mapping();
    this.addFigure(setting.figure);
  }

  addFigure(name: string, setting: FigureSetting);
  addFigure(
    name: {
      [figureName: string]: FigureSetting;
    },
    setting?: never
  );
  addFigure(name: Combinable, setting: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.addFigure(key, val);
      });
    } else {
      this.figrues.set(name, toFigure(setting, this));
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
      fig.drawing();
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
