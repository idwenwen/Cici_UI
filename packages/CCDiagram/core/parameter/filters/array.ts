import { each, Exception } from "@cc/tools";
import { arraySetting } from "../typeDeclare";
import { exception } from "./exception";
import { toArray } from "lodash";
import { match } from "./index";

// isArray [...]
function isArr(origin: any) {
  return Array.isArray(origin);
}

// length number
function len(origin: any, len: number) {
  return origin.length <= len;
}

/**
 * {
 *  isArray: boolean,
 *  itemCondition: [{
 *    ...
 *  }],
 *  length: number
 * }
 */
function arrayFilter(origin: Array<any>, setting: arraySetting) {
  function array(str, ...content) {
    let hasChecked = false;
    each(str)((val, index) => {
      if (val.toLowerCase().search("length") >= 0) {
        if (len(origin, content[index])) {
          hasChecked = true;
          throw exception();
        }
      } else if (val.toLowercase().search("condition")) {
        const compare = toArray(val);
        let checkedAll = true;
        for (const item of origin) {
          let checked = false;
          for (const set of compare) {
            if (match(item, set)) {
              checked = true;
              break;
            }
          }
          if (!checked) {
            checkedAll = false;
            break;
          }
        }
        if (!checkedAll) {
          hasChecked = false;
          throw exception();
        }
      }
    });
    return hasChecked;
  }

  const str = [];
  const content = [];
  if (setting.condition) {
    str.push("condition");
    content.push(setting.condition);
  }
  if (setting.length) {
    str.push("length");
    content.push(setting.length);
  }
  return array(str, ...content);
}

export default arrayFilter;
