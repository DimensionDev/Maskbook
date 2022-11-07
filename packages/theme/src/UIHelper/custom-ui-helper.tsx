/// <reference path="./custom-ui.d.ts" />

import { useRef } from 'react'
import type { Cx } from 'tss-react'
export type ClassNameMap<ClassKey extends string = string> = { [P in ClassKey]: string }
export function useStylesExtends<Input extends { classes: ClassNameMap; cx: Cx }, PropsOverwriteKeys extends string>(
    defaultStyles: Input,
    props: { classes?: Partial<ClassNameMap<PropsOverwriteKeys>> },
    useConfigHooks?: () => { classes: Partial<ClassNameMap<PropsOverwriteKeys>> },
): Omit<Input, 'classes'> & { classes: Input['classes'] & Partial<ClassNameMap<PropsOverwriteKeys>> } {
    const { current: useConfigOverwriteHook } = useRef(useConfigHooks || (() => ({ classes: {} })))
    const configOverwrite = useConfigOverwriteHook()
    const { classes, cx } = defaultStyles

    const allKeys = new Set([
        ...Object.keys(defaultStyles.classes),
        ...(props.classes ? Object.keys(props.classes) : []),
        ...Object.keys(configOverwrite.classes),
    ])
    const result: Record<string, string> = {}
    for (const key of allKeys) {
        result[key] = cx((classes as any)[key], (props.classes as any)?.[key], (configOverwrite.classes as any)?.[key])
    }
    return { ...defaultStyles, classes: result } as any
}
