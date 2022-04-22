import type { Theme } from '@mui/material'
import { kebabCase } from 'lodash-unified'
import { LightColor, DarkColor } from './constants'

export function getMaskColor(theme: Theme) {
    if (theme.palette.mode === 'dark') return DarkColor
    return LightColor
}
export type MaskCSSVariableColor = string & {
    /** Append alpha channel to the original color */
    alpha(alpha: number): string
} & ((defaultValue?: string) => string)

export const MaskColorVar: Record<keyof typeof LightColor, MaskCSSVariableColor> = new Proxy(
    { __proto__: null } as any,
    {
        get(target, key) {
            if (target[key]) return target[key]
            if (typeof key !== 'string') throw new TypeError()
            const cssVar = kebabCase(key)
            target[key] = (defaultValue?: string) => {
                // it might be an object when used in styled components.
                if (typeof defaultValue !== 'string') defaultValue = undefined
                const x = `var(--mask-${cssVar}${defaultValue ? ', ' + defaultValue : ''})`
                return x
            }
            target[key][Symbol.toPrimitive] = () => `var(--mask-${cssVar})`
            target[key].alpha = (alpha: number) => `rgba(var(--mask-${cssVar}-fragment), ${alpha})`
            return target[key]
        },
    },
)
