import { toRGBA } from "@cc/tools";
import Port from "./port";

class PortHint {
  port: Port; // 归属于哪一个端口。
  constructor(port: Port) {
    this.port = port;
  }

  private getParameter() {
    return {
      center: function () {
        return this.center;
      },
      radius: function () {
        return this.width * 0.525; // 当前圆半径
      },
      borderWidth: function () {
        return this.radius;
      },
      color: function () {
        return this.color;
      },
    };
  }

  private getEvents() {
    return {
      linkHint(eve, type: string) {
        // 优先判定当前端口是否为入端口
        // 通过传递过来的组件类型判当前端口是否可以连接。如果过可以则展示当前的linkhint调用当前对象的exhibition事件
      },
    };
  }

  private getAnimation() {
    let originWidth;
    return {
      // 展示当前的hint内容的动画
      exhibition: {
        variation: function (progress) {
          if (!originWidth) originWidth = this.parameter.radius;
          this.parameter.radius = originWidth * progress;
        },
        time: 200,
        progress: "EaseIn",
      },
    };
  }

  private childPath() {
    const defP = {
      color() {
        return this.color;
      },
      radius() {
        return this.radius;
      },
      center() {
        return this.center;
      },
      strokeWidth() {
        return this.borderWidth;
      },
    };
    return [
      {
        parameter: Object.assign(defP, {
          stroke: true,
        }),
        path: "circle",
      },
      {
        parameter: Object.assign(defP, {
          fill: true,
          color() {
            const origin = toRGBA(this.color).split(",");
            origin[3] = origin[3].replace(/[0-9|\.]+/, "0.2");
            return origin.join(",");
          },
        }),
        path: "circle",
      },
    ];
  }

  toSetting() {
    return {
      parameter: this.getParameter(),
      display: false,
      events: this.getEvents(),
      animate: this.getAnimation(),
      children: this.childPath(),
    };
  }
}

export default PortHint;
