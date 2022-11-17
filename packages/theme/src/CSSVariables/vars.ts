import type { Theme } from '@mui/material'
import { kebabCase } from 'lodash-es'
import { LightColor, DarkColor } from './constants.js'

export function getMaskColor(theme: Theme) {
    if (theme.palette.mode === 'dark') return DarkColor
    return LightColor
}
export type MaskCSSVariableColor = string & {
    /** Append alpha channel to the original color */
    alpha(alpha: number): string
} & ((defaultValue?: string) => string)

function set(key: string | symbol) {
    if (typeof key === 'symbol') return undefined
    const cssVar = kebabCase(key)
    function value(defaultValue?: string) {
        // it might be an object when used in styled components.
        if (typeof defaultValue !== 'string') defaultValue = undefined
        const x = `var(--mask-${cssVar}${defaultValue ? ', ' + defaultValue : ''})`
        return x
    }
    Object.assign(value, {
        [Symbol.toPrimitive]: () => `var(--mask-${cssVar})`,
        alpha: (alpha: number) => `rgba(var(--mask-${cssVar}-fragment), ${alpha})`,
    })
    Object.defineProperty(MaskColorVar, key, { configurable: true, enumerable: true, value })
    return value
}
/**
 * @deprecated Use theme.palette.maskColor
 */
export const MaskColorVar: Record<keyof typeof LightColor, MaskCSSVariableColor> = {
    __proto__: new Proxy(
        {},
        {
            get: (_, p) => set(p),
            getOwnPropertyDescriptor: (_, p) => {
                set(p)
                return Object.getOwnPropertyDescriptor(MaskColorVar, p)
            },
        },
    ),
} as any
