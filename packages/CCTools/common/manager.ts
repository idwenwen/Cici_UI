/**
 * Global Manager has functional like above:
 * 1. uuid provider
 * 2. storage(session or local)
 * 3. TODO indexDB
 */

import { isFunction } from "lodash";
import { Setting } from "../config/config";
import { each } from "../extension/array";
import Mapping from "../extension/mapping";
import { display } from "./exception";

type formatUUID = (index: number) => string | number | symbol;
type nextIndex = (index: number) => number;
type Combinable = any;
type parameters<T> = T | T[];

/***** Unique mark for instance *****/
export class UUID {
  format: formatUUID;
  index: number;
  next: nextIndex;
  constructor(
    format: formatUUID = (count: string | number) => count,
    start: number = 1,
    next?: nextIndex | number
  ) {
    this.format = format;
    this.index = start;
    this.next = <nextIndex>(isFunction(next)
      ? next
      : (index) => {
          return index++;
        });
  }

  //Get new uuid for instance
  get() {
    const result = this.format(this.index);
    this.index = this.next(this.index);
    return result;
  }
}

/***** storage *****/
enum StorageType {
  Local,
  Session,
}

class Storage {
  constructor() {}

  private toStorage(type: StorageType, key: string, val: any): void;
  private toStorage(type: StorageType, key: string[], val: any[]): void;
  private toStorage(
    type: StorageType,
    key: Mapping<string, parameters<any>>,
    val: undefined
  ): void;
  private toStorage(type: StorageType, key: Combinable, val: Combinable): void {
    const storage = type === StorageType.Local ? localStorage : sessionStorage;
    // Third condition
    if (key instanceof Map) {
      each(key)((val, keyWord) => {
        storage.setItem(keyWord, JSON.stringify(val));
      });
    }
    // Towth condition
    else if (Array.isArray(key)) {
      each(key)((item, i) => {
        storage.setItem(item, JSON.stringify(val[i]));
      });
    }
    // For commont
    else {
      storage.setItem(key, JSON.stringify(val));
    }
  }

  toLocal(key: string, val: any);
  toLocal(key: string[], val: any[]);
  toLocal(key: Mapping<string, parameters<any>>, val: undefined);
  toLocal(key: Combinable, val: Combinable) {
    this.toStorage(StorageType.Local, key, val);
  }

  toSession(key: string, val: any);
  toSession(key: string[], val: any[]);
  toSession(key: Mapping<string, parameters<any>>, val: undefined);
  toSession(key: Combinable, val: Combinable) {
    this.toStorage(StorageType.Session, key, val);
  }

  private getStorage(type: StorageType, key: string): any;
  private getStorage(type: StorageType, key: string[]): any;
  private getStorage(type: StorageType, key: Combinable): any {
    const storage = type === StorageType.Local ? localStorage : sessionStorage;
    let result: any | Array<any> = "";
    if (Array.isArray(key)) {
      result = each(key)((val) => {
        return storage.getItem(val);
      });
      // Hint for value do not have
      if (!Setting.production) {
        display.warn(
          `${result.join(",")}. Those key do not have implement value`
        );
      }
    } else {
      result = storage.getItem(key);
    }
    return result;
  }

  getLocal(key: string): any;
  getLocal(key: string[]): any;
  getLocal(key: Combinable): any {
    return this.getStorage(StorageType.Local, key);
  }

  getSession(key: string): any;
  getSession(key: string[]): any;
  getSession(key: Combinable): any {
    return this.getStorage(StorageType.Session, key);
  }

  private clear(type: StorageType): void {
    const storage = type === StorageType.Local ? localStorage : sessionStorage;
    storage.clear();
  }

  clearLocal() {
    this.clear(StorageType.Local);
  }

  clearSession() {
    this.clear(StorageType.Session);
  }
}

export const storage = new Storage();
