export type Nullable<T> = {
    readonly value: T | null | undefined
    unwrap(message: string): T
}
export function Nullable<T>(x: T | null | undefined) {
    return {
        get value() {
            return x
        },
        unwrap(message: string): NonNullable<T> {
            if (x === null || x === undefined) throw new Error(message)
            return x as NonNullable<T>
        },
    }
}
