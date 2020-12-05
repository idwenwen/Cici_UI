/**
 * Tools in extension
 */
// FUNCTION
export { each, eachRight, remove, getLast } from "./extension/array";
export { toHEX, toRGBA } from "./extension/color";
export {
  defNoEnumConst,
  define,
  defNoEnum,
  defNoConfig,
} from "./extension/object";
// import * as TimeOperation from './time'
// CLASS
export { default as Mapping } from "./extension/mapping";
export { default as Tree } from "./extension/tree";
export {
  default as domOperation,
  DomExtension,
  DOMAttrs,
} from "./extension/domOperation";

/**
 * Tools in common
 */
// FUNCTION
export { display as Display } from "./common/exception";
export { storage as Storage } from "./common/manager";
export { default as Enviroment } from "./common/enviroment";
export { trangle, circle, trapezoid, rect } from "./common/area";
// CLASS
export { Logger, Exception } from "./common/exception";
export { UUID } from "./common/manager";
export { Middleware } from "./common/onion";

/**
 * Setting for Tools
 */
export { Setting } from "./config/config";
