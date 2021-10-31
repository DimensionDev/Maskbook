import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()({
    image: {
        width: 24,
        height: 24,
    },
})

export interface PluginIconProps {}

export function PluginIcon(props: PluginIconProps) {
    const { classes } = useStyles()
    const iconURL = new URL('../../assets/flow.png', import.meta.url).toString()
    return <img className={classes.image} src={iconURL} />
}
