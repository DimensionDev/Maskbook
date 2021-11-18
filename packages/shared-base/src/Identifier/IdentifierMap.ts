import { Identifier } from './type'
import { serialize } from '../serializer/index'
import { immerable } from 'immer'

/**
 * The IdentifierMap is like a built-in Map<Identifier, T>.
 *
 * Because Identifier is not a value-type record so to make it behave like a value-type,
 * please use this class instead of Map<Identifier, T>.
 */
export class IdentifierMap<IdentifierType extends Identifier, T> implements Map<IdentifierType, T> {
    [immerable] = true
    /**
     *
     * @param __raw_map__ The origin data.
     * @param constructor The Identifier constructor. If provided, IdentifierMap will try to do a runtime check to make sure the identifier type is correct.
     */
    constructor(public readonly __raw_map__: Map<string, T>, ...constructor: (new (...args: any) => IdentifierType)[]) {
        if (constructor) {
            this.constructorName = constructor.map((x) => x.name)
        }
    }
    private readonly constructorName: string[] = []
    get(key: IdentifierType) {
        return this.__raw_map__.get(key.toText())
    }
    set(key: IdentifierType | null | undefined, data: T) {
        if (!key) return this
        if (this.constructorName.length) {
            if (!this.constructorName.includes(key.constructor.name)) {
                console.warn(
                    `IdentifierMap found a invalid write try which violates the constraint ${this.constructorName}`,
                    key,
                )
                return this
            }
        }
        this.__raw_map__.set(key.toText(), data)
        return this
    }
    clear() {
        this.__raw_map__.clear()
    }
    delete(data: IdentifierType) {
        return this.__raw_map__.delete(data.toText())
    }
    private _identifierFromString(key: string) {
        const identifier = Identifier.fromString(key)
        if (identifier.err) {
            console.warn(
                'IdentifierMap found a key which cannot be converted into Identifier: ',
                identifier.val.message,
            )
        } else {
            if (this.constructorName.length === 0) return identifier.val as IdentifierType
            if (this.constructorName.includes(identifier.val.constructor.name)) return identifier.val as IdentifierType
            console.warn(
                `IdentifierMap found a key which is not compatible with it constraint(${this.constructorName}), ${key}`,
            )
        }
        return null
    }
    *entries(): Generator<[IdentifierType, T], void, unknown> {
        const iter = this.__raw_map__.entries()
        for (const [key, data] of iter) {
            const identifier = this._identifierFromString(key)
            if (!identifier) continue
            yield [identifier, data]
        }
    }
    forEach(
        callbackfn: (value: T, key: IdentifierType, map: IdentifierMap<IdentifierType, T>) => void,
        thisArg?: unknown,
    ) {
        this.__raw_map__.forEach((value, key) => {
            const i = this._identifierFromString(key)
            if (!i) return
            callbackfn.call(thisArg, value, i, this)
        })
    }
    has(key: IdentifierType) {
        return this.__raw_map__.has(key.toText())
    }
    *keys(): Generator<IdentifierType, void, unknown> {
        const iter = this.__raw_map__.keys()
        for (const key of iter) {
            const i = this._identifierFromString(key)
            if (i) yield i
            else continue
        }
    }
    get size() {
        return [...this.keys()].length
    }
    *values() {
        for (const [k, v] of this.entries()) yield v
    }
    public [Symbol.toStringTag]: string;
    [Symbol.iterator](): Generator<[IdentifierType, T], void, unknown> {
        return this.entries()
    }
}
serialize('IdentifierMap')(IdentifierMap)
IdentifierMap.prototype[Symbol.toStringTag] = 'IdentifierMap'

export type ReadonlyIdentifierMap<IdentifierType extends Identifier, T> = ReadonlyMap<IdentifierType, T> & {
    readonly __raw_map__: ReadonlyMap<string, T>
}
// eslint-disable-next-line no-redeclare
export const ReadonlyIdentifierMap: {
    new <IdentifierType extends Identifier, T>(
        __raw_map__: ReadonlyMap<string, T>,
        ...constructor: (new (...args: any) => IdentifierType)[]
    ): ReadonlyIdentifierMap<IdentifierType, T>
} = IdentifierMap as any
