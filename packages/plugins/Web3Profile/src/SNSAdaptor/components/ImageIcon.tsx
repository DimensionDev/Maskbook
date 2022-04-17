import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        icon: {
            borderRadius: '50%',
        },
    }
})

export interface ImageIconProps extends withClasses<'icon'> {
    size?: number
    icon?: URL | string
    borderRadius?: string
}

export function ImageIcon(props: ImageIconProps) {
    const { size = 48, icon, borderRadius = '50%' } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <img
            height={size}
            width={size}
            src={icon?.toString()}
            className={classes.icon}
            style={{ borderRadius: borderRadius }}
        />
    )
}
