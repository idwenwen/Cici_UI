import config from "../config";

class Curve {
  private toParameter() {
    return {
      // 开始点
      startPoint() {
        return this.startPoint;
      },
      // 结束点
      endPoint() {
        return this.endPoint;
      },
      color() {
        if (this.choosed) {
          return config.LINE_BRIGHT_STYLE;
        } else {
          return config.LINE_STYLE;
        }
      },
      lineWidth() {
        let origin = config.maxLineWidth;
        if (this.choosed) {
          return origin * config.lineBright;
        } else {
          return origin;
        }
      },
      arrow: config.withArrow,
      dash: true, // 当前线为虚线
    };
  }

  private toEvents() {
    return {
      toSolid() {
        // 修改当前特性为实线
        this.dash = false;
      },
      toDash() {
        this.dash = true;
      },
      showArrow() {
        this.arrow = true;
      },
      hideArrow() {
        this.arrow = false;
      },
    };
  }

  toSetting() {
    return {
      parameter: this.toParameter,
      path: "curve",
      events: this.toEvents(),
    };
  }
}

export default Curve;
