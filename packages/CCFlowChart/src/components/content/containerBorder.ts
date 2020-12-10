import { ComponentsStatus } from "..";

const CHOOSE = "#4159D1";
const SUCCESS = "#0EC7A5";
const PROGRESS = "rgba(36,182,139,0.6)";
const DISABLE_PROGRESS = "rgba(187,187,200,0.6)";
const ERROR = "#FF4F38";
const UNRUN = "#e8e8ef";
const COULDNOTRUN = "#BBBBC8";

class Border {
  toSetting() {
    return {
      parameter: {
        width() {
          return this.width;
        },
        height() {
          return this.height;
        },
        radius() {
          return this.radius;
        },
        color() {
          if (this.choosed) {
            return CHOOSE;
          } else if (this.disable && this.status !== ComponentsStatus.unrun) {
            return UNRUN;
          } else if (this.disable && this.status === ComponentsStatus.unrun) {
            return COULDNOTRUN;
          } else if (this.status === ComponentsStatus.success) {
            return SUCCESS;
          } else if (this.status === ComponentsStatus.running) {
            return SUCCESS;
          } else if (this.status === ComponentsStatus.fail) {
            return ERROR;
          } else if (this.statu === ComponentsStatus.unrun) {
            return UNRUN;
          }
        },
        center() {
          return this.center;
        },
        stroke: true,
      },
      path: "rect",
    };
  }
}
