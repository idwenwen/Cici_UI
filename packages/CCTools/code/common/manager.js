import { isFunction } from "lodash";
import { Setting } from "../config/config";
import { each } from "../extension/array";
import { display } from "./exception";
export class UUID {
    constructor(format = (count) => count, start = 1, next) {
        this.format = format;
        this.index = start;
        this.next = (isFunction(next)
            ? next
            : (index) => {
                return index++;
            });
    }
    get() {
        const result = this.format(this.index);
        this.index = this.next(this.index);
        return result;
    }
}
var StorageType;
(function (StorageType) {
    StorageType[StorageType["Local"] = 0] = "Local";
    StorageType[StorageType["Session"] = 1] = "Session";
})(StorageType || (StorageType = {}));
class Storage {
    constructor() { }
    toStorage(type, key, val) {
        const storage = type === StorageType.Local ? localStorage : sessionStorage;
        if (key instanceof Map) {
            each(key)((val, keyWord) => {
                storage.setItem(keyWord, JSON.stringify(val));
            });
        }
        else if (Array.isArray(key)) {
            each(key)((item, i) => {
                storage.setItem(item, JSON.stringify(val[i]));
            });
        }
        else {
            storage.setItem(key, JSON.stringify(val));
        }
    }
    toLocal(key, val) {
        this.toStorage(StorageType.Local, key, val);
    }
    toSession(key, val) {
        this.toStorage(StorageType.Session, key, val);
    }
    getStorage(type, key) {
        const storage = type === StorageType.Local ? localStorage : sessionStorage;
        let result = "";
        if (Array.isArray(key)) {
            result = each(key)((val) => {
                return storage.getItem(val);
            });
            if (!Setting.production) {
                display.warn(`${result.join(",")}. Those key do not have implement value`);
            }
        }
        else {
            result = storage.getItem(key);
        }
        return result;
    }
    getLocal(key) {
        return this.getStorage(StorageType.Local, key);
    }
    getSession(key) {
        return this.getStorage(StorageType.Session, key);
    }
    clear(type) {
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
//# sourceMappingURL=manager.js.map