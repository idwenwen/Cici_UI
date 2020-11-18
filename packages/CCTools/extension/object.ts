/**
 * Common object operation.
 * 1. Define variable with descriptor
 * 2. Object iterator
 */

import { isObject, assign } from "lodash";
import { each } from "./array";

type Combinable = any;
type objKey = string | number;
type parameterDescriptor = {
  configurable?: boolean;
  enumable?: boolean;
  writable?: boolean;
  value?: any;
  get?: Function;
  set?: Function;
};
type objIteration = (val: any, key?: any, origin?: object) => any;

const DEFAULT_SETTING: parameterDescriptor = {
  configurable: true,
  enumable: true,
  writable: true,
};

/**
 * Get final setting for object
 * @param descriptor descriptor for object variable
 */
function toSetting(descriptor: any) {
  descriptor = toObject(descriptor);
  descriptor =
    assign({}, DEFAULT_SETTING, descriptor)(descriptor.set || descriptor.get) &&
    delete descriptor.writable;
  return descriptor;
}

/**
 * Exchange descriptor to Object-type.
 * @param descriptor descriptor for object variable
 */
function toObject(descriptor: any) {
  if (
    !isObject(descriptor) ||
    !descriptor.value ||
    !descriptor.set ||
    !descriptor.get
  ) {
    return { value: descriptor };
  }
  return descriptor;
}

/**
 * Setting new variable for target
 * @param target
 * @param key
 * @param descriptor
 */
export function define(
  target: object,
  key: objKey,
  descriptor: parameterDescriptor
): boolean {
  const setting = toSetting(descriptor);
  if (setting.set || setting.get) delete setting.writable;
  return Reflect.defineProperty(target, key, setting);
}

/**
 * Common logic for define specical variable
 * @param target
 * @param key
 * @param descriptor
 */
function defOperation(target: object, key: any, descriptor: any): Function {
  return (setter: (des: any) => void) => {
    let result;
    const check = (des, key): boolean => {
      const setting = toObject(des);
      setter(setting);
      return define(target, key, setting);
    };
    if (isObject(key)) {
      result = [];
      each(key)((des, key) => {
        if (!check(des, key)) result.push(key);
      });
    } else {
      result = check(descriptor, key);
    }
    return result;
  };
}

/**
 * Setting new unenumable variable for target
 * @param target
 * @param key
 * @param descriptor
 */
export function defNoEnum(
  target: object,
  key: { [str: string]: any },
  descriptor?: undefined
): boolean;
export function defNoEnum(
  target: object,
  key: objKey,
  descriptor: any
): boolean;
export function defNoEnum(
  target: object,
  key: Combinable,
  descriptor: Combinable
): boolean | string[] {
  return defOperation(
    target,
    key,
    descriptor
  )((des) => {
    des.enumable = false;
  });
}

export function defNoConfig(
  target: object,
  key: { [str: string]: any },
  descriptor?: undefined
): boolean;
export function defNoConfig(
  target: object,
  key: objKey,
  descriptor: any
): boolean;
export function defNoConfig(
  target: object,
  key: Combinable,
  descriptor: Combinable
): boolean {
  return defOperation(
    target,
    key,
    descriptor
  )((des) => {
    des.configurable = false;
  });
}

export function defNoEnumConst(
  target: object,
  key: { [str: string]: any },
  descriptor?: undefined
): boolean | string[];
export function defNoEnumConst(
  target: object,
  key: objKey,
  descriptor: any
): boolean;
export function defNoEnumConst(
  target: object,
  key: Combinable,
  descriptor: Combinable
): boolean | string[] {
  return defOperation(
    target,
    key,
    descriptor
  )((des) => {
    des.configurable = false;
    des.enumable = false;
  });
}
