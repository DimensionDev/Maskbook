import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    icon: {},
}))

export interface ImageIconProps extends withClasses<'icon'> {
    size?: number
    icon?: URL | string
}

export function ImageIcon(props: ImageIconProps) {
    const { size = 48, icon } = props
    const classes = useStylesExtends(useStyles(), props)
    return <img height={size} width={size} src={icon?.toString()} className={classes.icon} />
}
