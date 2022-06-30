import { useTheme } from '@mui/material'
import * as React from 'react'
import { MaskIconPaletteContext } from './MaskIconPaletteContext.js'

/**
 * @typedef {[currentVariant: null | string[], url: string, jsx: object | null, isColorful?: boolean]} RawIcon
 */

/**
 * @param {string} name
 * @param {Array<RawIcon>} variants isMono means the icon doesn't have it's own color.
 * @returns {React.ComponentType<import('./internal').GeneratedIconProps>}
 */
export function __createIcon(name, variants) {
    function Icon(/** @type {import('./internal').GeneratedIconProps} */ props, ref) {
        const { size = 24, variant, color, style, ...rest } = props
        const defaultPalette = useDefaultPalette()
        const selected = selectVariant(variants, variant || defaultPalette)
        const [, url, jsx, isColorful] = selected

        const iconStyle = React.useMemo(() => {
            const bg = !isColorful
                ? null
                : {
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'contain',
                  }
            return {
                display: 'inline-block',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                flexShrink: 0,
                height: `${size}px`,
                width: `${size}px`,
                color,
                ...bg,
                ...style,
            }
        }, [selected, size, style])

        if (isColorful && jsx) {
            return React.cloneElement(jsx, {
                'aria-hidden': true,
                ...rest,
                ref,
                style: iconStyle,
            })
        }
        return React.createElement('span', {
            'aria-hidden': true,
            ...rest,
            ref,
            style: iconStyle,
        })
    }
    Icon.displayName = name
    return React.memo(React.forwardRef(Icon))
}

function useDefaultPalette() {
    const palette = React.useContext(MaskIconPaletteContext)

    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    if (isDarkMode && palette === 'dim') return 'dim'
    return theme.palette.mode
}

/**
 * @param {Array<RawIcon>} variants
 * @param {string} palette
 */
function selectVariant(variants, palette) {
    if (variants.length === 1) return variants[0]

    const light = variants.find((x) => x[0] === null || x[0].includes('light'))
    // x.0 null means light
    const dark = variants.find((x) => x?.[0]?.includes('dark'))
    const dim = variants.find((x) => x?.[0]?.includes('dim'))

    if (palette === 'light') return light || dark || dim || variants[0]
    if (palette === 'dark') return dark || dim || light || variants[0]
    if (palette === 'dim') return dim || dark || light || variants[0]
    return variants[0]
}
