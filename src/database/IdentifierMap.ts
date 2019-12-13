import { Identifier } from './type'
import { serializable } from '../utils/type-transform/Serialization'

/**
 * The IdentifierMap is like a built-in Map<Identifier, T>.
 *
 * Because Identifier is not a value-type record so to make it behave like a value-type,
 * please use this class instead of Map<Identifier, T>.
 */
@serializable('IdentifierMap')
export class IdentifierMap<IdentifierType extends Identifier, T> implements Map<IdentifierType, T> {
    /**
     *
     * @param __raw_map__ The origin data.
     * @param constructor The Identifier constructor. If provided, IdentifierMap will try to do a runtime check to make sure the identifier type is correct.
     */
    constructor(public readonly __raw_map__: Map<string, T>, constructor?: new (...args: any) => IdentifierType) {
        if (constructor) {
            this.constructorName = constructor.name
        }
    }
    private constructorName: string | undefined
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
            const identifier = Identifier.fromString(key).value
            if (!identifier) {
                console.warn('IdentifierMap found a key which cannot be converted into Identifier', key)
            } else {
                yield [identifier as IdentifierType, data]
            }
        }
    }
    forEach(callbackfn: (value: T, key: IdentifierType, map: IdentifierMap<IdentifierType, T>) => void, thisArg?: any) {
        this.__raw_map__.forEach((value, key) => {
            const i = Identifier.fromString(key).value
            if (i) {
                callbackfn.call(thisArg, value, i as IdentifierType, this)
            }
        })
    }
    has(key: IdentifierType) {
        return this.__raw_map__.has(key.toText())
    }
    *keys(): Generator<IdentifierType, void, unknown> {
        const iter = this.__raw_map__.keys()
        for (const key of iter) {
            const i = Identifier.fromString(key).value
            if (i) yield i as IdentifierType
            else continue
        }
    }
    get size() {
        return this.__raw_map__.size
    }
    values(): IterableIterator<T> {
        return this.__raw_map__.values()
    }
    [Symbol.toStringTag] = 'IdentifierMap';
    [Symbol.iterator](): Generator<[IdentifierType, T], void, unknown> {
        return this.entries()
    }
}

export type ReadonlyIdentifierMap<IdentifierType extends Identifier, T> = ReadonlyMap<IdentifierType, T> & {
    readonly __raw_map__: ReadonlyMap<string, T>
}
export const ReadonlyIdentifierMap: {
    new <IdentifierType extends Identifier, T>(__raw_map__: ReadonlyMap<string, T>): ReadonlyIdentifierMap<
        IdentifierType,
        T
    >
} = IdentifierMap as any
