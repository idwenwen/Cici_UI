import { Tree } from "@cc/tools";
import { Combinable, Point } from "../commonType";
import Diagram from "../diagram/index";
import DrawPath, { RouteImply, RouteOperation } from "./drawPath/index";
import { isString } from "lodash";
import Events, { EventOperations } from "../events/index";
import Animate, { animateSetting } from "../animation/index";
import { toParameter } from "./parameter/index";

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
    this.drawPath = new DrawPath(<Figure>this, path);
    // 获取parameter的相关上下文内容。
    this.contextUpdated(imply);
    // TODO: proxy给当前对象，方便用户获取需要的数据。
    this.events = new Events(this.parameter, events);
    this.animation = new Animate(this.parameter, animate);
  }

  set parent(newValue: Figure) {
    super.parent = newValue;
    this.contextUpdated();
  }

  // TODO: 代理方法。
  private contextProxy() {}

  // 更新watcher之中的上下文内容。
  contextUpdated(implying?: object | Function) {
    const context = this.parent.parameter;
    if (this.parameter) {
      this.parameter.watching(context);
    } else {
      this.parameter = toParameter(implying, context);
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
  drawing(canvas?: any) {
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

  startAnimate(name: string, ...meta: any[]) {
    this.notify(
      () => {
        this.animation.dispatch(name, ...meta);
      },
      false,
      false,
      false
    );
  }

  startEvents(name: string, point: Point, ...meta: any[]) {
    this.drawPath.inPath(point, this.parameter); // 判定当前触发点是否在组件范围内。
  }
}

export default Figure;
