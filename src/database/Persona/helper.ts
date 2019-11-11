import { ProfileIdentifier, Identifier } from '../type'

export class ProfileIdentifierMap<T> implements Map<ProfileIdentifier, T> {
    constructor(public __raw_map__: Map<string, T>) {}
    get(key: ProfileIdentifier) {
        return this.__raw_map__.get(key.toText())
    }
    set(key: ProfileIdentifier, data: T) {
        this.__raw_map__.set(key.toText(), data)
        return this
    }
    clear() {
        this.__raw_map__.clear()
    }
    delete(data: ProfileIdentifier) {
        return this.__raw_map__.delete(data.toText())
    }
    *entries(): Generator<[ProfileIdentifier, T], void, unknown> {
        const iter = this.__raw_map__.entries()
        for (const [key, data] of iter) {
            yield [Identifier.fromString(key) as ProfileIdentifier, data]
        }
    }
    forEach(callbackfn: (value: T, key: ProfileIdentifier, map: ProfileIdentifierMap<T>) => void, thisArg?: any) {
        this.__raw_map__.forEach((value, key) => {
            const i = Identifier.fromString(key)
            if (i instanceof ProfileIdentifier) {
                callbackfn.call(thisArg, value, i, this)
            }
        })
    }
    has(key: ProfileIdentifier) {
        return this.__raw_map__.has(key.toText())
    }
    *keys(): Generator<ProfileIdentifier, void, unknown> {
        const iter = this.__raw_map__.keys()
        for (const [key] of iter) {
            const i = Identifier.fromString(key)
            if (i instanceof ProfileIdentifier) yield i
            else continue
        }
    }
    get size() {
        return this.__raw_map__.size
    }
    values(): IterableIterator<T> {
        return this.__raw_map__.values()
    }
    [Symbol.toStringTag] = 'ProfileIdentifierSet';
    [Symbol.iterator](): Generator<[ProfileIdentifier, T], void, unknown> {
        return this.entries()
    }
}
