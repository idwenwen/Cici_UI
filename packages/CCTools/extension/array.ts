/**
 * Extension for Array, including：
 * 1. iterator
 */
import { isArray, isFunction, toArray, isObject } from "lodash";
import { display, Exception } from "../common/exception";

type eachOperation = (
  val: any,
  index?: any,
  origin?: Array<any> | Map<any, any> | object
) => any;

export function each(
  list: Array<any> | Map<any, any> | object,
  reverse: boolean = false
): Function {
  return (operation: eachOperation) => {
    let result: any[] | object = [];
    const isArr: boolean = isArray(list);
    const origin = isArr && reverse ? (<Array<any>>list).reverse() : list;
    try {
      if (isArr) {
        for (let i = 0, l = (<Array<any>>origin).length; i < l; i++) {
          (<any[]>result).push(operation(origin[i], i, origin));
        }
      } else if (isObject(origin)) {
        result = {};
        for (const key in origin) {
          result[key] = operation(origin[key], key, origin);
        }
      } else {
        for (const val of <Map<any, any>>origin) {
          (<any[]>result).push(operation(val[1], val[0], origin));
        }
      }
      return result;
    } catch (err) {
      display.log("Iterator has been broken");
      return result; // Return result has got got from iteration
    }
  };
}

export function eachRight(list: Array<any>) {
  return each(list, true);
}

function deleteByIndex(
  list: Array<any>,
  indexs: number | Array<number>
): Array<any> {
  indexs = toArray(indexs);
  indexs = (<Array<number>>indexs).sort((a, b) => {
    if (a < b) return 1;
    else return 0;
  });
  each(indexs)((index) => {
    list.splice(index, 1);
  });
  return list;
}

export function remove(list: Array<any>, compare: any, all: boolean = false) {
  const needToDelete = each(list)((val, index) => {
    if (isFunction(compare)) {
      if (compare(val, index)) {
        needToDelete.push(index);
        if (!all) {
          throw new Exception(
            "BreakArray",
            "Break iteration",
            Exception.level.Info,
            false
          );
        }
      }
    }
  });
  return deleteByIndex(list, needToDelete);
}
