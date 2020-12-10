import { ComponentsStatus } from "..";
import { config } from "../config";

// 当前实例主要管理component的展示主体
class Content {
  private getParameter() {
    return {
      text() {
        return this.name; // 获取组件名称
      },
      width() {
        return this.width * (1 - config.panelBorder);
      },
      height() {
        return this.height * (1 - config.panelBorder);
      },
      // 当前组件的状态，以便方便判定颜色与状态。
      status() {
        return this.status;
      },
      choosed() {
        return this.choosed;
      }, // 当前组件是否被选中
      disable() {
        return this.disable;
      },
      center() {
        return this.center;
      },
      radius() {
        // 半径内容
        return this.radius;
      },
    };
  }
}
