export * from './prototype'
export function assert(x: any, ...args: any): asserts x {
    console.assert(x, ...args)
    if (!x) throw new Error('Assert failed!')
}

export function nonNullable<T>(x: undefined | null | T): x is T {
    return x !== undefined && x !== null
}
