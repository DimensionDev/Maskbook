import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import type { SocialNetworkUI } from '../../../social-network'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme'
import { isMobileTwitter } from '../utils/isMobile'
import { composeAnchorSelector, composeAnchorTextSelector, headingTextSelector } from '../utils/selector'

const themeColorRef = new ValueRef('rgb(29, 161, 242)')
const textColorRef = new ValueRef('rgb(255, 255, 255)')
const backgroundColorRef = new ValueRef('rgb(255, 255, 255)')

const currentTheme = new ValueRef<PaletteMode>('light')
export const PaletteModeProviderTwitter: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: createSubscriptionFromValueRef(currentTheme),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const composeAnchor = composeAnchorSelector().evaluate()
        const anchorText = composeAnchorTextSelector().evaluate()
        const headingText = headingTextSelector().evaluate()
        const themeColor = getBackgroundColor(composeAnchor)
        const textColor = getForegroundColor(anchorText || headingText)
        const backgroundColor = getBackgroundColor(document.body)
        currentTheme.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'

        if (themeColor) themeColorRef.value = themeColor
        if (textColor) textColorRef.value = textColor
        if (backgroundColor) backgroundColorRef.value = backgroundColor
    }
    new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({ childList: true, subtree: true }, signal)

    if (isMobileTwitter) {
        new MutationObserverWatcher(headingTextSelector())
            .addListener('onAdd', updateThemeColor)
            .addListener('onChange', updateThemeColor)
            .startWatch({ childList: true, subtree: true }, signal)
    }
}
export function useThemeTwitterVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(themeColorRef)
    const primaryContrastColor = useValueRef(textColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const TwitterTheme = produce(baseTheme, (theme) => {
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = isMobileTwitter ? 0 : 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}

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
                            backgroundColor: `${theme.palette.primary.main} !important`,
                            opacity: 0.9,
                        },
                    },
                },
            }
            theme.components.MuiBackdrop = {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.action.mask,
                    },
                    invisible: {
                        opacity: '0 !important',
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
                    arrow: {
                        color: theme.palette.background.tipMask,
                    },
                },
            }
            theme.components.MuiDialogContent = {
                styleOverrides: {
                    root: {
                        paddingRight: 4,
                        '::-webkit-scrollbar': {
                            backgroundColor: 'transparent',
                            width: 20,
                        },
                        '::-webkit-scrollbar-thumb': {
                            borderRadius: 20,
                            width: 5,
                            border: '7px solid rgba(0, 0, 0, 0)',
                            backgroundColor: theme.palette.maskColor.secondaryLine,
                            backgroundClip: 'padding-box',
                        },
                    },
                },
            }
            theme.components.MuiSnackbar = {
                styleOverrides: {
                    root: {
                        filter: `drop-shadow(0 0 16px ${theme.palette.background.messageShadow});`,
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
