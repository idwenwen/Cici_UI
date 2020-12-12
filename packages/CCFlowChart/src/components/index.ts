import { Panel, toPanel } from "@cc/diagram";
import { Styles } from "@cc/diagram/panel/style";
import { each, Exception, Mapping } from "@cc/tools";
import { config } from "./config";
import Content from "./content";
import PanelManager from "../panelManager";
import Ports from "./ports";

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
  comps: Mapping<string, Components>;
  count: object;

  getDefaultName(type: string) {
    const count = this.count[type] || 0;
    this.count[type] = count + 1;
    return `${type}_${count}`;
  }

  set(type: string, comp: Components) {
    this.comps.set(type, comp);
  }

  get(name: string) {
    return this.comps.get(name);
  }
}

export const globalComponents = new GlobalComponentsManage();

class Components {
  name: string; // 当前组件的名称
  type: string; // 组件类型
  status: ComponentsStatus;
  disable: boolean; //当前组件是否运行
  role: Role; // 当前组件展示的角色方
  choosed: boolean; // 组件被选取的状态

  allSingleType: boolean; // 组件单端口设置

  panelManager: Panel;
  constructor(
    type: string, // 组件类型
    status: string, // 当前组件的状态
    disable: boolean, // 当前组件是否是不需要运行的。
    choosed: boolean, // 当前组件是否被选择

    name?: string, // 当前组件名称
    role?: string, // 当前组件针对的角色

    allSingleType: boolean = false
  ) {
    this.name = name || globalComponents.getDefaultName(type);
    this.type = type;

    this.status = this.matchStatus(status);
    this.role = this.matchRole(role);

    this.disable = disable;
    this.choosed = choosed;

    this.allSingleType = allSingleType;
    this.panelManager = null;
    globalComponents.set(this.type, this);
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

  toSetting() {
    return {
      parameter: {
        name: this.name,
        width() {
          return parseFloat(this.style.width) * (1 - config.panelBorder);
        },
        height() {
          return parseFloat(this.style.height) * (1 - config.panelBorder);
        },
        radius() {
          const times = 0.005;
          const min_radius = 2;
          const max_radius = 20;
          const width = parseFloat(this.style.width);
          let radius = width * times;
          radius =
            radius < min_radius
              ? min_radius
              : radius > max_radius
              ? max_radius
              : radius;
          return radius;
        },
        choosed: this.choosed,
        status: this.status,
        disable: this.disable,
        center() {
          return [
            parseFloat(this.style.width) / 2,
            parseFloat(this.style.height) / 2,
          ];
        },
      },
      children: [
        new Content().toSetting(),
        new Ports(this.type, this.allSingleType, this.role).toSetting(),
      ],
    };
  }

  toSettingTree(width?: number, height?: number, point?: [number, number]) {
    const panel: any = new PanelManager().toSetting(width, height, point);
    panel.diagram = {
      component: this.toSetting(),
    };
    return panel;
  }

  render(width?: number, height?: number, point?: [number, number]) {
    const setting = this.toSettingTree(width, height, point);
    this.panelManager = toPanel(setting);
  }

  setStyle(style: object) {
    this.panelManager.style.set(<Styles>style);
  }

  removeStyle(styles: string | string[]) {
    this.panelManager.style.remove(styles);
  }

  rotate(angle: number) {
    this.panelManager.transfrom.rotate(angle);
  }

  translate(x: number, y: number) {
    this.panelManager.transfrom.translate(x, y);
  }

  scale(times: number) {
    this.panelManager.transfrom.scale(times);
  }

  getFigure(combination: Function) {}
}

export default Components;
