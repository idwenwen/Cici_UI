import { Figure } from "@cc/diagram";
import { ComponentsStatus } from ".";

class Content {
  text: string; // 当前需要展示的文本内容
  type: ComponentsStatus; // 当前内容关联类型
  choosed: boolean; // 当前内容是否被选中
  figure: Figure; // 当前组件对应展示图内容。

  constructor(text: string, type: ComponentsStatus, choosed: boolean = false) {
    this.text = text;
    this.type = type;
    this.choosed = choosed;
    this.figure = null;
  }

  toSetting() {
    return {
      'content': {
        parameter: {
          text: this.text,
          width:
        }
      }
    }
  }
}
