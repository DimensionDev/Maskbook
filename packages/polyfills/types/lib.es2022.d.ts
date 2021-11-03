interface Array<T> {
    at(index: number): T
}
interface ReadonlyArray<T> {
    at(index: number): T
}
interface String {
    at(index: number): string | undefined
}
interface Int8Array {
    at(index: number): number | undefined
}
interface Uint8Array {
    at(index: number): number | undefined
}
interface Uint8ClampedArray {
    at(index: number): number | undefined
}
interface Int16Array {
    at(index: number): number | undefined
}
interface Uint16Array {
    at(index: number): number | undefined
}
interface Int32Array {
    at(index: number): number | undefined
}
interface Uint32Array {
    at(index: number): number | undefined
}
interface Float32Array {
    at(index: number): number | undefined
}
interface Float64Array {
    at(index: number): number | undefined
}
interface ObjectConstructor {
    hasOwn(object: object, p: string | number | symbol): boolean
}
interface Error {
    cause?: any
}
interface ErrorConstructor {
    new (message?: string, options?: { cause?: any }): Error
    (message?: string, options?: { cause?: any }): Error
}

interface AggregateErrorConstructor {
    new (errors: Iterable<any>, message?: string, options?: { cause?: any }): AggregateError
    (errors: Iterable<any>, message?: string, options?: { cause?: any }): AggregateError
}
