import { Identifier } from './base'
import { ProfileIdentifier as A } from './profile'
import { ECKeyIdentifier as B } from './ec-key'
import { PostIdentifier as C } from './post'
import { PostIVIdentifier as D } from './post-iv'

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
        if (id.none) {
            droppedValues.set(key, value)
            continue
        }

        if (hasProfileIdentifier && id.val instanceof A) result.set(id.val, value)
        else if (hasECKeyIdentifier && id.val instanceof B) result.set(id.val, value)
        else if (hasPostIdentifier && id.val instanceof C) result.set(id.val, value)
        else if (hasPostIVIdentifier && id.val instanceof D) result.set(id.val, value)
        else droppedValues.set(key, value)
    }

    if (droppedValues.size) {
        console.warn(
            '[@masknet/shared-base] identifierRawMapToMap: Some value violates the constraint. Dropped values: ',
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
