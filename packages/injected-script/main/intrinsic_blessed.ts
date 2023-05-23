import { create, getOwnPropertyDescriptors, getPrototypeOf, setPrototypeOf, takeThis } from './intrinsic_content.js'

const { Map: _Map, Set: _Set, WeakMap: _WeakMap } = globalThis
const MapPrototype: typeof _Map.prototype = create(null, getOwnPropertyDescriptors(_Map.prototype))
const SetPrototype: typeof _Set.prototype = create(null, getOwnPropertyDescriptors(_Set.prototype))
const WeakMapPrototype: typeof _WeakMap.prototype = create(null, getOwnPropertyDescriptors(_WeakMap.prototype))
const ArrayPrototype: typeof globalThis.Array.prototype = create(
    null,
    getOwnPropertyDescriptors(globalThis.Array.prototype) as any,
)

const __set_iter__ = new _Set().values()
const __map_iter__ = new _Map().values()
const __array_iter__ = [].values()
const IteratorPrototype: IterableIterator<any> = create(
    null,
    getOwnPropertyDescriptors(getPrototypeOf(getPrototypeOf(__set_iter__))),
)
const SetIteratorPrototype: IterableIterator<any> = create(
    IteratorPrototype,
    getOwnPropertyDescriptors(getPrototypeOf(__set_iter__)),
)
const MapIteratorPrototype: IterableIterator<any> = create(
    IteratorPrototype,
    getOwnPropertyDescriptors(getPrototypeOf(__map_iter__)),
)
export const ArrayIteratorPrototype: IterableIterator<any> = create(
    IteratorPrototype,
    getOwnPropertyDescriptors(getPrototypeOf(__array_iter__)),
)

// Map
{
    const entries = takeThis(MapPrototype.entries)
    const keys = takeThis(MapPrototype.keys)
    const values = takeThis(MapPrototype.values)
    MapPrototype.entries = MapPrototype[Symbol.iterator] = function (this: ReadonlyMap<any, any>) {
        const iter = entries(this)
        setPrototypeOf(iter, MapIteratorPrototype)
        return iter
    }
    MapPrototype.keys = function (this: ReadonlyMap<any, any>) {
        const iter = keys(this)
        setPrototypeOf(iter, MapIteratorPrototype)
        return iter
    }
    MapPrototype.values = function (this: ReadonlyMap<any, any>) {
        const iter = values(this)
        setPrototypeOf(iter, MapIteratorPrototype)
        return iter
    }
}

// Set
{
    const entries = takeThis(SetPrototype.entries)
    const values = takeThis(SetPrototype.values)
    SetPrototype.entries = function (this: ReadonlySet<any>) {
        const iter = entries(this)
        setPrototypeOf(iter, SetIteratorPrototype)
        return iter
    }
    SetPrototype.values =
        SetPrototype.keys =
        SetPrototype[Symbol.iterator] =
            function (this: ReadonlySet<any>) {
                const iter = values(this)
                setPrototypeOf(iter, SetIteratorPrototype)
                return iter
            }
}

// Array
{
    const entries = takeThis(ArrayPrototype.entries)
    const keys = takeThis(ArrayPrototype.keys)
    const values = takeThis(ArrayPrototype.values)
    ArrayPrototype.entries = function (this: readonly unknown[]) {
        const iter = entries(this)
        setPrototypeOf(iter, ArrayIteratorPrototype)
        return iter
    }
    ArrayPrototype.keys = function (this: readonly unknown[]) {
        const iter = keys(this)
        setPrototypeOf(iter, ArrayIteratorPrototype)
        return iter
    }
    ArrayPrototype.values = ArrayPrototype[Symbol.iterator] = function (this: readonly unknown[]) {
        const iter = values(this)
        setPrototypeOf(iter, ArrayIteratorPrototype)
        return iter
    }
}

export function Map<K, V>(): Map<K, V> {
    return setPrototypeOf(new _Map(), MapPrototype)
}
export function WeakMap<K extends object, V>(): WeakMap<K, V> {
    return setPrototypeOf(new _WeakMap(), WeakMapPrototype)
}
export function Set<T>(iterable?: Iterable<T> | null | undefined): Set<T> {
    return setPrototypeOf(new _Set(iterable), SetPrototype)
}
export function Array_from<T extends readonly unknown[]>(...args: T): T {
    return setPrototypeOf(args, ArrayPrototype)
}
export function ExistArray<T extends readonly unknown[]>(array: T): T {
    return setPrototypeOf(array, ArrayPrototype)
}
