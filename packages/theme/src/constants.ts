import { experimentalStyled, PaletteMode, Theme, ThemeOptions, useTheme } from '@material-ui/core'
import { kebabCase } from 'lodash-es'
import { merge } from 'lodash-es'
export const LightColor = {
    primary: '#1c68f3',
    primaryContrastText: 'white',

    secondary: '#e8f0fe',
    secondaryContrastText: '#1c68f3',

    primaryBackground: '#ffffff',
    secondaryBackground: '#f9fafa',

    redMain: '#ff5f5f',
    redLight: '#ffafaf',
    redContrastText: 'white',

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
}
export const DarkColor: typeof LightColor = {
    primary: '#1c68f3',
    primaryContrastText: 'white',

    secondary: '#242e57',
    secondaryContrastText: '#1c68f3',

    primaryBackground: '#212442',
    secondaryBackground: '#252846',

    redMain: '#ff5f5f',
    redLight: '#46304a',
    redContrastText: 'white',

    greenMain: '#77e0b5',
    greenLight: '#314457',

    orangeMain: '#ffb915',
    orangeLight: '#463e3f',

    iconLight: '#a6a9b6',

    divider: '#3e455e',

    border: '#3E455E',

    // TODO: ?
    textPrimary: 'white',
    // TODO: ?
    textSecondary: 'ghostwhite',

    secondaryInfoText: '#AFC3E1',
    normalText: 'rgba(255, 255, 255, 0.8)',

    infoBackground: 'rgba(175, 195, 225, 0.15)',
}

export const TypographyOptions: ThemeOptions['typography'] = {}
export const LightTypographyOptions: ThemeOptions['typography'] = merge(
    {},
    TypographyOptions,
    {} as ThemeOptions['typography'],
)
export const DarkTypographyOptions: ThemeOptions['typography'] = merge(
    {},
    TypographyOptions,
    {} as ThemeOptions['typography'],
)
export type Color = typeof LightColor

export function getMaskColor(theme: Theme) {
    if (theme.palette.mode === 'dark') return DarkColor
    return LightColor
}
export function useMaskColor() {
    return getMaskColor(useTheme())
}

export function applyMaskColorVars(node: HTMLElement, scheme: PaletteMode) {
    const ns = scheme === 'light' ? LightColor : DarkColor
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
            rule += '    --mask-' + kebabCase(key) + ': ' + (ns as any)[key] + ';\n'
        }
        node.innerHTML = rule + '}'
    } else {
        for (const key in ns) {
            node.style.setProperty('--mask-' + kebabCase(key), (ns as any)[key])
        }
    }
}
export const MaskColorVar: Record<keyof typeof LightColor, string /* & ((defaultValue?: string) => {}) */> = new Proxy(
    { __proto__: null } as any,
    {
        get(target, key) {
            if (target[key]) return target[key]
            if (typeof key !== 'string') throw new TypeError()
            const cssVar = kebabCase(key)
            // ? It should always defined based on our API contract.
            // ? So there is no need to be string & (string => string)
            // ? Let's use the simpler way
            target[key] = `var(--mask-${cssVar})`
            // target[key] = (defaultValue?: string) => {
            //     // it might be an object when used in styled components.
            //     if (typeof defaultValue !== 'string') defaultValue = undefined
            //     const x = `var(--mask-${cssVar}${defaultValue ? ', ' + defaultValue : ''})`
            //     return x
            // }
            // target[key][Symbol.toPrimitive] = () => `var(--mask-${cssVar})`
            return target[key]
        },
    },
)
