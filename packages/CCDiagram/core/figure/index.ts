import { each, Tree } from "@cc/tools";
import { Combinable, Point } from "../commonType";
import Diagram from "../diagram/index";
import DrawPath, { RouteImply, RouteOperation } from "../drawPath/index";
import { isString } from "lodash";
import Events, { EventOperations } from "../events/index";
import Animate, {
  animateSetting,
  AnimationOperation,
} from "../animation/index";
import { toParameter } from "../parameter/index";
import Panel from "../panel/index";
import Watcher, { Watching } from "../observing/watcher";

export type FigureSetting = {
  parameter: RouteImply;
  path?: string | RouteOperation;
  events?: EventOperations;
  animate?: animateSetting;
  children?: FigureSetting[];
};

export enum AnimationExtension {
  Add = "add",
  Remove = "remove",
}

class Figure extends Tree {
  drawPath: DrawPath; // 表示的是当前绘制路径内容。
  parameter: any; //
  belongTo: Diagram; // 表示当前图形属于那一块图表。
  events: Events;
  animation: Animate;

  constructor(
    imply: RouteImply,
    path?: string | RouteOperation, // 当前内容不一定存在path内容。
    events?: EventOperations,
    animate?: animateSetting,
    parent?: Figure,
    children?: Figure | Figure[]
  ) {
    super(parent, children);
    this.drawPath = new DrawPath(path);
    // 获取parameter的相关上下文内容。
    this.contextUpdated(imply);
    // proxy给当前对象，方便用户获取需要的数据。并且判断inPath的情况。
    const proxy = this.contextProxy();
    this.events = new Events(proxy, events);
    this.animation = new Animate(proxy, animate);
  }

  set parent(newValue: Figure) {
    super.parent = newValue;
    this.contextUpdated();
  }

  set context(newContext: Diagram) {
    this.belongTo = newContext;
  }

  get context() {
    return this.belongTo;
  }

  // 代理方法,开放指定的相关参数给到调用方，限制接口展示方便获取。
  private contextProxy() {
    const handler = {
      set(target: Figure, key: string, value: any) {
        return (target.parameter[key] = value);
      },
      get(target: Figure, key: string) {
        if (key === "isPointInPath") {
          return (point: Point, canvas?: Panel) => {
            target.drawPath.inPath(
              point,
              canvas || target.belongTo.panel,
              target.parameter
            );
          };
        } else {
          return target.parameter[key];
        }
      },
    };
    return new Proxy(this, handler);
  }

  // 更新watcher之中的上下文内容。
  contextUpdated(implying?: object | Function) {
    const context = this.parent.parameter;
    if (this.parameter) {
      this.parameter["_context"] = context;
    } else {
      this.parameter = toParameter(implying, context);
      const watcher = Watching(
        null,
        () => {
          Object.keys(this);
          return this;
        },
        (_res) => {
          this.belongTo.needToDraw();
        }
      );
      this.parameter["origin"].subscribe();
    }
  }

  // 映射表更新。
  implyUpdated(implying: object | Function) {
    this.parameter.implyUpdate(implying);
  }

  implyUpdate(name: string, value: any);
  implyUpdate(name: object | Function, value?: undefined);
  implyUpdate(name: Combinable, value: Combinable) {
    let up;
    if (isString(name)) up = { [name]: value };
    else up = name;
    this.implyUpdated(up); // 更新映射关系。
  }

  // 从diagram处获取到绘制容器panel并绘制当前的内容。
  drawing(canvas?: Panel) {
    // 以广度遍历的形式从下往上绘制内容。
    const container = canvas || this.belongTo.panel; // 获取当前绘制的canvas节点。
    this.notify(
      () => {
        this.drawPath.drawing(container, this.parameter); // 当前节点的绘制
      },
      true,
      false,
      true
    );
  }

  // 开始动画操作。
  animationOperation(operation: AnimationOperation | AnimationExtension) {
    return (name: string | animateSetting, ...meta: any[]) => {
      if (operation in AnimationOperation) {
        this.notify(
          () => {
            // @ts-ignore meta用来传递多个参数，但不一定有参数内容，依据的接口内容进行传递。
            this.animation[<AnimationOperation>operation](name, ...meta);
          },
          false,
          false,
          false
        );
      } else {
        // @ts-ignore 如果为remove的时候只有第一个参数有用，如果过为add方法的时候则需要多个参数。
        this.animation[<AnimationExtension>operation](name, ...meta);
      }
    };
  }

  // 事件触发。
  dispatchEvents(name: string, point: Point, ...meta: any[]) {
    this.notify(
      () => {
        this.events.dispatch(name, point, ...meta);
      },
      false,
      false,
      false
    );
  }
}

export default Figure;

export function toFigure(setting: FigureSetting, context?: Diagram) {
  const figure = new Figure(
    setting.parameter,
    setting.path,
    setting.events,
    setting.animate
  );
  context && (figure.context = context);
  if (setting.children && setting.children.length > 0) {
    each(setting.children)((set) => {
      figure.child = toFigure(set, context);
    });
  }
  return figure;
}
