import { UUID } from "@cc/tools";
import { toArray } from "lodash";

const PanelId = new UUID((index) => `panel_${index}`);

// 当前组件主要用于管理Panel内容的相关推算以及diagram之中Panel对象的修改
class PanelManager {
  static width: number = 400;
  static height: number = 150;
  static point: [number, number] = [0, 0];

  uuid: string; // 唯一标识符

  constructor() {
    this.uuid = PanelId.get().toString();
    // 当前panel的设置内容。
  }

  // panel内容设置。
  private panelSetting(
    width,
    height,
    point,
    style: object = {},
    transform: object = {},
    classes?: string | string[]
  ) {
    return {
      id: this.uuid,
      width,
      height,
      style: Object.assign(
        {
          position: "absolute", // 绝对布局形式
          top: point[0] + "px", // 绝对布局上偏移
          left: point[1] + "px", // 绝对布局左偏移
        },
        style
      ),
      transform,
      classes: toArray(classes),
    };
  }

  toSetting(
    width: number = PanelManager.width,
    height: number = PanelManager.height,
    point: [number, number] = PanelManager.point,
    style?: object,
    transform?: object,
    classes?: string | string[]
  ) {
    return this.panelSetting(width, height, point, style, transform, classes);
  }
}

export default PanelManager;
