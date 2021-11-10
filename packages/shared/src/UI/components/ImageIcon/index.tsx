import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '../..'

const useStyles = makeStyles()((theme) => {
    return {
        icon: {
            borderRadius: '50%',
            backgroundColor: theme.palette.background.paper,
        },
    }
})

export interface ImageIconProps extends withClasses<'icon'> {
    size?: number
    icon: string
}

export function ImageIcon(props: ImageIconProps) {
    const { size = 48, icon } = props
    const classes = useStylesExtends(useStyles(), props)
    return <img height={size} width={size} src={icon} className={classes.icon} />
}
