import Mapping from "../extension/mapping";
declare type formatUUID = (index: number) => string | number | symbol;
declare type nextIndex = (index: number) => number;
declare type parameters<T> = T | T[];
export declare class UUID {
    format: formatUUID;
    index: number;
    next: nextIndex;
    constructor(format?: formatUUID, start?: number, next?: nextIndex | number);
    get(): string | number | symbol;
}
declare class Storage {
    constructor();
    private toStorage;
    toLocal(key: string, val: any): any;
    toLocal(key: string[], val: any[]): any;
    toLocal(key: Mapping<string, parameters<any>>, val: undefined): any;
    toSession(key: string, val: any): any;
    toSession(key: string[], val: any[]): any;
    toSession(key: Mapping<string, parameters<any>>, val: undefined): any;
    private getStorage;
    getLocal(key: string): any;
    getLocal(key: string[]): any;
    getSession(key: string): any;
    getSession(key: string[]): any;
    private clear;
    clearLocal(): void;
    clearSession(): void;
}
export declare const storage: Storage;
export {};
