interface ArrayConstructor {
    fromAsync<T>(items: AsyncIterable<T>, mapper?: undefined, thisArg?: any): Promise<T>
    fromAsync<T, Q>(items: AsyncIterable<T>, mapper: (value: T) => Q, thisArg?: any): Promise<Q>
}
