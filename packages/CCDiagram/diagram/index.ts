import { each, Mapping, remove, UUID } from "@cc/tools";
import { Combinable, Point } from "../commonType";
import Figure, { FigureSetting, toFigure } from "../figure/index";
import { isObject, toArray } from "lodash";
import { AnimationOperation } from "../animation/index";
import Panel, { PanelSetting } from "../panel/index";
import { toPanel } from "../panel/index";
import renderController, { Drawable } from "../controller/drawing";

export type DiagramFigure = {
  [name: string]: FigureSetting;
};

const DiagramId = new UUID((index) => `Diagram_${index}`);
/**
 * 相当于Figure与Panel的关联类，促使两者之间的关联关系。
 */
class Diagram {
  uuid: string;
  panel: Panel; // 当前Diagram的绘制画布
  figrues: Mapping<string, Figure>; // 过个图形在同一个canvas上面展示。
  constructor(setting: DiagramFigure, panel?: Panel | PanelSetting) {
    this.uuid = DiagramId.get().toString();
    this.figrues = new Mapping();
    this.addFigure(setting);
    this.setPanel(panel);
  }

  /********************panel的相关观察 ****************/
  setPanel(panel: Panel | PanelSetting) {
    if (!(panel instanceof Panel)) {
      panel.diagram
        ? (!Array.isArray(panel.diagram)
            ? (panel.diagram = toArray(panel.diagram))
            : void 0,
          // @ts-ignore
          panel.diagram.push(this))
        : (panel.diagram = this);
      panel = toPanel(panel);
    }
    this.panel = panel;
    renderController.render(new Drawable(this.panel.dom, this.drawing));
  }

  /********************Figure内容管理与联动 ***********/
  addFigure(name: string, setting: FigureSetting);
  addFigure(name: DiagramFigure, setting?: never);
  addFigure(name: Combinable, setting: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.addFigure(key, val);
      });
    } else {
      const figureTree = toFigure(setting); // Figure设置
      figureTree.connection(null, this.panel); // 将当前首个figure内容连接到panel本身数据内容。
      this.figrues.set(name, figureTree);
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
      each(this.panel)((panel) => {
        const ctx = panel.dom.getContext("2d");
        fig.drawing(ctx);
      });
    }, name);
  }

  // 事件触发。
  dispatchEvent(name?: string | string[]) {
    return (events: string, ...meta: any[]) => {
      this.excute((fig: Figure) => {
        fig.dispatchEvents(events, ...meta);
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

  /**
   * 当figure变化的时候，相关的diagram将会重绘
   */
  updated() {
    each(this.panel)((panel: Panel) => {
      renderController.add(
        new Drawable(panel.dom, (_ctx: any) => {
          this.drawing();
        })
      );
    });
  }
}

export default Diagram;
