import { create, getOwnPropertyDescriptors, getPrototypeOf, setPrototypeOf, takeThisF } from './intrinsic_content.js'

const { Map: _Map, Set: _Set, WeakMap: _WeakMap } = globalThis
const MapPrototype: typeof _Map.prototype = create(null, getOwnPropertyDescriptors(_Map.prototype))
const SetPrototype: typeof _Set.prototype = create(null, getOwnPropertyDescriptors(_Set.prototype))
const WeakMapPrototype: typeof _WeakMap.prototype = create(null, getOwnPropertyDescriptors(_WeakMap.prototype))
export const ArrayPrototype: typeof globalThis.Array.prototype = create(
    null,
    getOwnPropertyDescriptors(globalThis.Array.prototype) as any,
)
export const PromisePrototype: typeof globalThis.Promise.prototype = create(
    null,
    getOwnPropertyDescriptors(Promise.prototype),
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
    type T = ReadonlyMap<unknown, unknown>
    const entries = takeThisF(MapPrototype.entries)<T>
    const keys = takeThisF(MapPrototype.keys)<T>
    const values = takeThisF(MapPrototype.values)<T>
    MapPrototype.entries = MapPrototype[Symbol.iterator] = function (this: T) {
        const iter = entries(this)
        setPrototypeOf(iter, MapIteratorPrototype)
        return iter
    }
    MapPrototype.keys = function (this: T) {
        const iter = keys(this)
        setPrototypeOf(iter, MapIteratorPrototype)
        return iter
    }
    MapPrototype.values = function (this: T) {
        const iter = values(this)
        setPrototypeOf(iter, MapIteratorPrototype)
        return iter
    }
}

// Set
{
    type T = ReadonlySet<unknown>
    const entries = takeThisF(SetPrototype.entries)<T>
    const values = takeThisF(SetPrototype.values)<T>
    SetPrototype.entries = function (this: T) {
        const iter = entries(this)
        setPrototypeOf(iter, SetIteratorPrototype)
        return iter
    }
    SetPrototype.values =
        SetPrototype.keys =
        SetPrototype[Symbol.iterator] =
            function (this: T) {
                const iter = values(this)
                setPrototypeOf(iter, SetIteratorPrototype)
                return iter
            }
}

// Array
{
    type T = readonly unknown[]
    const entries = takeThisF(ArrayPrototype.entries)<T>
    const keys = takeThisF(ArrayPrototype.keys)<T>
    const values = takeThisF(ArrayPrototype.values)<T>
    ArrayPrototype.entries = function (this: T) {
        const iter = entries(this)
        setPrototypeOf(iter, ArrayIteratorPrototype)
        return iter
    }
    ArrayPrototype.keys = function (this: T) {
        const iter = keys(this)
        setPrototypeOf(iter, ArrayIteratorPrototype)
        return iter
    }
    ArrayPrototype.values = ArrayPrototype[Symbol.iterator] = function (this: T) {
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
export function Array_of<T extends readonly unknown[]>(...args: T): T {
    return setPrototypeOf(args, ArrayPrototype)
}
