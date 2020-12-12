/**
 * 当前对象主要用于管理组件与组件之间的关系。一段关系主要是用两个组件与一条方向曲线组合
 */

import Components from "../components";
import Linking from "../linking";

class ComponentConnection {
  fromComponent: Components;
  endComponent: Components;
  connection: Linking;

  constructor(
    fromComponent: Components,
    endComponent: Components,
    link: Linking
  ) {
    this.fromComponent = fromComponent;
    this.endComponent = endComponent;
    this.connection = link;
  }

  updated() {}
}

class ChartConnection {}
