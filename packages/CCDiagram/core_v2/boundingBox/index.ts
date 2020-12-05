/**
 * 当前路径的边界盒子。边界盒子表示的是当前路径或者component的大小情况。
 */
const mathMin = Math.min;
const mathMax = Math.max;

class BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x: number, y: number, width: number, height: number) {
    if (width < 0 && isFinite(width)) {
      x = x + width;
      width = -width;
    }
    if (height < 0 && isFinite(height)) {
      y = y + height;
      height = -height;
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  union(other: BoundingRect) {
    const x = mathMin(other.x, this.x);
    const y = mathMin(other.y, this.y);

    if (isFinite(this.x) && isFinite(this.width)) {
      this.width = mathMax(other.x + other.width, this.x + this.width) - x;
    } else {
      this.width = other.width;
    }

    if (isFinite(this.y) && isFinite(this.height)) {
      this.height = mathMax(other.y + other.height, this.y + this.height) - y;
    } else {
      this.height = other.height;
    }

    this.x = x;
    this.y = y;
  }

  copy() {
    return new BoundingRect(this.x, this.y, this.width, this.height);
  }

  static union(...rect: BoundingRect[]) {}
}
