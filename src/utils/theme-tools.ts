type RGB = [number, number, number]
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

export function getBackgroundColor(element: HTMLElement | HTMLBodyElement) {
    const color = getComputedStyle(element).backgroundColor
    return color ? toRGB(fromRGB(color)) : ''
}

export function isDarkTheme(element: HTMLElement = document.body) {
    const rgb = fromRGB(getComputedStyle(element).backgroundColor)
    if (!rgb) return true
    return isDark(rgb)
}
