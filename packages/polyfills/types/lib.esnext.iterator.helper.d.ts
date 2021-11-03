declare var Iterator: IteratorConstructor
interface IteratorConstructor {
    new (): IteratorHelperIterator<any>
    from<T>(O: Iterable<T>): IteratorHelperIterator<T>
    readonly prototype: IteratorHelperIterator<any>
}
declare var AsyncIterator: AsyncIteratorConstructor
interface AsyncIteratorConstructor {
    new (): AsyncIteratorHelperIterator<any>
    from<T>(O: Iterable<T> | AsyncIterable<T>): AsyncIteratorHelperIterator<T>
    readonly prototype: AsyncIteratorHelperIterator<any>
}
interface IteratorHelperIterator<T, TReturn = any, TNext = undefined> extends Iterator<T, TReturn, TNext> {
    map<Q>(mapper: (val: T) => Q): IteratorHelperIterator<Q, TReturn, TNext>
    filter<Q>(filterer: (val: T) => val is Q): IteratorHelperIterator<Q, TReturn, TNext>
    filter(filterer: (val: T) => boolean): this
    take(limit: number): this
    drop(limit: number): this
    asIndexedPairs(): IteratorHelperIterator<[index: number, value: T], TReturn, TNext>
    flatMap<Q>(mapper: (val: T) => Iterable<Q>): IteratorHelperIterator<Q, TReturn, TNext>
    reduce<R>(reducer: (accumulator: R, value: T) => R, initialValue?: R): IteratorHelperIterator<R, TReturn, TNext>
    toArray(): T[]
    forEach(fn: (value: T) => void): void
    some(fn: (value: T) => boolean): boolean
    every(fn: (value: T) => boolean): boolean
    find(fn: (value: T) => boolean): T | undefined
    [Symbol.toStringTag]: 'Iterator'
}
interface AsyncIteratorHelperIterator<T, TReturn = any, TNext = undefined> extends AsyncIterator<T, TReturn, TNext> {
    map<Q>(mapper: (val: T) => Q): AsyncIteratorHelperIterator<Q, TReturn, TNext>
    filter<Q>(filterer: (val: T) => val is Q): AsyncIteratorHelperIterator<Q, TReturn, TNext>
    filter(filterer: (val: T) => boolean): this
    take(limit: number): this
    drop(limit: number): this
    asIndexedPairs(): AsyncIteratorHelperIterator<[index: number, value: T], TReturn, TNext>
    flatMap<Q>(mapper: (val: T) => Iterable<Q>): AsyncIteratorHelperIterator<Q, TReturn, TNext>
    reduce<R>(
        reducer: (accumulator: R, value: T) => R,
        initialValue?: R,
    ): AsyncIteratorHelperIterator<R, TReturn, TNext>
    toArray(): Promise<T[]>
    forEach(fn: (value: T) => void): Promise<void>
    some(fn: (value: T) => boolean): Promise<boolean>
    every(fn: (value: T) => boolean): Promise<boolean>
    find(fn: (value: T) => boolean): Promise<T | undefined>
    [Symbol.toStringTag]: 'Async Iterator'
}
interface IteratorHelperIterableIterator<T> extends IteratorHelperIterator<T> {
    [Symbol.iterator](): IteratorHelperIterator<T>
}
interface Generator<T = unknown, TReturn = any, TNext = unknown> extends IteratorHelperIterator<T, TReturn, TNext> {}
interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown>
    extends AsyncIteratorHelperIterator<T, TReturn, TNext> {}

interface Array<T> {
    [Symbol.iterator](): IteratorHelperIterableIterator<T>
    entries(): IteratorHelperIterableIterator<[number, T]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<T>
}
interface ReadonlyArray<T> {
    [Symbol.iterator](): IteratorHelperIterableIterator<T>
    entries(): IteratorHelperIterableIterator<[number, T]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<T>
}
interface IArguments {
    /** Iterator */
    [Symbol.iterator](): IteratorHelperIterableIterator<any>
}
interface Map<K, V> {
    [Symbol.iterator](): IteratorHelperIterableIterator<[K, V]>
    entries(): IteratorHelperIterableIterator<[K, V]>
    keys(): IteratorHelperIterableIterator<K>
    values(): IteratorHelperIterableIterator<V>
}
interface ReadonlyMap<K, V> {
    [Symbol.iterator](): IteratorHelperIterableIterator<[K, V]>
    entries(): IteratorHelperIterableIterator<[K, V]>
    keys(): IteratorHelperIterableIterator<K>
    values(): IteratorHelperIterableIterator<V>
}
interface Set<T> {
    [Symbol.iterator](): IteratorHelperIterableIterator<T>
    entries(): IteratorHelperIterableIterator<[T, T]>
    keys(): IteratorHelperIterableIterator<T>
    values(): IteratorHelperIterableIterator<T>
}
interface ReadonlySet<T> {
    [Symbol.iterator](): IteratorHelperIterableIterator<T>
    entries(): IteratorHelperIterableIterator<[T, T]>
    keys(): IteratorHelperIterableIterator<T>
    values(): IteratorHelperIterableIterator<T>
}
interface String {
    /** Iterator */
    [Symbol.iterator](): IteratorHelperIterableIterator<string>
}
interface Int8Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Uint8Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Uint8ClampedArray {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Int16Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Uint16Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Int32Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Uint32Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Float32Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
interface Float64Array {
    [Symbol.iterator](): IteratorHelperIterableIterator<number>
    entries(): IteratorHelperIterableIterator<[number, number]>
    keys(): IteratorHelperIterableIterator<number>
    values(): IteratorHelperIterableIterator<number>
}
