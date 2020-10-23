import { useMemo } from 'react'
import { ValueRef, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { unstable_createMuiStrictModeTheme, ThemeProvider } from '@material-ui/core'
import { useMaskbookTheme } from '../../../utils/theme'
import type { SocialNetworkUICustomUI } from '../../../social-network/ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { composeAnchorSelector } from '../utils/selector'
import React from 'react'
import { toRGB, getBackgroundColor, fromRGB, shade, isDark } from '../../../utils/theme-tools'
import { Appearance } from '../../../settings/settings'
import produce from 'immer'

const primaryColorRef = new ValueRef(toRGB([29, 161, 242]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

export function startWatchThemeColor() {
    function updateThemeColor() {
        const color = getBackgroundColor(composeAnchorSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)

        if (color) {
            primaryColorRef.value = color
        }
        if (backgroundColor) {
            backgroundColorRef.value = backgroundColor
        }
    }
    new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({
            childList: true,
            subtree: true,
        })
}
function useTheme() {
    const backgroundColor = useValueRef(backgroundColorRef)
    const primaryColor = useValueRef(primaryColorRef)
    const MaskbookTheme = useMaskbookTheme({
        theme: isDark(fromRGB(backgroundColor)!) ? Appearance.dark : Appearance.light,
    })
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const TwitterTheme = produce(MaskbookTheme, (theme) => {
            theme.palette.background.paper = backgroundColor
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: theme.palette.getContrastText(backgroundColor),
            }
            theme.shape.borderRadius = 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.overrides = theme.overrides || {}
            theme.overrides!.MuiButton = {
                root: {
                    borderRadius: 500,
                    textTransform: 'initial',
                    fontWeight: 'bold',
                    minHeight: 39,
                    boxShadow: 'none',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                        boxShadow: 'none',
                        backgroundColor: theme.palette.primary.dark,
                    },
                    [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                        '&': {
                            height: '28px !important',
                            minHeight: 'auto !important',
                            padding: '0 14px !important',
                        },
                    },
                },
                disabled: {
                    boxShadow: 'none',
                    opacity: 0.5,
                    color: 'rgb(255, 255, 255)',
                    backgroundColor: theme.palette.primary.light,
                },
            }
            theme.overrides!.MuiTab = {
                root: {
                    textTransform: 'none',
                },
            }
        })
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [MaskbookTheme, backgroundColor, primaryColor])
}

export function TwitterThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    if (!process.env.STORYBOOK) throw new Error('This API is only for Storybook!')
    return React.createElement(ThemeProvider, { theme: useTheme(), ...props })
}

export const twitterUICustomUI: SocialNetworkUICustomUI = {
    useTheme,
}
