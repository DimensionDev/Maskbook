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

    divider: '#f3f3f4',

    textPrimary: '#111432',
    textSecondary: '#7b8192',
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

    divider: '#3e455e',

    // TODO: ?
    textPrimary: 'white',
    // TODO: ?
    textSecondary: 'ghostwhite',
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

/**
 * This component provides the CSS variable version of MaskColor.
 * It must be placed on the top of every DOM tree (not the React tree) so please aware the usage of Portals.
 */
export const MaskColorRoot = experimentalStyled('div')((theme) => {
    const obj: any = {}
    const ns = theme.theme.palette.mode === 'light' ? LightColor : DarkColor
    for (const key in ns) {
        obj['--mask-' + kebabCase(key)] = (ns as any)[key]
    }
    return obj
})

export function applyMaskColorVarsToDOM(node: HTMLElement, scheme: PaletteMode) {
    const ns = scheme === 'light' ? LightColor : DarkColor
    for (const key in ns) {
        node.style.setProperty('--mask-' + kebabCase(key), (ns as any)[key])
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
