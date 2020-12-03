/**
 * Filter register for logic-block
 */

import { Setting } from "../config/config";
import { display, Exception } from "./exception";
import { UUID } from "./manager";

type onionOperation = (context, next) => any;

const MiddlewareId = new UUID();

export class Middleware {
  static preset: Map<string, Middleware> = new Map();
  static FunctionDecorate: Function = filters;
  middlewares: Array<onionOperation>;
  uuid: string;
  constructor() {
    this.uuid = MiddlewareId.get().toString();
  }

  register(operation: onionOperation) {
    this.middlewares.push(operation);
  }

  preset(name: string) {
    Middleware.preset.set(name, this);
  }

  compose() {
    const wares = this.middlewares;
    const running = (context, next) => {
      let index = -1;
      function dispatch(i: number) {
        if (i <= index) {
          Promise.reject(
            new Exception(
              "RepeatExecution",
              "Middleware has been ran before",
              Exception.level.Error,
              false
            )
          );
        } else {
          index++;
          let fn = wares[i];
          if (i === wares.length) fn = next;
          if (!fn) Promise.resolve();
          try {
            return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
          } catch (err) {
            return Promise.reject(err);
          }
        }
      }
      dispatch(0);
    };
    return running;
  }
}

function filters(onion: Middleware) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    if (!Setting.production) {
      display.log(`${methodName} has decorated with middleware ${onion.uuid}`);
    }
    const operation = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const _t = this;
      let result;
      await onion.compose()(args, async (context, next) => {
        result = operation.call(this, ...context);
        await next();
      });
      return result;
    };
  };
}
