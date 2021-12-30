interface Array<T> {
    groupBy<K extends PropertyKey>(group: (value: T, index: number, o: this) => K, thisArg?: any): Record<K, T[]>
    groupByMap<K extends PropertyKey>(group: (value: T, index: number, o: this) => K, thisArg?: any): Map<K, T[]>
}
interface ReadonlyArray<T> {
    groupBy<K extends PropertyKey>(group: (value: T, index: number, o: this) => K, thisArg?: any): Record<K, T[]>
    groupByMap<K extends PropertyKey>(group: (value: T, index: number, o: this) => K, thisArg?: any): Map<K, T[]>
}
