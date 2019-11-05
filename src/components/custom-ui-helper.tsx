import classNames from 'classnames'

export function useStylesExtends<Keys extends string, Keys2 extends Keys>(
    defaultStyles: Record<Keys, string>,
    nextProps: Partial<withClasses<Keys2>>,
) {
    if (!nextProps.classes) return defaultStyles
    const classes = { ...defaultStyles }
    for (const key in classes) {
        if (key in nextProps.classes) {
            classes[key] = classNames(defaultStyles[key], Reflect.get(nextProps.classes, key))
        }
    }
    return classes
}
