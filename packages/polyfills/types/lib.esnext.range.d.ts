type Infinity = number
interface RangeIterator<T extends number | bigint> extends IteratorHelperIterator<T, void, void> {
    // This property is not in the spec yet.
    // [Symbol.iterator](): RangeIterator<T>
    [Symbol.toStringTag]: 'RangeIterator'
    readonly start: T
    readonly end: T | Infinity
    readonly step: T
    readonly inclusive: boolean
}
interface NumberConstructor {
    range(
        start: number,
        end: number | Infinity,
        option?: number | { step?: number; inclusive?: boolean },
    ): RangeIterator<number>
    range(start: number, end: number | Infinity, step?: number): RangeIterator<number>
}
interface BigIntConstructor {
    range(
        start: bigint,
        end: bigint | Infinity,
        option?: bigint | { step?: bigint; inclusive?: boolean },
    ): RangeIterator<bigint>
    range(start: bigint, end: bigint | Infinity, step?: bigint): RangeIterator<bigint>
}
