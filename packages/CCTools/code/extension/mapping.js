import { isNil, eq, toArray } from "lodash";
import { each } from "./array";
class Mapping extends Map {
    constructor() {
        super();
    }
    set(key, val) {
        if (key.set && isNil(val)) {
            each(key)((val, key) => {
                super.set(key, val);
            });
        }
        else if (Array.isArray(key) && Array.isArray(val)) {
            each(key)((item, i) => {
                super.set(item, val[i]);
            });
        }
        else {
            super.set(key, val);
        }
        return this;
    }
    delete(key) {
        let result = [];
        if (Array.isArray(key)) {
            result = each(key)((item) => {
                super.delete(item);
                return item;
            });
            result.length === 0 && (result = true);
        }
        else {
            result = super.delete(key);
        }
        return result;
    }
    get(key) {
        let result = [];
        if (Array.isArray(key)) {
            result = each(key)((item) => {
                return super.get(item);
            });
        }
        else {
            result = super.get(key);
        }
        return result;
    }
    GETKEY(val, compare = eq) {
        for (const item of this) {
            if (compare(item[1], val))
                return item[0];
        }
        return null;
    }
    has(key, compare) {
        let result = false;
        if (!compare) {
            result = super.has(key);
        }
        if (!result) {
            result = !isNil(this.GETKEY(key, compare));
        }
        return result;
    }
    key(val, compare = eq) {
        let result = [];
        val = toArray(val);
        result = each(val)((item) => {
            return this.GETKEY(item, compare);
        });
        return result.length === 1 ? result[0] : result;
    }
    each(operation) {
        return each(this)(operation);
    }
}
export default Mapping;
//# sourceMappingURL=mapping.js.map