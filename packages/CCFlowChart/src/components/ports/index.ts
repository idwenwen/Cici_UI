import { Panel } from "@cc/diagram";
import { each } from "@cc/tools";
import { ComponentsStatus, Role } from "..";
import { config } from "../config";
import Port from "./port";
import { portConfig } from "./portConfig";

export enum portType {
  Data = "data",
  Model = "model",
}

type PortSetting = {
  type: portType;
  name: string;
  tip: string;
  multiple: boolean;
};

class Ports {
  input: Port[]; // 输入口
  output: Port[]; // 输出口
  constructor(type: string, allSingleMode: boolean = false, role?: Role) {
    const { input, output } = portConfig(type, allSingleMode);
    this.input = each(input)((port) => {
      return new Port(port.name, port.type, port.tip, port.multiple, role);
    });
    this.output = each(output)((port) => {
      return new Port(port.name, port.type, port.tip, port.multiple, role);
    });
  }

  private getParameter() {
    return {
      radius: function () {
        const times = 0.005;
        const min_radius = 2;
        const max_radius = 20;
        let radius = this.width * times;
        radius =
          radius < min_radius
            ? min_radius
            : radius > max_radius
            ? max_radius
            : radius;
        return radius;
      },
      width: function () {
        const times = 0.02;
        const min = 12;
        let width = this.width * times;
        width = width < min ? min : width;
        return width;
      },
      height: function () {
        const times = 0.01;
        const min = 4;
        let width = this.width * times;
        width = width < min ? min : width;
        return width;
      },
      center: function () {
        return this.center;
      },
      status() {
        return this.status;
      },
      type() {
        return this.type;
      },
      disable() {
        return this.disable;
      },
    };
  }

  // 确定端口的位置信息
  private getPortPositon(portList: Port[], top: boolean = true) {
    const setting = each(portList)((port, index) => {
      const origin = port.toSetting();
      origin.center = function () {
        const vertical =
          ((this.height * (1 - config.panelBorder)) / 2) * (top ? -1 : 1);
        const len = portList.length + 1;
        const piece = (this.width * (1 - config.panelBorder)) / len;
        const horizen = -(len / 2 - index - 1) * piece;
        return [this.center[0] + horizen, this.center[1] + vertical];
      };
      return origin;
    });
    return setting;
  }

  toSetting() {
    return {
      parameter: this.getParameter(),
      children: [
        ...this.getPortPositon(this.input, true),
        ...this.getPortPositon(this.output, false),
      ],
    };
  }
}

export default Ports;
