import { each } from "@cc/tools";
import { isString } from "lodash";
import { stringSetting } from "./type";
import { exception } from "./exception";

// isString
export function isStr(origin: any) {
  return isString(origin);
}

// match xxxx
function match(origin: string, match: RegExp | string) {
  return origin.match(match);
}

// length ${number}
function len(origin: string, len) {
  return origin.length <= len;
}

/**
 * {
 *  isString: boolean
 *  match: xxxx,
 *  length: number
 * }
 */
function stringFilter(origin: string, setting: stringSetting) {
  function string(str, ...content) {
    let hasChecked = true;
    each(str)((val, index) => {
      if (val.toLowerCase().search("match") >= 0) {
        if (!match(origin, content[index])) {
          hasChecked = false;
          throw exception();
        }
      } else if (val.toLowerCase().search("lenght") >= 0) {
        if (!len(origin, content[index])) {
          hasChecked = false;
          throw exception();
        }
      }
    });
    return hasChecked;
  }

  const str = [];
  const content = [];
  if (setting.match) {
    str.push("match");
    content.push(setting.match);
  }
  if (setting.length) {
    str.push("length");
    content.push(setting.length);
  }
  return string(str, ...content);
}

export default stringFilter;
