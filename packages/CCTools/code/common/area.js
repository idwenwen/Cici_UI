import { multiply, divide, add } from "lodash";
export function trangle(bottom, high) {
    return divide(multiply(bottom, high), 2);
}
export function trapezoid(top, bottom, high) {
    return divide(multiply(add(top, bottom), high), 2);
}
export function rect(bottom, high) {
    return multiply(bottom, high);
}
export function circle(radius) {
    return multiply(Math.pow(radius, 2), Math.PI);
}
//# sourceMappingURL=area.js.map