export function compose<T>(...args: [...composer: Array<((arg: T) => T) | null | false>, init: T]) {
    if (args.length === 0) throw new TypeError()
    const last = args.pop() as T

    return (args as Array<((arg: T) => T) | null>).filter(Boolean).reduceRight((prev, fn) => fn!(prev), last)
}
