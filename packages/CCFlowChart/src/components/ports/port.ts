import { portType } from ".";
import { ComponentsStatus, Role } from "..";
import PortHint from "./portHint";

const DATA_PORT_COLOR = "#E6B258";
const MODEL_PORT_COLOR = "#00cbff";
const DISABLE_INIT_COLOR = "#7F7D8E";
const DISABLE_NO_INIT_COLOR = "#7F7D8E";

class Port {
  type: portType; // 当前接口的类型
  name: string; // 当前端口的名称
  tip: string; // 当前标识
  multiple: boolean; // 是否是多入口

  disable: boolean; // 是否为不运行组件的端口
  status: ComponentsStatus;
  role: Role; // 角色信息

  constructor(
    name: string,
    type: portType,
    tip: string,
    multiple: boolean,
    role: Role
  ) {
    this.name = name;
    this.type = type;
    this.tip = tip;
    this.multiple = multiple;
    this.role = role;
  }

  private getParameter() {
    const _t = this;
    const parameter = {
      name: this.name,
      color: function () {
        return this.disable
          ? this.status === ComponentsStatus.unrun
            ? DISABLE_NO_INIT_COLOR
            : DISABLE_INIT_COLOR
          : _t.type === portType.Data
          ? DATA_PORT_COLOR
          : MODEL_PORT_COLOR;
      },
      image: _t.multiple && null, // 引入当前的数据内容
      radius() {
        return this.radius;
      },
      width() {
        return this.width;
      },
      height() {
        return this.height;
      },
      tip: _t.tip,
    };
    return parameter;
  }

  private getEvents() {
    const events = {
      linkFrom: function (eve, point) {
        // 表示从当前点连接出去。
      },
    };
  }

  toSetting() {
    return {
      parameter: this.getParameter(),
      path: this.multiple ? "icon" : "rect",
      events: this.getEvents(),
      children: [new PortHint(this).toSetting()],
    };
  }
}

export default Port;
