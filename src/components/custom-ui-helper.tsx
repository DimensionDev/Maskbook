import classNames from 'classnames'

export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: Record<InternalKeys, string>,
    nextProps: Partial<withClasses<OverwrittenKeys>>,
) {
    if (!nextProps.classes) return defaultStyles
    const classes = { ...defaultStyles }
    for (const key in classes) {
        if (key in nextProps.classes) {
            classes[key] = classNames(defaultStyles[key], Reflect.get(nextProps.classes, key))
        }
    }
    return classes as Record<InternalKeys | OverwrittenKeys, string>
}
/**
 * In case of y is a react hooks call, we should always call the hooks. So we can't use x || y directly.
 */
export function or<T>(x: T | undefined, y: T) {
    return x || y
}
