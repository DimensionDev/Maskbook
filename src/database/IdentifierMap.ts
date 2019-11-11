import { Identifier } from './type'
import { serializable } from '../utils/type-transform/Serialization'

@serializable('IdentifierMap')
export class IdentifierMap<IdentifierType extends Identifier, T> implements Map<IdentifierType, T> {
    constructor(public __raw_map__: Map<string, T>) {}
    get(key: IdentifierType) {
        return this.__raw_map__.get(key.toText())
    }
    set(key: IdentifierType, data: T) {
        this.__raw_map__.set(key.toText(), data)
        return this
    }
    clear() {
        this.__raw_map__.clear()
    }
    delete(data: IdentifierType) {
        return this.__raw_map__.delete(data.toText())
    }
    *entries(): Generator<[IdentifierType, T], void, unknown> {
        const iter = this.__raw_map__.entries()
        for (const [key, data] of iter) {
            yield [Identifier.fromString(key) as IdentifierType, data]
        }
    }
    forEach(callbackfn: (value: T, key: IdentifierType, map: IdentifierMap<IdentifierType, T>) => void, thisArg?: any) {
        this.__raw_map__.forEach((value, key) => {
            const i = Identifier.fromString(key)
            if (i !== null) {
                callbackfn.call(thisArg, value, i as IdentifierType, this)
            }
        })
    }
    has(key: IdentifierType) {
        return this.__raw_map__.has(key.toText())
    }
    *keys(): Generator<IdentifierType, void, unknown> {
        const iter = this.__raw_map__.keys()
        for (const [key] of iter) {
            const i = Identifier.fromString(key)
            if (i !== null) yield i as IdentifierType
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
    [Symbol.iterator](): Generator<[IdentifierType, T], void, unknown> {
        return this.entries()
    }
}
