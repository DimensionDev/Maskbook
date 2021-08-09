export function getEnumAsObject<T>(enumArray: T[], getKey: (v: T) => string) {
    return enumArray.reduce<Record<string, T>>((accumulator, x) => {
        accumulator[getKey(x)] = x
        return accumulator
    }, {})
}
