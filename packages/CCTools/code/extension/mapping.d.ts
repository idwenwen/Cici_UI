declare type Compare<T> = (origin: T, assert: T) => boolean;
declare type iteration<K, V> = (val: V, key: K, origin: Map<K, V>) => any;
declare class Mapping<K, V> extends Map<K, V> {
    constructor();
    set(key: K, val: V): this;
    set(key: K[], val: V[]): this;
    set(key: Map<K, V>, val: undefined | null): this;
    delete(key: K): boolean;
    delete(key: K[]): boolean | Array<K>;
    get(key: K): V;
    get(key: K[]): V[];
    private GETKEY;
    has(key: K): boolean;
    has(key: V, compare?: Compare<V>): boolean;
    key(val: V, compare: Compare<V>): K;
    key(val: V[], compare: Compare<V>): K[];
    each(operation: iteration<K, V>): any;
}
export default Mapping;
