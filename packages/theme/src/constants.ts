import { PaletteMode, Theme, useTheme } from '@material-ui/core'
import { kebabCase } from 'lodash-es'
import parseColor from 'tinycolor2'
export const LightColor = {
    primary: '#1c68f3',
    primaryContrastText: '#ffffff',

    secondary: '#e8f0fe',
    secondaryContrastText: '#1c68f3',

    primaryBackground: '#ffffff',
    secondaryBackground: '#f9fafa',
    lightBackground: '#F9FAFA',
    suspensionBackground: 'rgba(249, 250, 250, 0.8)',
    normalBackground: '#F3F3F4',
    redMain: '#ff5f5f',
    redLight: '#ffafaf',
    redContrastText: '#ffffff',

    greenMain: '#77e0b5',
    greenLight: '#e6f6f0',

    orangeMain: '#ffb915',
    orangeLight: '#faf0d8',

    iconLight: '#a6a9b6',

    divider: '#f3f3f4',

    border: '#F3F3F4',

    textPrimary: '#111432',
    textSecondary: '#7b8192',

    secondaryInfoText: '#AFC3E1',
    normalText: '#7B8192',

    infoBackground: 'rgba(175, 195, 225, 0.15)',
    warning: '#FFB915',
    blue: '#1C68F3',
    textLink: '#1C68F3',
    lineLight: '#E4E8F1',
    lineLighter: '#E9E9EA',
    textLight: '#A6A9B6',
    lightestBackground: '#FFFFFF',
    linkText: '#1C68F3',
}
export const DarkColor: typeof LightColor = {
    primary: '#1c68f3',
    primaryContrastText: '#ffffff',

    secondary: '#242e57',
    secondaryContrastText: '#ffffff',

    primaryBackground: '#212442',
    secondaryBackground: '#252846',
    lightBackground: '#2E314F',
    suspensionBackground: 'rgba(27, 30, 60, 0.8)',
    normalBackground: '#262947',
    redMain: '#ff5f5f',
    redLight: '#46304a',
    redContrastText: '#ffffff',

    greenMain: '#77e0b5',
    greenLight: '#314457',

    orangeMain: '#ffb915',
    orangeLight: '#463e3f',

    iconLight: '#a6a9b6',

    divider: '#3e455e',

    border: '#3E455E',

    // TODO: ?
    textPrimary: '#ffffff',
    // TODO: ?
    textSecondary: 'ghostwhite',

    secondaryInfoText: '#AFC3E1',
    normalText: 'rgba(255, 255, 255, 0.8)',

    infoBackground: 'rgba(175, 195, 225, 0.15)',
    warning: '#FFB915',
    blue: '#1C68F3',
    textLink: '#ffffff',
    lineLight: '#32365B',
    lineLighter: '#32365B',
    textLight: '#A6A9B6',
    lightestBackground: '#212422',
    linkText: '#ffffff',
}

export type Color = typeof LightColor

export function getMaskColor(theme: Theme) {
    if (theme.palette.mode === 'dark') return DarkColor
    return LightColor
}
export function useMaskColor() {
    return getMaskColor(useTheme())
}

export function applyMaskColorVars(node: HTMLElement, scheme: PaletteMode) {
    const ns: Record<string, string> = scheme === 'light' ? LightColor : DarkColor
    if (node === document.body) {
        const id = '#mask-style-var'
        if (!document.getElementById(id)) {
            const style = document.createElement('style')
            style.id = id
            document.head.appendChild(style)
        }
        applyMaskColorVars(document.getElementById(id)!, scheme)
        return
    } else if (node instanceof HTMLStyleElement) {
        let rule = ':root, :host {\n'
        for (const key in ns) {
            // --mask-name: val;
            rule += `    --mask-${kebabCase(key)}: ${ns[key]};\n`
            rule += `    --mask-${kebabCase(key)}-fragment: ${getRGBFragment(ns, key)};\n`
        }
        node.innerHTML = rule + '}'
    } else {
        for (const key in ns) {
            node.style.setProperty('--mask-' + kebabCase(key), ns[key])
            node.style.setProperty('--mask-' + kebabCase(key) + '-fragment', getRGBFragment(ns, key))
        }
    }
}
// Fragment are in the form of "1, 2, 3"
// which is used for rgba(var(--x), alpha)
function getRGBFragment(x: Record<string, string>, key: string) {
    const { r, g, b } = parseColor(x[key]).toRgb()
    return [r, g, b].join(', ')
}

type MaskCSSVariableColor = string & {
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
