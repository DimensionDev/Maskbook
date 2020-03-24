import { useState, useEffect } from 'react'
import { ValueRef, MutationObserverWatcher } from '@holoflows/kit'
import { Theme, createMuiTheme, ThemeProvider } from '@material-ui/core'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../../../utils/theme'
import { SocialNetworkUICustomUI } from '../../../social-network/ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { composeAnchorSelector } from '../utils/selector'
import React from 'react'

type RGB = [number, number, number]

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
    const [theme, setTheme] = useState<Theme>(MaskbookLightTheme)
    const primaryColor = useValueRef(primaryColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)

    useEffect(() => {
        const MaskbookTheme = isDark(fromRGB(backgroundColor)!) ? MaskbookDarkTheme : MaskbookLightTheme
        const primaryColorRGB = fromRGB(primaryColor)!
        setTheme(
            createMuiTheme({
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
                breakpoints: {
                    values: { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 },
                },
            }),
        )
    }, [primaryColor, backgroundColor])
    return theme
}

export function TwitterThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    return React.createElement(ThemeProvider, { theme: useTheme(), children: props.children })
}

function isDark([r, g, b]: RGB) {
    return r < 68 && g < 68 && b < 68
}

function toRGB(channels: RGB | undefined) {
    if (!channels) return ''
    return `rgb(${channels.join()})`
}

function fromRGB(rgb: string): RGB | undefined {
    const matched = rgb.match(/rgb\(\s*(\d+?)\s*,\s*(\d+?)\s*,\s*(\d+?)\s*\)/)
    if (matched) {
        const [_, r, g, b] = matched
        return [parseInt(r), parseInt(g), parseInt(b)]
    }
    return
}

function clamp(num: number, min: number, max: number) {
    if (num < min) return min
    if (num > max) return max
    return num
}

function shade(channels: RGB, percentage: number): RGB {
    return channels.map((c) => clamp(Math.floor((c * (100 + percentage)) / 100), 0, 255)) as RGB
}

function getBackgroundColor(element: HTMLElement | HTMLBodyElement) {
    const color = getComputedStyle(element).backgroundColor
    return color ? toRGB(fromRGB(color)) : ''
}

export const twitterUICustomUI: SocialNetworkUICustomUI = {
    useTheme,
}
