import { useValueRef } from '@masknet/shared-base-ui'
import { Appearance, makeStyles, parseColor } from '@masknet/theme'
import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
import { blue, green, red } from '@mui/material/colors'
import { jaJP, koKR, zhTW, zhCN, enUS, Localization } from '@mui/material/locale/index'
import type { Theme, ThemeOptions } from '@mui/material/styles/createTheme'
import { cloneDeep, merge } from 'lodash-unified'
import { useRef } from 'react'
import { languageSettings } from '../settings/settings'
import { activatedSocialNetworkUI } from '../social-network'
import './theme-global.d'
import { useSubscription } from 'use-subscription'
import produce, { setAutoFreeze } from 'immer'
import twitterColorSchema from '../social-network-adaptor/twitter.com/customization/twitter-color-schema.json'
import { staticSubscription, MaskDarkTheme, MaskLightTheme } from './MaskTheme'

export function useClassicMaskSNSTheme() {
    const { current: provider } = useRef(
        activatedSocialNetworkUI.customization.paletteMode?.current || staticSubscription,
    )
    const { current: usePostTheme = (t: Theme) => t } = useRef(activatedSocialNetworkUI.customization.useTheme)
    const palette = useSubscription(provider)
    const baseTheme = palette === 'dark' ? MaskDarkTheme : MaskLightTheme

    // TODO: support RTL?
    const [localization, isRTL] = useThemeLanguage()
    const theme = unstable_createMuiStrictModeTheme(baseTheme, localization)
    return usePostTheme(theme)
}
/**
 * Only used in swap pages under popups, will replace it in the future
 */
export function usePopupsMaskFullPageTheme() {
    const baseTheme = MaskLightTheme

    setAutoFreeze(false)
    const PopupTheme = produce(baseTheme, (theme) => {
        theme.palette.background.paper = '#ffffff'
        theme.palette.primary = {
            ...theme.palette.primary,
            main: '#1c68f3',
        }

        const colorSchema = twitterColorSchema.light
        const colors = Object.keys(colorSchema) as Array<keyof typeof colorSchema>

        colors.forEach((color) => {
            if (typeof theme.palette[color] === 'object') {
                Object.assign(theme.palette[color], colorSchema[color])
            }
        })
        theme.palette.divider = colorSchema.divider
        theme.palette.secondaryDivider = colorSchema.secondaryDivider
        theme.components = theme.components || {}
        const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
        theme.components.MuiButton = {
            defaultProps: {
                size: 'medium',
                disableElevation: true,
                variant: 'contained',
            },
            variants: [
                {
                    props: { variant: 'sns' },
                    style: {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                            color: theme.palette.common.white,
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.common.white,
                        },
                    },
                },
                {
                    props: { color: 'error' },
                    style: {
                        backgroundColor: theme.palette.error.main,
                        color: theme.palette.common.white,
                        '&:hover': {
                            backgroundColor: '#f53b47',
                        },
                    },
                },
            ],
            styleOverrides: {
                root: {
                    borderRadius: 500,
                    textTransform: 'initial',
                    fontWeight: 600,
                    minHeight: 39,
                    paddingLeft: 15,
                    paddingRight: 15,
                    boxShadow: 'none',
                    [smallQuery]: {
                        '&': {
                            height: 30,
                            minHeight: 'auto !important',
                            padding: '0 14px !important',
                        },
                    },
                },
                contained: {
                    backgroundColor: theme.palette.text.primary,
                    color: theme.palette.text.buttonText,
                    '&.Mui-disabled': {
                        opacity: 0.5,
                        backgroundColor: theme.palette.text.primary,
                        color: theme.palette.text.buttonText,
                    },
                    '&:hover': {
                        backgroundColor: theme.palette.action.buttonHover,
                    },
                    [smallQuery]: {
                        '&': {
                            height: 30,
                            minHeight: 'auto !important',
                            padding: '0 14px !important',
                        },
                    },
                },
                containedSecondary: {
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.strong,
                    '&:hover': {
                        color: theme.palette.action.buttonHover,
                        backgroundColor: theme.palette.action.bgHover,
                    },
                    '&.Mui-disabled': {
                        opacity: 0.5,
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.strong,
                    },
                },
                outlined: {
                    color: theme.palette.text.strong,
                    borderColor: theme.palette.secondaryDivider,
                    backgroundColor: 'transparent',
                    '&:hover': {
                        color: theme.palette.action.buttonHover,
                        borderColor: theme.palette.secondaryDivider,
                        backgroundColor: parseColor(theme.palette.text.primary).setAlpha(0.1).toRgbString(),
                    },
                    '&.Mui-disabled': {
                        opacity: 0.5,
                        color: theme.palette.text.strong,
                        backgroundColor: 'transparent',
                    },
                },
                sizeLarge: {
                    minHeight: 40,
                    paddingLeft: 30,
                    paddingRight: 30,
                    [smallQuery]: {
                        '&': {
                            height: 28,
                            minHeight: 28,
                            paddingLeft: 15,
                            paddingRight: 15,
                        },
                    },
                },
                sizeSmall: {
                    minHeight: 30,
                    paddingLeft: 15,
                    paddingRight: 15,
                    [smallQuery]: {
                        '&': {
                            height: 25,
                            minHeight: 29,
                            paddingLeft: 10,
                            paddingRight: 10,
                        },
                    },
                },
            },
        }
        theme.components.MuiPaper = {
            defaultProps: {
                elevation: 0,
            },
        }
        theme.components.MuiTab = {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        }
        theme.components.MuiChip = {
            styleOverrides: {
                root: {
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.strong,
                },
                colorPrimary: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.common.white,
                    '&:hover': {
                        backgroundColor: parseColor(theme.palette.text.primary).setAlpha(0.1).toRgbString(),
                    },
                },
            },
        }
        theme.components.MuiBackdrop = {
            styleOverrides: {
                root: {
                    backgroundColor: theme.palette.action.mask,
                },
            },
        }
        theme.components.MuiTooltip = {
            styleOverrides: {
                tooltip: {
                    backgroundColor: theme.palette.background.tipMask,
                    color: theme.palette.text.buttonText,
                    borderRadius: 8,
                },
                tooltipArrow: {
                    backgroundColor: theme.palette.background.tipMask,
                },
            },
        }
        theme.components.MuiSnackbar = {
            styleOverrides: {
                root: {
                    filter: `drop-shadow(0px 0px 16px ${theme.palette.background.messageShadow});`,
                },
            },
        }
    })
    return unstable_createMuiStrictModeTheme(PopupTheme)
}

export function useThemeLanguage(): [loc: Localization, RTL: boolean] {
    let language = useValueRef(languageSettings)
    // TODO: support auto language
    if (language === LanguageOptions.__auto__) language = LanguageOptions.enUS

    const displayLanguage = language as any as SupportedLanguages

    const langs: Record<SupportedLanguages, Localization> = {
        [SupportedLanguages.enUS]: enUS,
        [SupportedLanguages.jaJP]: jaJP,
        [SupportedLanguages.koKR]: koKR,
        [SupportedLanguages.zhTW]: zhTW,
        [SupportedLanguages.zhCN]: zhCN,
    }
    return [langs[displayLanguage] || enUS, false]
}

export interface ClassicMaskFullPageThemeOptions {
    forcePalette?: Appearance
}

export const useColorStyles = makeStyles()((theme: typeof MaskDarkTheme) => {
    const dark = theme.palette.mode === 'dark'
    return {
        error: {
            color: dark ? red[500] : red[900],
        },
        success: {
            color: dark ? green[500] : green[800],
        },
        info: {
            color: dark ? blue[500] : blue[800],
        },
    }
})
export const useErrorStyles = makeStyles()((theme) => {
    const dark = theme.palette.mode === 'dark'
    return {
        containedPrimary: {
            backgroundColor: dark ? red[500] : red[900],
            '&:hover': {
                backgroundColor: dark ? red[900] : red[700],
            },
        },
        outlinedPrimary: {
            borderColor: dark ? red[500] : red[900],
            color: dark ? red[500] : red[900],
            '&:hover': {
                borderColor: dark ? red[900] : red[700],
            },
        },
    }
})
export function extendsTheme(extend: (theme: Theme) => ThemeOptions) {
    return (theme: Theme) => merge(cloneDeep(theme), extend(theme))
}
