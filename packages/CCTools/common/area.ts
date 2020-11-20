import { multiply, divide, add } from "lodash";

/**
 * Get Area of Trangle
 * @param bottom {number} Length of bottom edge
 * @param high {number} length of high
 */
export function trangle(bottom: number, high: number) {
  return divide(multiply(bottom, high), 2);
}

export function trapezoid(top: number, bottom: number, high: number) {
  return divide(multiply(add(top, bottom), high), 2);
}

export function rect(bottom: number, high: number) {
  return multiply(bottom, high);
}

export function circle(radius: number) {
  return multiply(Math.pow(radius, 2), Math.PI);
}
