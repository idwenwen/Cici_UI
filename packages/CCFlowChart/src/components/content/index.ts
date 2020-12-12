import Container from "./container";
import TextMeasure from "./text";

// 当前实例主要管理component的展示主体
class Content {
  private toParameter() {
    return {
      text() {
        return this.name; // 获取组件名称
      },
      width() {
        return this.width;
      },
      height() {
        return this.height;
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
        return this.radius;
      },
    };
  }

  private toEvent() {
    return {
      textChange(eve) {
        // 文本修改事件
      },
    };
  }

  toSetting() {
    return {
      parameter: this.toParameter(),
      events: this.toEvent(),
      children: [new Container().toSetting(), new TextMeasure().toSetting()],
    };
  }
}

export default Content;
