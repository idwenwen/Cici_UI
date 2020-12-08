import { define, domOperation, each } from "@cc/tools";
import { eq } from "lodash";
import { Observing } from "packages/CCDiagram/core/observer/index";
import { toRadian } from "packages/CCDiagram/core/path/util";

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

export type TransformAttr = {
  [matrixAttr: string]: number;
};

const DefaultAttr = {
  translateX: 0,
  translateY: 0,
  rotateX: 0,
  rotateY: 0,
  scaleX: 1,
  scaleY: 1,
};

class Transform {
  _transform: TransformAttr;

  constructor(transform: TransformAttr = DefaultAttr) {
    each(matrixAttr)((funcName) => {
      this[funcName] = (val: number) => {
        !eq(this._transform[funcName]) && (this._transform[funcName] = val);
      };
    });
    this.transform(transform);
  }

  transform(transform: TransformAttr) {
    each(transform)((translate, key) => {
      this[key](translate);
    });
  }

  /**
   * 当前dom元素tranlate的距离。
   * @param x x轴方向的移动距离
   * @param y y轴方向的移动距离
   */
  translate(x: number, y: number) {
    this["translateX"](x);
    this["translateY"](y);
  }

  /**
   * 设置当前的旋转角度。
   * @param angle 角度计数角度。
   */
  rotate(angle: number) {
    const real = toRadian(angle);
    this["rotateX"](real);
    this["rotateY"](-real);
  }

  /**
   * 缩放设置
   * @param x x轴方向的缩放倍数
   * @param y y轴方向的缩放倍数
   */
  scale(x: number, y?: number) {
    this["scaleX"](x);
    this["scaleY"](y || x);
  }

  /**
   * 订阅当前内容。
   */
  subscribe() {
    // 当前数据对象可以订阅。
    if (!(this._transform instanceof Proxy)) {
      this._transform = Observing(this._transform);
    }
  }

  private splicing(str, ...checked) {
    return each(str)((val, index) => {
      if (val.search("scale") >= 0) {
        if (checked[index] !== 1) {
          return val + ":" + checked[index];
        }
      } else {
        if (checked[index] !== 0) {
          return val + ":" + checked[index];
        }
      }
    }).join(" ");
  }

  setTransform(dom: HTMLElement) {
    domOperation.setStyle(dom, {
      translate: this
        .splicing`translateX(${this._transform.translateX}) translateY(${this._transform.translateY}) rotateX(${this._transform.rotateX}) rotateY(${this._transform.rotateY}) scaleX(${this._transform.scaleX}) scaleY(${this._transform.scaleY})`,
      "-webkit-transform": this
        .splicing`translateX(${this._transform.translateX}) translateY(${this._transform.translateY}) rotateX(${this._transform.rotateX}) rotateY(${this._transform.rotateY}) scaleX(${this._transform.scaleX}) scaleY(${this._transform.scaleY})`,
      "-moz-transform": this
        .splicing`translateX(${this._transform.translateX}) translateY(${this._transform.translateY}) rotateX(${this._transform.rotateX}) rotateY(${this._transform.rotateY}) scaleX(${this._transform.scaleX}) scaleY(${this._transform.scaleY})`,
      "-ms-transform": this
        .splicing`translateX(${this._transform.translateX}) translateY(${this._transform.translateY}) rotateX(${this._transform.rotateX}) rotateY(${this._transform.rotateY}) scaleX(${this._transform.scaleX}) scaleY(${this._transform.scaleY})`,
    });
  }
}

export default Transform;
