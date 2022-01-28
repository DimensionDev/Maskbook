interface Array<T> {
    findFromLast<S extends T>(
        predicate: (this: void, value: T, index: number, obj: T[]) => value is S,
        thisArg?: any,
    ): S | undefined
    findFromLast(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface ReadonlyArray<T> {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Int8Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Uint8Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Uint8ClampedArray {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Int16Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Uint16Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Int32Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Uint32Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Float32Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
interface Float64Array {
    findFromLast(predicate: (value: T) => boolean, thisArg?: any): T | undefined
    findFromLastIndex(predicate, thisArg?: any): number
}
