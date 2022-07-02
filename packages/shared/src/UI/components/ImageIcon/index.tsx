import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        icon: {},
    }
})

export interface ImageIconProps extends withClasses<'icon'> {
    size?: number
    icon?: URL | string
    iconFilterColor?: string
}

export function ImageIcon(props: ImageIconProps) {
    const { size = 48, icon, iconFilterColor } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <img
            height={size}
            width={size}
            src={icon?.toString()}
            className={classes.icon}
            style={
                iconFilterColor
                    ? {
                          filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`,
                          backdropFilter: 'blur(16px)',
                      }
                    : {}
            }
        />
    )
}
