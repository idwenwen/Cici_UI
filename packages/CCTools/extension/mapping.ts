import { isNil, eq, toArray } from "lodash";
import { each } from "./array";

type Combinable = any;
type Compare<T> = (origin: T, assert: T) => boolean;
type iteration<K, V> = (val: V, key: K, origin: Map<K, V>) => any;

/**
 * Extend origin Map
 * 1. Set-operation can support add muliple-data oncely
 * 2. Delete support multiple-data operation
 * 3. overload get and has function
 * 4. key operation can get key value according to value
 * 5. each operation hes to iterator
 */
class Mapping<K, V> extends Map<K, V> {
  constructor() {
    super();
  }

  set(key: K, val: V): this;
  set(key: K[], val: V[]): this;
  set(key: Map<K, V>, val: undefined | null): this;
  set(key: Combinable, val: Combinable) {
    if (key.set && isNil(val)) {
      each(key)((val, key) => {
        super.set(key, val);
      });
    } else if (Array.isArray(key) && Array.isArray(val)) {
      each(key)((item, i) => {
        super.set(item, val[i]);
      });
    } else {
      super.set(key, val);
    }
    return this;
  }

  delete(key: K): boolean;
  delete(key: K[]): boolean | Array<K>;
  delete(key: Combinable): boolean | Array<K> {
    let result: Array<K> | boolean = [];
    if (Array.isArray(key)) {
      result = each(key)((item) => {
        super.delete(item);
        return item;
      });
      (<Array<K>>result).length === 0 && (result = true);
    } else {
      result = super.delete(key);
    }
    // Will get which key has been deleted faily
    return result;
  }

  get(key: K): V;
  get(key: K[]): V[];
  get(key: Combinable): V | V[] {
    let result: V | V[] = [];
    if (Array.isArray(key)) {
      result = each(key)((item) => {
        return super.get(item);
      });
    } else {
      result = super.get(key);
    }
    return result;
  }

  private GETKEY(val: V, compare: Compare<V> = eq): K {
    for (const item of this) {
      if (compare(item[1], val)) return item[0];
    }
    // There has no such value sot into Map
    return null;
  }

  has(key: K): boolean;
  has(key: V, compare?: Compare<V>): boolean;
  has(key: Combinable, compare?: Compare<V>): boolean {
    let result = false;
    if (!compare) {
      // Do not deliveried compare function, will find according to key firstly
      result = super.has(key);
    }
    if (!result) {
      result = !isNil(this.GETKEY(key, compare));
    }
    return result;
  }

  key(val: V, compare: Compare<V>): K;
  key(val: V[], compare: Compare<V>): K[];
  key(val: Combinable, compare: Compare<V> = eq): K | K[] {
    let result: K | K[] = [];
    val = toArray(val);
    result = each(val)((item) => {
      return this.GETKEY(item, compare);
    });
    return (<K[]>result).length === 1 ? result[0] : result;
  }

  each(operation: iteration<K, V>) {
    return each(this)(operation);
  }
}

export default Mapping;
