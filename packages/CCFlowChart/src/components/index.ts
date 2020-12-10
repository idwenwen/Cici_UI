import Port from "./port";
import { each, Exception, Mapping } from "@cc/tools";
import { Diagram } from "@cc/diagram";
import { portConfig } from "./ports/portConfig";
import PanelManager from "./panel";

// 组件状态
export enum ComponentsStatus {
  unrun = "unrun|waiting",
  running = "running",
  fail = "failed|error|canceled",
  success = "success|complete",
}

export enum Role {
  Guest = "guest",
  Host = "host",
  Arbit = "arbit",
}

class GlobalComponentsManage {
  comps: Mapping<string, Components[]>;

  getDefaultName(type: string) {
    const list = this.comps.get(type);
    return `${type}_${list.length}`;
  }
}

export const globalComponents = new GlobalComponentsManage();

class Components {
  name: string; // 当前组件的名称
  type: string; // 组件类型
  status: ComponentsStatus;
  disable: boolean; //当前组件是否运行
  role: Role; // 当前组件展示的角色方

  inputPort: Port[]; // 当前组件入口。
  outputPort: Port[]; // 当前组件出口。

  panel: PanelManager;
  constructor(
    type: string, // 组件类型
    status: string, // 当前组件的状态
    disable: boolean, // 当前组件是否是不需要运行的。

    name?: string, // 当前组件名称
    role?: string, // 当前组件针对的角色

    singlePort: boolean = false, // 是否为单端口形式
    multiple: boolean = false // 是否可以多次连接。
  ) {
    this.name = name || globalComponents.getDefaultName(type);
    this.type = type;

    this.status = this.matchStatus(status);
    this.role = this.matchRole(role);

    this.disable = disable;

    const ports = this.matchPort(type, singlePort, multiple);
    this.inputPort = <Port[]>ports.input;
    this.outputPort = <Port[]>ports.output;
  }

  // 判定当前的展示状态
  private matchStatus(status: string) {
    status = status.toLowerCase();
    let res;
    each(ComponentsStatus)((val, key) => {
      if (val.search(status) >= 0) {
        res = key;
        throw new Exception(
          "Breaking",
          "Breaking from iteration",
          Exception.level.Info,
          false
        );
      }
    });
    return ComponentsStatus[res];
  }
  // 匹配当前的用户内容
  private matchRole(role: string) {
    role = role.toLowerCase();
    let res;
    each(Role)((val, key) => {
      if (val.search(role) >= 0) {
        res = key;
        throw new Exception(
          "Breaking",
          "Breaking from iteration",
          Exception.level.Info,
          false
        );
      }
    });
    return Role[res];
  }
  // 依据当前的类型确定组件的端口
  private matchPort(
    type: string,
    singlePort: boolean = false,
    multiple: boolean = false
  ) {
    let { input, output } = portConfig(type, singlePort, multiple);
    input = each(input)((inp) => {
      return new Port(inp.name, inp.type, inp.tip, this);
    });
    output = each(output)((out) => {
      return new Port(out.name, out.type, out.tip, this);
    });
    return {
      input,
      output,
    };
  }

  // 组件连接接入
  linkIn() {}

  // 组件连出, 通知全局生成linking对象内容，并可以拖动。
  linkOut() {}

  // 依据当前将要连接入的类型来判定，当前组件端口是否需要高亮。
  hintLint(willLinkInType: string) {}
}

export default Components;
