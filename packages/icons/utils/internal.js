import { useTheme, Box } from '@mui/material'
import * as React from 'react'
import { MaskIconPaletteContext } from './MaskIconPaletteContext.js'

const supportCSSAspectRatio = (() => {
    try {
        return CSS.supports('aspect-ratio: 1')
    } catch {
        return false
    }
})()
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
    const intrinsicAspectRatio = intrinsicSize[0] / intrinsicSize[1]

    function Icon(/** @type {import('./internal').GeneratedIconProps} */ props, ref) {
        let { size = 24, variant, color, sx, height, width, ...rest } = props

        if (intrinsicAspectRatio !== 1 && props.size) {
            console.warn(`Icon ${name} is not a square. Please use height or width property instead of size.`)
        }
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
                aspectRatio: `${intrinsicSize[0] / intrinsicSize[1]}`,
                color,
            }
            if (hasClickHandler) base.cursor = 'pointer'

            if (intrinsicAspectRatio !== 1 && !width && !height) height = 24
            if (!supportCSSAspectRatio) {
                if (height && !width) width = (height || 24) * intrinsicAspectRatio
                if (width && !height) height = (width || 24) / intrinsicAspectRatio
            }
            if (intrinsicAspectRatio === 1) {
                base.height = height || size
                base.width = width || size
            } else {
                if (height) base.height = height
                if (width) base.width = width
            }

            return {
                ...base,
                ...bg,
                ...sx,
            }
        }, [selected, size, sx, hasClickHandler])

        const iconProps = {
            'aria-hidden': true,
            'aria-role': undefined,
            ...rest,
            ref,
            sx: iconStyle,
        }
        if (hasClickHandler) {
            iconProps['aria-hidden'] = false
            iconProps['aria-role'] = 'button'
        }
        if (supportColor && jsx) {
            iconProps.component = 'svg'
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
