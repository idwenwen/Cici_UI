import { toChain } from "@cc/diagram/controller/action/chain";
import { ComponentsStatus } from "..";

const CHOOSE = "#4159D1";
const SUCCESS = "#0EC7A5";
const PROGRESS = "rgba(36,182,139,0.6)";
const DISABLE_PROGRESS = "rgba(187,187,200,0.6)";
const ERROR = "#FF4F38";
const UNRUN = "#e8e8ef";
const COULDNOTRUN = "#BBBBC8";

class ContainerContent {
  private toParameter() {
    return {
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
          if (this.status === ComponentsStatus.running) {
            return this.disable ? DISABLE_PROGRESS : PROGRESS;
          }
          return CHOOSE;
        } else if (this.disable && this.status !== ComponentsStatus.unrun) {
          return UNRUN;
        } else if (this.disable && this.status === ComponentsStatus.unrun) {
          return COULDNOTRUN;
        } else if (this.status === ComponentsStatus.success) {
          return SUCCESS;
        } else if (this.status === ComponentsStatus.running) {
          if (this.disable) {
            return DISABLE_PROGRESS;
          } else {
            return PROGRESS;
          }
        } else if (this.status === ComponentsStatus.fail) {
          return ERROR;
        } else if (this.statu === ComponentsStatus.unrun) {
          return UNRUN;
        }
      },
      center() {
        return this.center;
      },
      fill: true,
      progress: 1,
    };
  }

  private loading() {
    let originColor;
    const getOpacity = () => {
      return parseFloat(originColor.split(",")[3]);
    };
    return toChain({
      list: [
        {
          variation(_progress) {
            this.color = originColor;
            this.progress = 0;
          },
          time: 0,
        },
        {
          variation(progress) {
            this.progress = progress;
          },
          time: 1000,
        },
        {
          variation(progress) {
            if (!originColor) originColor = this.color;
            const origin = this.color.split(",");
            const bet = getOpacity() * (1 - progress);
            origin[3] = origin[3].replace(/[0-9|\.]+/, bet);
            return origin.join(",");
          },
          time: 500,
        },
      ],
      repeat: true,
    });
  }

  private toNewType() {}
}
