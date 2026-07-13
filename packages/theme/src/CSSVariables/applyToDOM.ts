import type { PaletteMode } from '@mui/material'
import { kebabCase } from 'lodash-es'
import { LightColor, DarkColor } from './constants.js'
import tinyColor from 'tinycolor2'

// Fragment are in the form of "1, 2, 3"
// which is used for rgba(var(--x), alpha)
function getRGBFragment(x: Record<string, string>, key: string) {
    const { r, g, b } = tinyColor(x[key]).toRgb()
    return [r, g, b].join(', ')
}
export function CSSVariableInjectorCSS(scheme: PaletteMode) {
    const ns: Record<string, string> = scheme === 'light' ? LightColor : DarkColor
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(ns)) {
        // --mask-name: val;
        result[`--mask-${kebabCase(key)}`] = value
        result[`--mask-${kebabCase(key)}-fragment`] = getRGBFragment(ns, key)
    }
    return {
        ':root, :host': result,
        // TODO doesn't work on components that mounted in portal
        '[data-hide-scrollbar]': {
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    } as const
}

export function applyMaskColorVars(node: HTMLElement, scheme: PaletteMode) {
    const ns: Record<string, string> = scheme === 'light' ? LightColor : DarkColor
    if (node === document.body) {
        const id = '#mask-style-var'
        if (!document.querySelector(id)) {
            const style = document.createElement('style')
            style.id = id
            document.head.append(style)
        }
        applyMaskColorVars(document.querySelector(id)!, scheme)
        return
    } else if (node instanceof HTMLStyleElement) {
        let rule = ':root, :host {\n'
        for (const [key, value] of Object.entries(ns)) {
            // --mask-name: val;
            rule += `    --mask-${kebabCase(key)}: ${value};\n`
            rule += `    --mask-${kebabCase(key)}-fragment: ${getRGBFragment(ns, key)};\n`
        }
        node.textContent = rule + '}'
    } else {
        for (const [key, value] of Object.entries(ns)) {
            node.style.setProperty('--mask-' + kebabCase(key), value)
            node.style.setProperty('--mask-' + kebabCase(key) + '-fragment', getRGBFragment(ns, key))
        }
    }
}
