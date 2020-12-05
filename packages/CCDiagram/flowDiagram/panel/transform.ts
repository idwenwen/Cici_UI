import { define, each } from "@cc/tools";
import { eq } from "lodash";

/**
 * Dom内容transform相关属性的设置。
 */
const matrixAttr = [
  "translateX",
  "translateY",
  "rotateX",
  "rotateY",
  "scaleX",
  "scaleY",
];

type TransformAttr = {
  [matrixAttr: string]: number;
};

class Transform {
  transform: TransformAttr;

  constructor(transform: TransformAttr) {
    each(matrixAttr)((funcName) => {
      this[funcName] = (val: number) => {
        !eq(this.transform[funcName]) && (this.transform[funcName] = val);
      };
    });
  }

  translate(x: number, y: number) {}
}
