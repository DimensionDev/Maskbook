/// <reference path="./custom-ui.d.ts" />
// Priority: classes from props > configHooks > defaultStyles
export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: Record<InternalKeys, string>,
    props: withClasses<OverwrittenKeys>,
    useConfigHooks?: () => Partial<Record<OverwrittenKeys, string>>,
): Record<InternalKeys, string> & Partial<Record<OverwrittenKeys, string>> {
    // Note: this is a React hooks
    const configOverwrite = useConfigHooks?.()
    const propsOverwrite = props.classes
    return mergeClasses<any>(defaultStyles, configOverwrite, propsOverwrite) as any
}

export function mergeClasses<T extends string>(
    ...args: (Partial<Record<T, string>> | undefined)[]
): Partial<Record<T, string>> {
    args = args.filter(Boolean)
    if (args.length === 1) return args[0]!
    const result = {} as Partial<Record<T, string>>
    for (const current of args) {
        if (!current) continue
        for (const key in current) {
            if (key === '__proto__') continue
            if (key in result) result[key] = result[key] + ' ' + current[key]
            else result[key] = current[key]
        }
    }
    return result
}

/**
 * In case of y is a react hooks call, we should always call the hooks. So we can't use x ?? y directly.
 */
export function or<T>(x: T | undefined, y: T) {
    return x ?? y
}
