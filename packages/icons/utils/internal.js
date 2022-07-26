import { useTheme, Box } from '@mui/material'
import * as React from 'react'
import { MaskIconPaletteContext } from './MaskIconPaletteContext.js'

/**
 * @typedef {[currentVariant: null | string[], url: string, jsx: object | null, supportColor?: boolean]} RawIcon
 */

/**
 * @param {string} name
 * @param {Array<RawIcon>} variants
 * @param {[number, number]} intrinsicSize
 * @returns {React.ComponentType<import('./internal').GeneratedIconProps>}
 */
export function __createIcon(name, variants, intrinsicSize = [24, 24]) {
    function Icon(/** @type {import('./internal').GeneratedIconProps} */ props, ref) {
        /* eslint-disable */
        let { size = 24, variant, color, sx, height, width, ...rest } = props

        const hasClickHandler = rest.onClick

        const defaultPalette = useDefaultPalette()
        const selected = selectVariant(variants, variant || defaultPalette)
        const [, url, jsx, supportColor] = selected

        const iconStyle = React.useMemo(() => {
            const bg = supportColor
                ? null
                : {
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'contain',
                  }
            const base = {
                display: 'inline-block',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                flexShrink: 0,
                aspectRatio: String(intrinsicSize[0] / intrinsicSize[1]),
                color,
                height: height ?? size,
                width: width ?? size,
            }
            if (hasClickHandler) base.cursor = 'pointer'

            return {
                ...base,
                ...bg,
                ...sx,
            }
        }, [selected, size, sx, hasClickHandler])

        const iconProps = {
            'aria-hidden': true,
            ...rest,
            ref,
            'data-icon': name,
            sx: iconStyle,
            // To align icon center.
            fontSize: 0,
        }
        if (hasClickHandler) {
            iconProps['aria-hidden'] = false
            iconProps['role'] = 'button'
        }
        if (supportColor && jsx) {
            iconProps.component = 'span'
            return React.createElement(Box, iconProps, jsx)
        }
        iconProps.component = 'span'
        return React.createElement(Box, iconProps)
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
