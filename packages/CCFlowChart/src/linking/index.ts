/**
 * 链接内容
 */
import { Panel, toPanel } from "@cc/diagram";
import { Mapping, UUID } from "@cc/tools";
import PanelManager from "../panelManager";
import config from "./config";
import Curve from "./curve";

type Point = [number, number];

class GlobalLinking {
  comps: Mapping<string, Linking>;

  set(name: string, content: Linking) {
    this.comps.set(name, content);
  }

  get(name: string) {
    return this.comps.get(name);
  }
}

export const globalComponents = new GlobalLinking();

const linkingId = new UUID();

class Linking {
  uuid: string;
  startPoint: Point; // 连接起始点
  endPoint: Point; // 连接终点

  panel: Panel;

  constructor(startPoint: Point, endPoint: Point, name?: string) {
    this.uuid = name || linkingId.get().toString();
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.panel = toPanel(this.toSetting());
    globalComponents.set(this.uuid, this);
  }

  private toParameter() {
    return {
      startPoint() {
        const point = [parseFloat(this.style.top), parseFloat(this.style.left)];
        const width = this.width;
        const height = this.height;
        return [
          point[0] + (height * config.panelBorder) / 2,
          point[1] + (width * config.panelBorder) / 2,
        ];
      },
      endPoint() {
        const point = [parseFloat(this.style.top), parseFloat(this.style.left)];
        const width = this.width;
        const height = this.height;
        return [
          point[0] + height - (height * config.panelBorder) / 2,
          point[1] + width - (width * config.panelBorder) / 2,
        ];
      },
      choosed: false,
    };
  }

  private toEvents() {
    return {
      choose() {
        this.choosed = true;
      },
      unchoose() {
        this.choosed = false;
      },
    };
  }

  private combine() {
    return {
      parameter: this.toParameter(),
      events: this.toEvents(),
      children: [new Curve().toSetting()],
    };
  }

  toSetting() {
    const { pos, width, height } = this.getOrigin(
      this.startPoint,
      this.endPoint
    );
    const panel: any = new PanelManager().toSetting(
      width,
      height,
      <[number, number]>pos
    );
    panel.diagram = {
      linking: this.combine,
    };
    return panel;
  }

  private getOrigin(start: Point, end: Point) {
    const pos = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
    const bot = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];
    const width = bot[1] - pos[1];
    const height = bot[0] - pos[0];
    const widthBorder = (width / (1 - config.panelBorder) - width) / 2;
    const heightBorder = (height / (1 - config.panelBorder) - height) / 2;
    pos[0] = pos[0] - heightBorder;
    pos[1] = pos[1] - widthBorder;
    return {
      pos,
      width: width / (1 - config.panelBorder),
      height: height / (1 - config.panelBorder),
    };
  }

  private updatePanelAndDiagram() {
    const { pos, width, height } = this.getOrigin(
      this.startPoint,
      this.endPoint
    );
    this.panel.style.set({
      width: width + "px",
      height: height + "px",
      top: pos[0] + "px",
      left: pos[1] + "px",
    });
  }

  changeStart(point: Point) {
    this.startPoint = point;
    this.updatePanelAndDiagram();
  }

  changeEnd(point: Point) {
    this.endPoint = point;
    this.updatePanelAndDiagram();
  }

  changePos(startPoint: Point, endPoint: Point) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.updatePanelAndDiagram();
  }
}

export default Linking;
