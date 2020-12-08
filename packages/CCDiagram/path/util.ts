import { divide, multiple } from "lodash";

function equallyAngle(angle: number) {
  const bet = 360;
  let final = angle;
  while (final > bet || final < 0) {
    final > 0 ? (final -= bet) : (final += bet);
  }
  return final;
}

export function toRadian(angle: number) {
  return multiple(divide(equallyAngle(angle), 360), 2) * Math.PI;
}

export function toAngle(radian: number) {
  return multiple(divide(radian, 2 * Math.PI), 360);
}
