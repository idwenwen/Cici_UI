declare type onionOperation = (context: any, next: any) => any;
export declare class Middleware {
    static preset: Map<string, Middleware>;
    static FunctionDecorate: Function;
    middlewares: Array<onionOperation>;
    uuid: string;
    constructor();
    register(operation: onionOperation): void;
    preset(name: string): void;
    compose(): (context: any, next: any) => void;
}
export {};
