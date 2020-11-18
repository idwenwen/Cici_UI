import { isObject, assign } from "lodash";
import { each } from "./array";
const DEFAULT_SETTING = {
    configurable: true,
    enumable: true,
    writable: true,
};
function toSetting(descriptor) {
    descriptor = toObject(descriptor);
    descriptor =
        assign({}, DEFAULT_SETTING, descriptor)(descriptor.set || descriptor.get) &&
            delete descriptor.writable;
    return descriptor;
}
function toObject(descriptor) {
    if (!isObject(descriptor) ||
        !descriptor.value ||
        !descriptor.set ||
        !descriptor.get) {
        return { value: descriptor };
    }
    return descriptor;
}
export function define(target, key, descriptor) {
    const setting = toSetting(descriptor);
    if (setting.set || setting.get)
        delete setting.writable;
    return Reflect.defineProperty(target, key, setting);
}
function defOperation(target, key, descriptor) {
    return (setter) => {
        let result;
        const check = (des, key) => {
            const setting = toObject(des);
            setter(setting);
            return define(target, key, setting);
        };
        if (isObject(key)) {
            result = [];
            each(key)((des, key) => {
                if (!check(des, key))
                    result.push(key);
            });
        }
        else {
            result = check(descriptor, key);
        }
        return result;
    };
}
export function defNoEnum(target, key, descriptor) {
    return defOperation(target, key, descriptor)((des) => {
        des.enumable = false;
    });
}
export function defNoConfig(target, key, descriptor) {
    return defOperation(target, key, descriptor)((des) => {
        des.configurable = false;
    });
}
export function defNoEnumConst(target, key, descriptor) {
    return defOperation(target, key, descriptor)((des) => {
        des.configurable = false;
        des.enumable = false;
    });
}
//# sourceMappingURL=object.js.map