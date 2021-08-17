/// <reference path="./custom-ui.d.ts" />
import type { ClassNameMap } from '@material-ui/styles'
// Priority: classes from props > configHooks > defaultStyles
export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: { classes?: ClassNameMap<InternalKeys> },
    props: { classes?: Partial<ClassNameMap<OverwrittenKeys>> },
    useConfigHooks?: () => { classes: Partial<ClassNameMap<OverwrittenKeys>> } | Partial<ClassNameMap<OverwrittenKeys>>,
): ClassNameMap<InternalKeys> & Partial<ClassNameMap<OverwrittenKeys>>
export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: ClassNameMap<InternalKeys>,
    props: { classes?: Partial<ClassNameMap<OverwrittenKeys>> },
    useConfigHooks?: () => { classes: Partial<ClassNameMap<OverwrittenKeys>> } | Partial<ClassNameMap<OverwrittenKeys>>,
): ClassNameMap<InternalKeys> & Partial<ClassNameMap<OverwrittenKeys>>
export function useStylesExtends<InternalKeys extends string, OverwrittenKeys extends string>(
    defaultStyles: { classes?: ClassNameMap<InternalKeys> } | ClassNameMap<InternalKeys>,
    props: { classes?: Partial<ClassNameMap<OverwrittenKeys>> },
    useConfigHooks?: () => { classes: Partial<ClassNameMap<OverwrittenKeys>> } | Partial<ClassNameMap<OverwrittenKeys>>,
): ClassNameMap<InternalKeys> & Partial<ClassNameMap<OverwrittenKeys>> {
    // Note: this is a React hooks
    const configOverwrite = useConfigHooks?.() || ({} as any)
    const overwriteResult: ClassNameMap<InternalKeys> =
        'classes' in configOverwrite ? configOverwrite.classes : configOverwrite
    const propsOverwrite = props.classes
    const result: ClassNameMap<InternalKeys> =
        'classes' in defaultStyles ? defaultStyles.classes : (defaultStyles as any)
    return mergeClasses(result, overwriteResult, propsOverwrite) as any
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

/**
 * In case of y is a react hooks call, we should always call the hooks. So we can't use x ?? y directly.
 */
export function or<T>(x: T | undefined, y: T) {
    return x ?? y
}
