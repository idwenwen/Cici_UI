import { Key } from "../commonType";
import { intoFirst, is } from "../../utils/index";

export const ORIGIN = "origin"; // 保留字段，表示proxy之中通过origin可以获取原对象内容。

type CustomerHandler = {
  [functionName: string]: Function;
};

export function acquistion(context: any, CustomHandler: CustomerHandler) {
  const HandlerExtension = {
    set(target: any, key: Key, value: any) {
      // 表示当前对象Key值之中有origin内容，则直接操作原对象上的内容。
      if (intoFirst(key, ORIGIN + "."))
        return (target[key.toString().replace(ORIGIN + ".", "")] = value);
      else return CustomHandler.set && CustomHandler.set(target, key, value);
    },

    get(target: any, key: Key) {
      // 如果是ORIGIN相同，表示当前对象
      if (is(key, ORIGIN)) return target;
      else if (intoFirst(key, ORIGIN + "."))
        return target[key.toString().replace(ORIGIN + ".", "")];
      else return CustomHandler.get && CustomHandler.get(target, key);
    },
  };

  // 返回相关代理内容
  return new Proxy(context, Object.assign({}, CustomHandler, HandlerExtension));
}
