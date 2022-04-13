import type { PaletteMode } from '@mui/material'
import { kebabCase } from 'lodash-unified'
import { LightColor, DarkColor } from './constants'
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
    for (const key in ns) {
        // --mask-name: val;
        result[`--mask-${kebabCase(key)}`] = ns[key]
        result[`--mask-${kebabCase(key)}-fragment`] = getRGBFragment(ns, key)
    }
    return { ':root, :host': result }
}

export function applyMaskColorVars(node: HTMLElement, scheme: PaletteMode) {
    const ns: Record<string, string> = scheme === 'light' ? LightColor : DarkColor
    if (node === document.body) {
        const id = '#mask-style-var'
        if (!document.getElementById(id)) {
            const style = document.createElement('style')
            style.id = id
            document.head.appendChild(style)
        }
        applyMaskColorVars(document.getElementById(id)!, scheme)
        return
    } else if (node instanceof HTMLStyleElement) {
        let rule = ':root, :host {\n'
        for (const key in ns) {
            // --mask-name: val;
            rule += `    --mask-${kebabCase(key)}: ${ns[key]};\n`
            rule += `    --mask-${kebabCase(key)}-fragment: ${getRGBFragment(ns, key)};\n`
        }
        node.textContent = rule + '}'
    } else {
        for (const key in ns) {
            node.style.setProperty('--mask-' + kebabCase(key), ns[key])
            node.style.setProperty('--mask-' + kebabCase(key) + '-fragment', getRGBFragment(ns, key))
        }
    }
}
