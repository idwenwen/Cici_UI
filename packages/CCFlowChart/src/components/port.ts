import Components, { ComponentsStatus } from "./index";

const DATA_PORT_COLOR = "#E6B258";
const MODEL_PORT_COLOR = "#00cbff";
const DISABLE_INIT_COLOR = "#7F7D8E";
const DISABLE_NO_INIT_COLOR = "#7F7D8E";

export enum portType {
  Data = "data",
  Model = "model",
}

class Port {
  type: portType; // 当前接口的类型
  name: string; // 当前端口的名称
  tip: string; // 当前标识
  multiple: boolean; // 是否是多入口
  component: Components; // 当前端口属于的组件

  constructor(
    name: string,
    type: portType,
    tip: string,
    component: Components
  ) {
    this.name = name;
    this.type = type;
    this.tip = tip;
    this.component = component;
  }

  toSetting() {
    const _t = this;
    const inited = this.component.status !== ComponentsStatus.unrun;
    return {
      color: function () {
        this.disable
          ? inited
            ? DISABLE_NO_INIT_COLOR
            : DISABLE_INIT_COLOR
          : _t.type === portType.Data
          ? DATA_PORT_COLOR
          : MODEL_PORT_COLOR;
      },
      radius: function () {
        this.width;
      },
    };
  }
}

export default Port;
