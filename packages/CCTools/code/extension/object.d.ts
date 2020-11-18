declare type objKey = string | number;
declare type parameterDescriptor = {
    configurable?: boolean;
    enumable?: boolean;
    writable?: boolean;
    value?: any;
    get?: Function;
    set?: Function;
};
export declare function define(target: object, key: objKey, descriptor: parameterDescriptor): boolean;
export declare function defNoEnum(target: object, key: {
    [str: string]: any;
}, descriptor?: undefined): boolean;
export declare function defNoEnum(target: object, key: objKey, descriptor: any): boolean;
export declare function defNoConfig(target: object, key: {
    [str: string]: any;
}, descriptor?: undefined): boolean;
export declare function defNoConfig(target: object, key: objKey, descriptor: any): boolean;
export declare function defNoEnumConst(target: object, key: {
    [str: string]: any;
}, descriptor?: undefined): boolean | string[];
export declare function defNoEnumConst(target: object, key: objKey, descriptor: any): boolean;
export {};
