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

  reset(container: CanvasRenderingContext2D) {
    container.setTransform(1, 0, 0, 1, 0, 0);
  }

  translate(x: number, y: number) {
    this.translateX = x;
    this.translateY = y;
  }
}

export default Matrix;
