import {
    Identifier,
    ProfileIdentifier as A,
    ECKeyIdentifier as B,
    PostIdentifier as C,
    PostIVIdentifier as D,
} from './identifier.js'

type I<T> = Iterable<readonly [string, T]>

// you're free to add a new overload...
export function convertRawMapToIdentifierMap<T>(it: I<T>, ...of: Array<typeof A>): Map<A, T>
export function convertRawMapToIdentifierMap<T>(it: I<T>, ...of: Array<typeof B>): Map<B, T>
export function convertRawMapToIdentifierMap<T>(it: I<T>, ...of: Array<typeof C>): Map<C, T>
export function convertRawMapToIdentifierMap<T>(it: I<T>, ...of: Array<typeof D>): Map<D, T>
export function convertRawMapToIdentifierMap<T>(it: I<T>, ...of: unknown[]): Map<Identifier, T> {
    const hasProfileIdentifier = of.includes(A)
    const hasECKeyIdentifier = of.includes(B)
    const hasPostIdentifier = of.includes(C)
    const hasPostIVIdentifier = of.includes(D)

    const result = new Map<Identifier, T>()
    const droppedValues = new Map<string, T>()
    for (const [key, value] of it) {
        const id = Identifier.from(key)
        if (id.isNone()) {
            droppedValues.set(key, value)
            continue
        }

        if (hasProfileIdentifier && id.value instanceof A) result.set(id.value, value)
        else if (hasECKeyIdentifier && id.value instanceof B) result.set(id.value, value)
        else if (hasPostIdentifier && id.value instanceof C) result.set(id.value, value)
        else if (hasPostIVIdentifier && id.value instanceof D) result.set(id.value, value)
        else droppedValues.set(key, value)
    }

    if (droppedValues.size) {
        console.warn(
            '[@masknet/shared-base] identifierRawMapToMap: Some value violates the constraint. Dropped values:',
            droppedValues,
            'constraints:',
            of,
        )
    }

    return result
}

export function convertIdentifierMapToRawMap<T>(map: Iterable<[Identifier, T]>): Map<string, T> {
    const result = new Map<string, T>()
    for (const [key, value] of map) {
        result.set(key.toText(), value)
    }
    return result
}
