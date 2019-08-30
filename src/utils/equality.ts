import { Identifier } from '../database/type'

export function isIdentifierArrayEquals(
    a: undefined | Identifier[],
    b: undefined | Identifier[],
    isOrderImportant = false,
) {
    if (a === b) return true
    if (a === undefined) return false
    if (b === undefined) return false
    if (a.length !== b.length) return false
    const ax = Identifier.IdentifiersToString(a, isOrderImportant)
    const bx = Identifier.IdentifiersToString(b, isOrderImportant)
    return ax === bx
}
