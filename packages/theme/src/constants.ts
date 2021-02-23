import { Theme, ThemeOptions, useTheme } from '@material-ui/core'
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
