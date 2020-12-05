import { Key } from "../core_v2/commonType";
import { eq } from "lodash";

export function into(str: Key, match: string) {
  return str.toString().toLowerCase().search(match.toLowerCase()) >= 0;
}

export function intoFirst(str: Key, match: string) {
  return str.toString().toLowerCase().search(match.toLowerCase()) === 0;
}

export function is(str: Key, equ: string) {
  return eq(str.toString().toLowerCase(), equ.toLowerCase());
}
