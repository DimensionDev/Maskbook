export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type PrototypeLess<T> = {
    [key in keyof T]: T[key] extends (...args: any) => unknown ? unknown : PrototypeLess<T[key]>
}

export function restorePrototype<ActualType extends undefined | PrototypeLess<WantedType>, WantedType extends object>(
    obj: ActualType,
    prototype: WantedType,
): ActualType extends undefined ? undefined : WantedType {
    if (!obj) return obj as any
    Object.setPrototypeOf(obj, prototype)
    return obj as any
}

export function restorePrototypeArray<
    ActualType extends undefined | PrototypeLess<WantedType>[],
    WantedType extends object,
>(obj: ActualType, prototype: WantedType): ActualType extends undefined ? undefined : WantedType[] {
    if (!obj) return obj as any
    obj.forEach((x) => Object.setPrototypeOf(x, prototype))
    return obj as any
}
