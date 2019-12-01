import { useState, useEffect, useLayoutEffect } from 'react'
import { Theme, createMuiTheme } from '@material-ui/core'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../../../utils/theme'
import { SocialNetworkUICustomUI } from '../../../social-network/ui'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(MaskbookLightTheme)
    const primaryColor = usePrimaryColor()
    const backgroundColor = useBackgroundColor()

    useEffect(() => {
        const MaskbookTheme = isDark(fromRGB(backgroundColor)!) ? MaskbookDarkTheme : MaskbookLightTheme
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
                        light: shade(fromRGB(primaryColor)!, 10),
                        main: primaryColor,
                        dark: shade(fromRGB(primaryColor)!, -10),
                    },
                },
            }),
        )
    }, [primaryColor, backgroundColor])
    return theme
}

function usePrimaryColor() {
    const [primaryColor, setPrimaryColor] = useState(toRGB([29, 161, 242]))
    useLayoutEffect(() => {
        const timer = setInterval(() => {
            const color = getBackgroundColor<HTMLAnchorElement>('a[href="/compose/tweet"]')
            if (color) {
                setPrimaryColor(color)
            }
        }, 2000)
        return () => clearInterval(timer)
    }, [primaryColor])
    return primaryColor
}

function useBackgroundColor() {
    const [backgroundColor, setBackgroundColor] = useState(toRGB([255, 255, 255]))
    useLayoutEffect(() => {
        const timer = setInterval(() => {
            const color = getBackgroundColor<HTMLBodyElement>('body')
            if (color) {
                setBackgroundColor(color)
            }
        }, 2000)
        return () => clearInterval(timer)
    }, [backgroundColor])
    return backgroundColor
}

function isDark([r, g, b]: [number, number, number]) {
    return r < 68 && g < 68 && b < 68
}

function toRGB(channels: [number, number, number]) {
    return `rgb(${channels.join()})`
}

function fromRGB(rgb: string): [number, number, number] | undefined {
    const matched = rgb.match(/rgb\(\s*(\d+?)\s*,\s*(\d+?)\s*,\s*(\d+?)\s*\)/)
    if (matched) {
        const [_, r, g, b] = matched
        return [parseInt(r), parseInt(g), parseInt(b)]
    }
}

function clamp(num: number, min: number, max: number) {
    if (num < min) return min
    if (num > max) return max
    return num
}

function shade(channels: [number, number, number], percentage: number) {
    return `rgb(${channels.map(c => clamp(Math.floor((c * (100 + percentage)) / 100), 0, 255)).join()})`
}

function getBackgroundColor<T extends HTMLElement>(selector: string) {
    if (!document) return ''
    const element = document.querySelector<T>(selector)
    if (!element) return ''
    // @ts-ignore CSSOM
    const color = String(element.computedStyleMap?.()?.get?.('background-color') ?? element?.style?.backgroundColor)
    return toRGB(fromRGB(color)!)
}

export const twitterUICustomUI: SocialNetworkUICustomUI = {
    useTheme,
}
