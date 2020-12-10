import { toChain } from "@cc/diagram/controller/action";
import { ComponentsStatus } from "..";

const CHOOSE = "#4159D1";
const SUCCESS = "#0EC7A5";
const PROGRESS = "rgba(36,182,139,0.6)";
const DISABLE_PROGRESS = "rgba(187,187,200,0.6)";
const ERROR = "#FF4F38";
const UNRUN = "#e8e8ef";
const COULDNOTRUN = "#BBBBC8";

class Container {
  private toParameter() {
    return {
      width() {
        return this.width;
      },
      height() {
        return this.height;
      },
      center() {
        return this.center;
      },
      radius() {
        return this.radius;
      },
      progress: 1,
      linking: false,
      status() {
        return this.status;
      },
      choosed() {
        return this.choosed;
      },
      disable() {
        return this.disable;
      },
    };
  }
}
