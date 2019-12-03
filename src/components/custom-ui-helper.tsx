import classNames from 'classnames'

export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: Record<InternalKeys, string>,
    nextProps: withClasses<OverwrittenKeys>,
): Record<InternalKeys, string> & Partial<Record<OverwrittenKeys, string>> {
    if (!nextProps.classes) return defaultStyles as any
    const classes = { ...defaultStyles, ...nextProps.classes }
    for (const key in classes) {
        if (key in nextProps.classes) {
            ;(classes as any)[key] = classNames((defaultStyles as any)[key], Reflect.get(nextProps.classes, key))
        }
    }
    return classes
}

/**
 * In case of y is a react hooks call, we should always call the hooks. So we can't use x || y directly.
 */
export function or<T>(x: T | undefined, y: T) {
    return x || y
}
