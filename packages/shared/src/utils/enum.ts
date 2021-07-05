export function getEnumAsObject<T>(enumArray: T[], getKey: (v: T) => string) {
    return enumArray.reduce(
        (accumulator, x) => {
            accumulator[getKey(x)] = x
            return accumulator
        },
        {} as {
            [key: string]: T
        },
    )
}
