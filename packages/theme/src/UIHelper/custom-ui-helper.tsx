/// <reference path="./custom-ui.d.ts" />
export type ClassNameMap<ClassKey extends string = string> = { [P in ClassKey]: string }
// Priority: classes from props > configHooks > defaultStyles
export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: { classes?: ClassNameMap<InternalKeys> },
    props: { classes?: Partial<ClassNameMap<OverwrittenKeys>> },
    useConfigHooks?: () => { classes: Partial<ClassNameMap<OverwrittenKeys>> },
): ClassNameMap<InternalKeys> & Partial<ClassNameMap<OverwrittenKeys>> {
    // Note: this is a React hooks
    const configOverwrite = useConfigHooks?.() || { classes: {} }
    return mergeClasses(defaultStyles.classes, configOverwrite.classes, props.classes) as any
}

export function mergeClasses(...args: (Partial<ClassNameMap<string>> | undefined)[]): Partial<ClassNameMap<string>> {
    args = args.filter(Boolean)
    if (args.length === 1) return args[0]!
    const result = {} as Partial<ClassNameMap<string>>
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
