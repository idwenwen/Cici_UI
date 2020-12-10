import { Panel } from "@cc/diagram";
import { UUID } from "@cc/tools";
import Components from ".";

const PanelId = new UUID((index) => `panel_${index}`);

// 当前组件主要用于管理Panel内容的相关推算以及diagram之中Panel对象的修改
class PanelManager {
  static width: number = 400;
  static height: number = 150;
  static point: [number, number] = [0, 0];

  uuid: string; // 唯一标识符

  constructor(
    width: number = PanelManager.width,
    height: number = PanelManager.height,
    point: [number, number] = PanelManager.point
  ) {
    this.uuid = PanelId.get().toString();
  }

  // panel内容设置。
  private panelSetting(width, height, point) {
    return {
      id: this.uuid,
      width,
      height,
      style: {
        position: "absolute", // 绝对布局形式
        top: point[0], // 绝对布局上偏移
        left: point[1], // 绝对布局左偏移
      },
    };
  }
}

export default PanelManager;
