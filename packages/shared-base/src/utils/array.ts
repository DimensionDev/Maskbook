export function nonNullable<T>(x: T | false | undefined | null): x is T {
    return Boolean(x)
}
