interface Array<T> {
    filterReject(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[]
}
interface ReadonlyArray<T> {
    filterReject(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[]
}
