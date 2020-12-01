import { domOperation, each } from "@cc/tools";

/**
 * 路径变形，通过canvas之中的transform的操作，或者svg通过dom内容的形式来进行变形
 * P.S. 当前版本暂时只支持canvas方便的变形。
 */
class Matrix {
  translateX: number; // Horizontal displacement
  translateY: number;
  rotateX: number;
  rotateY: number;
  scaleX: number;
  scaleY: number;
  constructor({
    translateX = 0,
    translateY = 0,
    rotateX = 0,
    rotateY = 0,
    scaleX = 1,
    scaleY = 1,
  } = {}) {
    this.translateX = translateX;
    this.translateY = translateY;
    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.scaleY = scaleY;
    this.scaleX = scaleX;
  }
}

export class CanvasMatrix extends Matrix {
  transform(container: CanvasRenderingContext2D) {
    container.setTransform(
      this.scaleX,
      this.rotateX,
      this.rotateY,
      this.scaleY,
      this.translateX,
      this.translateY
    );
  }

  static reset(container: CanvasRenderingContext2D) {
    container.setTransform(1, 0, 0, 1, 0, 0);
  }

  translate(x: number, y: number) {
    this.translateX = x;
    this.translateY = y;
  }
}

export class DomMatrix extends Matrix {
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

  transform(dom: HTMLElement) {
    domOperation.setStyle(dom, {
      translate: this
        .splicing`translateX(${this.translateX}) translateY(${this.translateY}) rotateX(${this.rotateX}) rotateY(${this.rotateY}) scaleX(${this.scaleX}) scaleY(${this.scaleY})`,
      "-webkit-transform": this
        .splicing`translateX(${this.translateX}) translateY(${this.translateY}) rotateX(${this.rotateX}) rotateY(${this.rotateY}) scaleX(${this.scaleX}) scaleY(${this.scaleY})`,
      "-moz-transform": this
        .splicing`translateX(${this.translateX}) translateY(${this.translateY}) rotateX(${this.rotateX}) rotateY(${this.rotateY}) scaleX(${this.scaleX}) scaleY(${this.scaleY})`,
      "-ms-transform": this
        .splicing`translateX(${this.translateX}) translateY(${this.translateY}) rotateX(${this.rotateX}) rotateY(${this.rotateY}) scaleX(${this.scaleX}) scaleY(${this.scaleY})`,
    });
  }

  /**
   * 删除当前dom元素的变换样式。
   * @param dom HTMLElement
   */
  static reset(dom: HTMLElement) {
    domOperation.removeStyle(dom, [
      "translate",
      "-webkit-transform",
      "-moz-transform",
      "-ms-transform",
    ]);
  }
}

export default Matrix;
