/**
 * Managing transform of component
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
}

export default Matrix;
