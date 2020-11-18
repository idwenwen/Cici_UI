import { isFunction, capitalize } from "lodash";
import { each } from "../extension/array";
var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["Info"] = "Info";
    SeverityLevel["Debug"] = "Debug";
    SeverityLevel["Warn"] = "Warn";
    SeverityLevel["Error"] = "Error";
    SeverityLevel["Unified"] = "Unified";
})(SeverityLevel || (SeverityLevel = {}));
export class Logger {
    constructor(format = "DEFAULT") {
        this.memorize = new Map();
        this.format = ((isFunction(format) ? format : Logger.formatter.get(format)));
    }
    log(errorType, level = SeverityLevel.Unified) {
        Logger.level[level] || (level = SeverityLevel.Unified);
        const info = this.format(errorType, level);
        const cache = this.memorize.get(level) || [];
        cache.push(info);
        this.memorize.set(level, cache);
    }
    exhibition(level = SeverityLevel.Unified) {
        Logger.level[level] || (level = SeverityLevel.Unified);
        display[level](...(this.memorize.get(level) || []));
    }
    get(level = SeverityLevel.Unified) {
        Logger.level[level] || (level = SeverityLevel.Unified);
        return this.memorize.get(level);
    }
    getAll() {
        const all = {};
        each(this.memorize)((val, key) => {
            all[key] = val;
        });
        return all;
    }
    static set(level) {
        if (!Logger.level[level]) {
            Logger.level[level] = level;
        }
    }
}
Logger.formatter = new Map();
Logger.level = SeverityLevel;
Logger.formatter.set("DEFAULT", (error, level) => {
    const now = new Date().toString();
    return `${level} - ${error.msg()} - ${now}`;
});
const logger = new Logger();
Logger.logger = logger;
class Console {
    constructor() {
        this.exhibition = console;
    }
    presetOutput(funcName, operation) {
        return !!(!this[funcName]
            ? (this[funcName] = (content) => {
                operation(this.exhibition, content);
            })
            : void 0);
    }
    log(content) {
        if (this.exhibition.log) {
            this.exhibition.log(content);
        }
        else {
            throw new Exception("DisplayException", "There has no 'log' in global console", SeverityLevel.Error);
        }
    }
    debug(content) {
        if (this.exhibition.debug) {
            this.exhibition.debug(content);
        }
        else {
            throw new Exception("displayException", "There has no 'debug' in global console", SeverityLevel.Error);
        }
    }
    warn(content) {
        if (this.exhibition.warn) {
            this.exhibition.debug(content);
        }
        else {
            throw new Exception("displayException", "There has no 'warn' in global console", SeverityLevel.Error);
        }
    }
    error(content) {
        if (this.exhibition.error) {
            this.exhibition.debug(content);
        }
        else {
            throw new Exception("displayException", "There has no 'error' in global console", SeverityLevel.Error);
        }
    }
}
export const display = new Console();
export class Exception extends Error {
    constructor(alias, msg, severity = SeverityLevel.Unified, cacheintoLog = true) {
        super(msg);
        this.alias = alias;
        this.severity = severity;
        if (cacheintoLog)
            logger.log(this, severity);
    }
    msg() {
        return `${capitalize(this.alias)}: ${capitalize(this.message)}`;
    }
}
Exception.level = SeverityLevel;
//# sourceMappingURL=exception.js.map