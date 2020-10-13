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
        return unstable_createMuiStrictModeTheme({
            ...MaskbookTheme,
            palette: {
                ...MaskbookTheme.palette,
                background: {
                    ...MaskbookTheme.palette.background,
                    paper: backgroundColor,
                },
                primary: {
                    ...MaskbookTheme.palette.primary,
                    light: toRGB(shade(primaryColorRGB, 10)),
                    main: toRGB(primaryColorRGB),
                    dark: toRGB(shade(primaryColorRGB, -10)),
                },
            },
            shape: {
                borderRadius: 15,
            },
            breakpoints: {
                values: { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 },
            },
            overrides: {
                MuiButton: {
                    root: {
                        borderRadius: 500,
                        textTransform: 'none',
                    },
                },
                MuiTab: {
                    root: {
                        textTransform: 'none',
                    },
                },
            },
        })
    }, [MaskbookTheme, backgroundColor, primaryColor])
}

export function TwitterThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    return React.createElement(ThemeProvider, { theme: useTheme(), children: props.children })
}

export const twitterUICustomUI: SocialNetworkUICustomUI = {
    useTheme,
}
