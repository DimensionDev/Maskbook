export function restorePrototype<T extends object>(obj: T[] | undefined, prototype: T) {
    if (obj === undefined) return
    obj.forEach(x => Object.setPrototypeOf(x, prototype))
}
