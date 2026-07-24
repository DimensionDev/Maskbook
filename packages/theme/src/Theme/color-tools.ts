import { clamp } from 'lodash-es'

type RGB = [number, number, number]
type RGBA = [number, number, number, number]

export function toRGB(channels: RGB | undefined) {
    if (!channels) return ''
    return `rgb(${channels.join(',')})`
}

export function fromRGB(rgb: string): RGB | undefined {
    const matched = /rgb\(\s*(\d+?)\s*,\s*(\d+?)\s*,\s*(\d+?)\s*\)/u.exec(rgb)
    if (matched) {
        const [_, r, g, b] = matched
        return [Number.parseInt(r, 10), Number.parseInt(g, 10), Number.parseInt(b, 10)]
    }
    return
}

export function shade(channels: RGB, percentage: number): RGB {
    return channels.map((c) => clamp(Math.floor((c * (100 + percentage)) / 100), 0, 255)) as RGB
}

function fromRGBAtoRGB(color: string): string {
    const matched = /^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d*(?:\.\d+)?)\)$/u.exec(color)
    if (matched) {
        const [_, r, g, b, a] = matched
        const rgba: RGBA = [
            Number.parseInt(r, 10),
            Number.parseInt(g, 10),
            Number.parseInt(b, 10),
            Number.parseInt(a, 10),
        ]

        return toRGB(shade(rgba.slice(0, 3) as RGB, rgba[3] * 100))
    }

    return ''
}

function isRGBA(color: string) {
    return /^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d*(?:\.\d+)?)\)$/u.exec(color)
}

export function getBackgroundColor(element: HTMLElement | HTMLBodyElement | undefined) {
    if (!element) return ''
    const color = getComputedStyle(element).backgroundColor
    if (isRGBA(color)) {
        return fromRGBAtoRGB(color)
    }
    return color ? toRGB(fromRGB(color)) : ''
}
