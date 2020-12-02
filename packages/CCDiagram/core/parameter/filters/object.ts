import { each, Exception } from "@cc/tools";
import { isObject } from "lodash";
import { objectSetting } from "./type";
import { exception } from "./exception";
import { match } from "./index";

// isObject , {}
function isObj(origin: any) {
  return isObject(origin);
}

// {${xxx}}
function has(origin: object, require: string) {
  return require in origin;
}

function objectFilter(origin: object, setting: objectSetting) {
  function object(str, ...content) {
    let hasChecked = true;
    each(str)((val, index) => {
      if (val.toLowerCase().search("require") >= 0) {
        const or = Array.from(new Set(Object.keys(origin)));
        const re = Array.from(new Set(Object.keys(setting)));
        const orLength = or;
        const combine = Array.from(new Set(or.concat(re)));
        if (combine.length > orLength.length) {
          hasChecked = false;
          throw exception();
        } else {
          const set = content[index];
          each(origin)((val, key) => {
            if (set[key]) {
              if (!match(val, set[key])) {
                hasChecked = false;
                throw exception();
              }
            }
          });
          if (!hasChecked) throw exception();
        }
      }
    });
    return hasChecked;
  }

  const str = [];
  const content = [];
  if (setting.require) {
    str.push("require");
    content.push(setting.require);
  }
  return object(str, ...content);
}

export default objectFilter;
