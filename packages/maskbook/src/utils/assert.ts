import { notStrictEqual as notEqual } from 'assert'

const notInclude = (val: unknown, things: unknown[], message: string) => {
    things.forEach((value) => {
        notEqual(val, value, message)
    })
}

/**
 * Ensure a value not null or undefined.
 */
export const notNullable = <T>(val: T, message: string = 'Unexpected nil value detected') => {
    notInclude(val, [null, undefined], message)
    return val as NonNullable<T>
}
