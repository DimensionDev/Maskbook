import { cloneElement, FC, memo, useMemo } from 'react'
import icons, { IconType, iconsWithDynamicColor } from './icon-data'

export interface IconProps extends React.HTMLProps<HTMLSpanElement> {
    type?: IconType
    iconUrl?: string
    size?: number
    color?: string
}

export const Icon: FC<IconProps> = memo(({ type, iconUrl, size, className, style, color, ...rest }) => {
    const iconSize = size ?? 24
    const isDynamicColor = type && iconsWithDynamicColor.includes(type)
    const iconStyle = useMemo(() => {
        const bg = isDynamicColor
            ? null
            : {
                  backgroundImage: `url(${iconUrl ?? icons[type!]})`,
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
    }, [iconSize, iconUrl, type, isDynamicColor, color])

    if (isDynamicColor) {
        return cloneElement(icons[type] as JSX.Element, {
            ariaHidden: true,
            ...rest,
            style: iconStyle,
        })
    }
    return <span aria-hidden="true" {...rest} className={className} style={iconStyle} />
})

export { icons }

export type { IconType }
