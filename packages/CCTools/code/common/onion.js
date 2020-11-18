import { Setting } from "../config/config";
import { display, Exception } from "./exception";
import { UUID } from "./manager";
const MiddlewareId = new UUID();
export class Middleware {
    constructor() {
        this.uuid = MiddlewareId.get().toString();
    }
    register(operation) {
        this.middlewares.push(operation);
    }
    preset(name) {
        Middleware.preset.set(name, this);
    }
    compose() {
        const wares = this.middlewares;
        const running = (context, next) => {
            const _t = this;
            let index = -1;
            function dispatch(i) {
                if (i <= index) {
                    Promise.reject(new Exception("RepeatExecution", "Middleware has been ran before", Exception.level.Error, false));
                }
                else {
                    index++;
                    let fn = wares[i];
                    if (i === wares.length)
                        fn = next;
                    if (!fn)
                        Promise.resolve();
                    try {
                        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
                    }
                    catch (err) {
                        return Promise.reject(err);
                    }
                }
            }
            dispatch(0);
        };
        return running;
    }
}
Middleware.preset = new Map();
Middleware.FunctionDecorate = filters;
function filters(onion) {
    return (target, methodName, descriptor) => {
        if (!Setting.production) {
            display.log(`${methodName} has decorated with middleware ${onion.uuid}`);
        }
        const operation = descriptor.value;
        descriptor.value = async function (...args) {
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
//# sourceMappingURL=onion.js.map