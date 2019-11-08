import { ProfileIdentifier, Identifier } from '../type'

export class ProfileIdentifierSet implements Set<ProfileIdentifier> {
    constructor(public __raw_set__: Set<string>) {}
    add(data: ProfileIdentifier) {
        this.__raw_set__.add(data.toText())
        return this
    }
    clear() {
        this.__raw_set__.clear()
    }
    delete(data: ProfileIdentifier) {
        return this.__raw_set__.delete(data.toText())
    }
    *entries(): Generator<[ProfileIdentifier, ProfileIdentifier], void, unknown> {
        const iter = this.values()
        for (const i of iter) {
            yield [i, i] as [typeof i, typeof i]
        }
    }
    forEach(
        callbackfn: (value: ProfileIdentifier, value2: ProfileIdentifier, set: Set<ProfileIdentifier>) => void,
        thisArg?: any,
    ) {
        this.__raw_set__.forEach(v => {
            const i = Identifier.fromString(v)
            if (i instanceof ProfileIdentifier) {
                Reflect.apply(callbackfn, thisArg, [i, i, this])
            }
        })
    }
    has(key: ProfileIdentifier) {
        return this.__raw_set__.has(key.toText())
    }
    *keys(): Generator<ProfileIdentifier, void, unknown> {
        const iter = this.__raw_set__.keys()
        for (const [key] of iter) {
            const i = Identifier.fromString(key)
            if (i instanceof ProfileIdentifier) yield i
            else continue
        }
    }
    get size() {
        return this.__raw_set__.size
    }
    values(): Generator<ProfileIdentifier, void, unknown> {
        return this.keys()
    }
    [Symbol.toStringTag] = 'ProfileIdentifierSet';
    [Symbol.iterator](): Generator<ProfileIdentifier, void, unknown> {
        return this.keys()
    }
}
