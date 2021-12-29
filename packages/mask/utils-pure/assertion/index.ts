/**
 * Ensure a value not null or undefined.
 */
export function assertNonNull<T>(val: T, message: string = 'Unexpected nil value detected') {
    if (val === null || val === undefined) throw new Error(message)
    return val as NonNullable<T>
}
