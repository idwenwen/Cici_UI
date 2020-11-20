import { isArray, isFunction, toArray, isObject } from "lodash";
import { display, Exception } from "../common/exception";
export function each(list, reverse = false) {
    return (operation) => {
        let result = [];
        const isArr = isArray(list);
        const origin = isArr && reverse ? list.reverse() : list;
        try {
            if (isArr) {
                for (let i = 0, l = origin.length; i < l; i++) {
                    result.push(operation(origin[i], i, origin));
                }
            }
            else if (isObject(origin)) {
                result = {};
                for (const key in origin) {
                    result[key] = operation(origin[key], key, origin);
                }
            }
            else {
                for (const val of origin) {
                    result.push(operation(val[1], val[0], origin));
                }
            }
            return result;
        }
        catch (err) {
            display.log("Iterator has been broken");
            return result;
        }
    };
}
export function eachRight(list) {
    return each(list, true);
}
function deleteByIndex(list, indexs) {
    indexs = toArray(indexs);
    indexs = indexs.sort((a, b) => {
        if (a < b)
            return 1;
        else
            return 0;
    });
    each(indexs)((index) => {
        list.splice(index, 1);
    });
    return list;
}
export function remove(list, compare, all = false) {
    const needToDelete = each(list)((val, index) => {
        if (isFunction(compare)) {
            if (compare(val, index)) {
                needToDelete.push(index);
                if (!all) {
                    throw new Exception("BreakArray", "Break iteration", Exception.level.Info, false);
                }
            }
        }
    });
    return deleteByIndex(list, needToDelete);
}
export function getLast(list, fromIndex, compare) {
    const current = list[fromIndex];
    if (!current) {
        return null;
    }
    else {
        const val = isFunction(compare)
            ? compare(current)
            : current[compare];
        if (val) {
            return val;
        }
        else {
            return getLast(list, fromIndex - 1, compare);
        }
    }
}
//# sourceMappingURL=array.js.map