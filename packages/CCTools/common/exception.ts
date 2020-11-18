/**
 * Logger helps to note error message as in defferent level, and will throw it out autoly.
 *
 * There have three different component into Logger.
 * 1. Console: Displaying message to console compatiblely
 * 2. Logger: Storing log info
 * 3. Exception: Customer exception for common mistakes, support extension
 */

import { isFunction, capitalize } from "lodash";
import { each } from "../extension/array";

// Default level for log
enum SeverityLevel {
  Info = "Info",
  Debug = "Debug",
  Warn = "Warn",
  Error = "Error",
  Unified = "Unified", // Unified level for vague-level log
}

// Basic
type formatterOperation = (error: Error, level: string) => string;
type displayOperation = (console: any, content: any) => void;

/*****Logger *****/
export class Logger {
  static formatter: Map<string, formatterOperation> = new Map();
  static logger: Logger;
  static level = SeverityLevel;

  private memorize: Map<string, string[]>; // Memorying log info according level
  private format: Function; // Format log info for customer

  constructor(format: Function | string = "DEFAULT") {
    this.memorize = new Map();
    this.format = <Function>(
      (isFunction(format) ? format : Logger.formatter.get(<string>format))
    );
  }

  /**
   * Coombining log info and save it.
   * @param errorType Exception instance with msg
   * @param level Severity level which preset into Logger
   */
  log(errorType: Error, level: string = SeverityLevel.Unified): void {
    // default value will be unified when there is no such level-info into logger
    Logger.level[level] || (level = SeverityLevel.Unified);
    const info = this.format(errorType, level);
    const cache = this.memorize.get(level) || [];
    cache.push(info);
    this.memorize.set(level, cache);
  }

  /**
   * Display log according level
   * @param level Severity level
   */
  exhibition(level: string = SeverityLevel.Unified): void {
    // Same as front
    Logger.level[level] || (level = SeverityLevel.Unified);
    display[level](...(this.memorize.get(level) || []));
  }

  /**
   * Return log according to level
   * @param level Severity level
   */
  get(level: string = SeverityLevel.Unified): string[] {
    // Same as front
    Logger.level[level] || (level = SeverityLevel.Unified);
    return this.memorize.get(level);
  }

  /**
   * Return all memorise
   */
  getAll(): object {
    const all = {};
    each(this.memorize)((val, key) => {
      all[key] = val;
    });
    return all;
  }

  /**
   * Adding new level into log
   * @param level Severity level
   */
  static set(level: string) {
    if (!Logger.level[level]) {
      Logger.level[level] = level;
    }
  }
}

// [level] - [error type]: [error message] - [time now]
Logger.formatter.set("DEFAULT", (error: Exception, level: string): string => {
  const now = new Date().toString();
  return `${level} - ${error.msg()} - ${now}`;
});

const logger = new Logger();
Logger.logger = logger; // Global default logger instance

/*****Console Log *****/
class Console {
  exhibition: any;
  constructor() {
    this.exhibition = console;
  }

  presetOutput(funcName: string, operation: displayOperation): boolean {
    return !!(!this[funcName]
      ? (this[funcName] = (content: any) => {
          operation(this.exhibition, content);
        })
      : void 0);
  }

  log(content: any) {
    if (this.exhibition.log) {
      this.exhibition.log(content);
    } else {
      throw new Exception(
        "DisplayException",
        "There has no 'log' in global console",
        SeverityLevel.Error
      );
    }
  }

  debug(content: any) {
    if (this.exhibition.debug) {
      this.exhibition.debug(content);
    } else {
      throw new Exception(
        "displayException",
        "There has no 'debug' in global console",
        SeverityLevel.Error
      );
    }
  }

  warn(content: any) {
    if (this.exhibition.warn) {
      this.exhibition.debug(content);
    } else {
      throw new Exception(
        "displayException",
        "There has no 'warn' in global console",
        SeverityLevel.Error
      );
    }
  }

  error(content: any) {
    if (this.exhibition.error) {
      this.exhibition.debug(content);
    } else {
      throw new Exception(
        "displayException",
        "There has no 'error' in global console",
        SeverityLevel.Error
      );
    }
  }
}

export const display = new Console();

/*****Exception *****/
export class Exception extends Error {
  static level = SeverityLevel;
  severity: string;
  alias: string;
  constructor(
    alias: string,
    msg?: string,
    severity: string = SeverityLevel.Unified,
    cacheintoLog: boolean = true
  ) {
    super(msg);
    this.alias = alias;
    this.severity = severity;
    if (cacheintoLog) logger.log(this, severity);
  }

  msg() {
    return `${capitalize(this.alias)}: ${capitalize(this.message)}`;
  }
}
