/**
 * Remove all methods from the type T to make it "prototype-less".
 */
export type PrototypeLess<T> = {
    [key in keyof T]: T[key] extends (...args: any) => unknown ? unknown : PrototypeLess<T[key]>
}

/**
 * @description Restore prototype on an object. This does not work with classes that uses ES private field.
 * @example
 * restorePrototype({ value: 1 }, SomeClass.prototype)
 * @param obj The prototype-less object.
 * @param prototype The prototype object
 * @returns The original object with prototype restored.
 */
export function restorePrototype<PrototypeLessT extends undefined | PrototypeLess<OriginalT>, OriginalT extends object>(
    obj: PrototypeLessT,
    prototype: OriginalT,
): PrototypeLessT extends undefined ? undefined : OriginalT {
    if (!obj) return obj as any
    Object.setPrototypeOf(obj, prototype)
    return obj as any
}

export function restorePrototypeArray<
    PrototypeLessT extends undefined | PrototypeLess<OriginalT>[],
    OriginalT extends object,
>(arr: PrototypeLessT, prototype: OriginalT): PrototypeLessT extends undefined ? undefined : OriginalT[] {
    if (!arr) return arr as any
    arr.forEach((x) => Object.setPrototypeOf(x, prototype))
    return arr as any
}
