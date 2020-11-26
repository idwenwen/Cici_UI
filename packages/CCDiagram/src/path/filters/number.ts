import { each } from "@cc/tools";
import { isNumber } from "lodash";
import { numberSetting } from "../typeDeclare";
import { exception } from "./exception";

// <
function less(origin: number | string, compare: number | string) {
  return origin < compare;
}

// <=
function lessOrEqual(origin: number | string, compare: number | string) {
  return origin <= compare;
}

// >
function bigger(origin: number | string, compare: number | string) {
  return origin > compare;
}

// >=
function biggerOrEqual(origin: number | string, compare: number | string) {
  return origin >= compare;
}

// isNumber
export function isNum(origin: any) {
  return isNumber(origin);
}

/**
 * template：
 * variable: {
 *  isNumber: true,
 *  min: number,
 *  max: number,
 *  boundary: boolean // can equals to boundary
 * }
 */
function numberFilter(origin: number, setting: numberSetting) {
  function number(str, ...content) {
    let hasChecked = true;
    each(str)((val, index) => {
      if (val.search(">") >= 0) {
        if (
          !(val.search("=") >= 0
            ? biggerOrEqual(origin, content[index])
            : bigger(origin, content[index]))
        ) {
          hasChecked = false;
          throw exception();
        }
      } else if (val.search("<") >= 0) {
        if (
          !(val.search("=") >= 0
            ? lessOrEqual(origin, content[index])
            : less(origin, content[index]))
        ) {
          hasChecked = false;
          throw exception();
        }
      }
    });
    return hasChecked;
  }

  const str = [];
  const content = [];
  if (setting.max) {
    str.push(">" + setting.boundary ? "=" : "");
    content.push(setting.max);
  }
  if (setting.min) {
    str.push("<" + setting.boundary ? "=" : "");
    content.push(setting.min);
  }
  return number(str, ...content);
}

export default numberFilter;
