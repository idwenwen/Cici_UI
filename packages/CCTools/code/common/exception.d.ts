declare enum SeverityLevel {
    Info = "Info",
    Debug = "Debug",
    Warn = "Warn",
    Error = "Error",
    Unified = "Unified"
}
declare type formatterOperation = (error: Error, level: string) => string;
declare type displayOperation = (console: any, content: any) => void;
export declare class Logger {
    static formatter: Map<string, formatterOperation>;
    static logger: Logger;
    static level: typeof SeverityLevel;
    private memorize;
    private format;
    constructor(format?: Function | string);
    log(errorType: Error, level?: string): void;
    exhibition(level?: string): void;
    get(level?: string): string[];
    getAll(): object;
    static set(level: string): void;
}
declare class Console {
    exhibition: any;
    constructor();
    presetOutput(funcName: string, operation: displayOperation): boolean;
    log(content: any): void;
    debug(content: any): void;
    warn(content: any): void;
    error(content: any): void;
}
export declare const display: Console;
export declare class Exception extends Error {
    static level: typeof SeverityLevel;
    severity: string;
    alias: string;
    constructor(alias: string, msg?: string, severity?: string, cacheintoLog?: boolean);
    msg(): string;
}
export {};
