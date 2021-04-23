type RGB = [number, number, number]
type RGBA = [number, number, number, number]

export function isDark([r, g, b]: RGB) {
    return r < 68 && g < 68 && b < 68
}

export function toRGB(channels: RGB | undefined) {
    if (!channels) return ''
    return `rgb(${channels.join()})`
}

export function fromRGB(rgb: string): RGB | undefined {
    const matched = rgb.match(/rgb\(\s*(\d+?)\s*,\s*(\d+?)\s*,\s*(\d+?)\s*\)/)
    if (matched) {
        const [_, r, g, b] = matched
        return [parseInt(r), parseInt(g), parseInt(b)]
    }
    return
}

export function clamp(num: number, min: number, max: number) {
    if (num < min) return min
    if (num > max) return max
    return num
}

export function shade(channels: RGB, percentage: number): RGB {
    return channels.map((c) => clamp(Math.floor((c * (100 + percentage)) / 100), 0, 255)) as RGB
}

function fromRGBAtoRGB(color: string): string {
    const matched = color.match(/^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d*(?:\.\d+)?)\)$/)
    if (matched) {
        const [_, r, g, b, a] = matched
        const rgba: RGBA = [parseInt(r), parseInt(g), parseInt(b), parseInt(a)]

        return toRGB(shade(rgba.slice(0, 3) as RGB, rgba[3] * 100))
    }

    return ''
}

function isRGBA(color: string) {
    return color.match(/^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d*(?:\.\d+)?)\)$/)
}

export function getBackgroundColor(element: HTMLElement | HTMLBodyElement) {
    const color = getComputedStyle(element).backgroundColor
    if (isRGBA(color)) {
        return fromRGBAtoRGB(color)
    }
    return color ? toRGB(fromRGB(color)) : ''
}

export function getForegroundColor(element: HTMLElement | HTMLBodyElement) {
    const color = getComputedStyle(element).color
    if (isRGBA(color)) {
        return fromRGBAtoRGB(color)
    }
    return color ? toRGB(fromRGB(color)) : ''
}

export function isDarkTheme(element: HTMLElement = document.body) {
    const color = getComputedStyle(element).backgroundColor
    let rgb: RGB | undefined
    if (isRGBA(color)) {
        rgb = fromRGB(fromRGBAtoRGB(color)!)
    } else {
        rgb = fromRGB(color)
    }
    if (!rgb) return true
    return isDark(rgb)
}
