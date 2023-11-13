import { memo, type HTMLProps, type CSSProperties } from 'react'

export interface ImageIconProps extends HTMLProps<HTMLImageElement> {
    size?: number
    icon?: string
    iconFilterColor?: string
}

export const ImageIcon = memo(function ImageIcon({ size = 48, icon, iconFilterColor, ...rest }: ImageIconProps) {
    const style: CSSProperties | undefined =
        iconFilterColor ?
            {
                filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`,
                backdropFilter: 'blur(16px)',
                ...rest.style,
            }
        :   rest.style

    return <img height={size} width={size} src={icon?.toString()} {...rest} style={style} />
})
