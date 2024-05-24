import { useTheme, SvgIcon } from '@mui/material'
import * as React from 'react'

/**
 * Create an icon from svg fragment
 * @param {string} name Name of the Icon
 * @param {import('./index.js').SvgIconRaw} svg SVG content. Do not include <svg> tag
 * @param {string | undefined} viewBox The viewbox
 * @param {import('.').Size} defaultSize Only use this when the icon is not square. Unit: px
 * @returns {typeof SvgIcon} A component that same type as icons from @mui/icons-material
 */
export function createIcon(name, svg, viewBox, defaultSize) {
    const [width, height] = defaultSize || []
    if (width === height && typeof width === 'number') throw new Error('Only define this when the icon is not a square')

    /** @type {import('react').ComponentType<import('@mui/material').SvgIconProps>} */ let Icon
    if (typeof svg === 'function') {
        Icon = ({ sx, ref, ...props }) => {
            const style = defaultSize ? { width, height, ...sx } : sx
            return React.createElement(SvgIcon, { viewBox, ...props, ref, sx: style }, svg(useTheme()))
        }
    } else {
        Icon = ({ sx, ref, ...props }) => {
            const style = defaultSize ? { width, height, ...sx } : sx
            return React.createElement(SvgIcon, { viewBox, ...props, ref, sx: style }, svg)
        }
    }
    Icon.displayName = `Icon (${name})`
    return /** @type {any} */ (React.memo(Icon))
}
