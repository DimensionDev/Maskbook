export type Nullable<T> = {
    readonly hasValue: boolean
    readonly value: T | null | undefined
    unwrap(message: string): T
}
export function Nullable<T>(x: T | null | undefined) {
    return {
        get hasValue() {
            return !(x === null || x === undefined)
        },
        get value() {
            return x
        },
        unwrap(message: string): NonNullable<T> {
            if (!this.hasValue) throw new Error(message)
            return x as NonNullable<T>
        },
    }
}
