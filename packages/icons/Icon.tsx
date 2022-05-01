import { cloneElement, FC, memo, useContext, useMemo } from 'react'
import { useTheme } from '@mui/material'
import icons, { IconType, iconsWithDynamicColor } from './icon-data'
import { MaskIconPaletteContext } from './utils/MaskIconPaletteContext'

export interface IconProps extends React.HTMLProps<HTMLSpanElement> {
    type?: IconType
    iconUrl?: string
    size?: number
    color?: string
}

export const Icon: FC<IconProps> = memo(({ type, iconUrl, size, style, color, ...rest }) => {
    const iconSize = size ?? 24
    const isDynamicColor = type && iconsWithDynamicColor.includes(type)
    const palette = useContext(MaskIconPaletteContext)
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'

    const iconType = useMemo(() => {
        if (!type) return
        let newType = type
        if (isDarkMode) {
            newType = `${type}.dim` as IconType
            if (palette !== 'dim' || !icons[newType]) {
                newType = `${type}.dark` as IconType
            }
        }
        return icons[newType] ? newType : type
    }, [type, palette, isDarkMode])

    const iconStyle = useMemo(() => {
        const bg = isDynamicColor
            ? null
            : {
                  backgroundImage: `url(${iconUrl ?? icons[iconType!]})`,
                  backgroundSize: `${iconSize}px`,
              }
        return {
            display: 'inline-block',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            flexShrink: 0,
            height: `${iconSize}px`,
            width: `${iconSize}px`,
            color,
            ...bg,
            ...style,
        }
    }, [iconSize, iconUrl, iconType, isDynamicColor, color])

    if (isDynamicColor) {
        return cloneElement(icons[type] as JSX.Element, {
            'aria-hidden': true,
            ...rest,
            style: iconStyle,
        })
    }
    return <span aria-hidden="true" {...rest} style={iconStyle} />
})

export { icons }

export type { IconType }
